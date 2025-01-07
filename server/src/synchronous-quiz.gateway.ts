import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Collection, MongoClient } from 'mongodb';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PerplexityService } from './perplexity.service';

interface Room {
  id: string;
  players: Player[];
  questions: Question[];
  currentQuestionIndex: number;
  gameStarted: boolean;
  answersReceived: number;
  categorySelectionIndex: number;
  selectedCategory: string;
  readyForNextQuestion: number;
  difficulty: string;
  allPlayersAnsweredQuestion: boolean;
}

interface SinglePlayerQuiz {
  id: string;
  category: string;
  questions: Question[];
  currentQuestionIndex: number;
  gameStarted: boolean;
  answersReceived: number;
  categorySelectionIndex: number;
  readyForNextQuestion: number;
  difficulty: string;
  allPlayersAnsweredQuestion: boolean;
}

interface Player {
  id: string;
  name: string;
  score: number;
  ready: boolean;
  answered: boolean;
  lastQuestionCorrect: boolean;
}

interface Question {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

@Injectable()
@WebSocketGateway({
  cors: { origin: '*' },
  pingInterval: 10000,
  pingTimeout: 5000,
})
export class SynchronousQuizGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private rooms: Map<string, Room> = new Map();
  private singlePlayerQuizzes: Map<string, SinglePlayerQuiz> = new Map();
  private categories: string[];
  private questionsNumberInGame: number = 10;

  private readonly mongoUri = '';
  private readonly dbName = 'quizbase';
  private readonly collectionName = 'trivia_questions';

  constructor(
    private configService: ConfigService,
    private perplexityService: PerplexityService,
  ) {
    this.mongoUri = this.configService.get('DATABASE_URL');
  }

  async loadCategories(): Promise<void> {
    try {
      const collection = await this.getMongoDbCollection();
      const allCategories = await collection.distinct('category');
      this.categories = allCategories.filter((category) => category.length > 1);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }

  @SubscribeMessage('difficultySelected')
  async handleDifficultySelected(
    client: Socket,
    payload: { roomId: string; difficulty: string },
  ): Promise<void> {
    const room = this.rooms.get(payload.roomId);
    if (room) {
      const category = this.categories.find((c) => c === room.selectedCategory);

      room.difficulty = payload.difficulty;

      const categoryName = category;
      const roomDifficulty = room.difficulty;

      room.questions = await this.getQuestionsFromMongoDB(
        categoryName,
        roomDifficulty,
      );
      room.currentQuestionIndex = 0;
      room.gameStarted = true;
      this.askNextQuestion(room);
    }
  }

  @SubscribeMessage('createRoom')
  handleCreateRoom(client: Socket): string {
    const roomId = this.generateFunnyRoomName();
    this.rooms.set(roomId, {
      id: roomId,
      players: [],
      questions: [],
      currentQuestionIndex: 0,
      gameStarted: false,
      answersReceived: 0,
      categorySelectionIndex: 0,
      selectedCategory: '',
      readyForNextQuestion: 0,
      difficulty: '',
      allPlayersAnsweredQuestion: false,
    });
    return roomId;
  }

  @SubscribeMessage('createSinglePlayerQuiz')
  createSinglePlayerQuiz(
    client: Socket,
    payload: { category: string },
  ): string {
    const uniqueId = crypto.randomUUID();
    this.singlePlayerQuizzes.set(uniqueId, {
      id: uniqueId,
      category: payload.category,
      questions: [],
      currentQuestionIndex: 0,
      gameStarted: false,
      answersReceived: 0,
      categorySelectionIndex: 0,
      readyForNextQuestion: 0,
      difficulty: '',
      allPlayersAnsweredQuestion: false,
    });
    return uniqueId;
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    client: Socket,
    payload: { roomId: string; playerName: string },
  ): void {
    const room = this.rooms.get(payload.roomId);
    if (room && !room.gameStarted) {
      const player: Player = {
        id: client.id,
        name: payload.playerName,
        score: 0,
        ready: false,
        answered: false,
        lastQuestionCorrect: false,
      };
      room.players.push(player);
      client.join(payload.roomId);
      this.server.to(payload.roomId).emit('playerJoined', {
        players: room.players,
        roomId: room.id,
        player: player.name,
      });
    }
  }

  @SubscribeMessage('playerReady')
  handlePlayerReady(
    client: Socket,
    payload: { roomId: string; playerName: string },
  ): void {
    const room = this.rooms.get(payload.roomId);
    if (room) {
      const player = room.players.find((p) => p.name === payload.playerName);
      if (player) {
        player.ready = true;
        client.join(room.id);
        this.server
          .to(room.id)
          .emit('playerReady', { players: room.players, player: player.name });

        if (room.players.every((p) => p.ready)) {
          this.startCategorySelection(room);
        }
      }
    }
  }

  @SubscribeMessage('reconnect')
  reconnect(client: Socket, payload: { currentRoom: string }): void {
    const room = this.rooms.get(payload.currentRoom);
    client.join(room.id);

    if (room && !room.gameStarted) {
      this.server
        .to(payload.currentRoom)
        .emit('reconnected', { players: room.players });

      if (room.players.every((p) => p.ready)) {
        this.startCategorySelection(room);
      }
    }
  }

  @SubscribeMessage('categorySelected')
  handleCategorySelected(
    client: Socket,
    payload: { roomId: string; categoryName: string },
  ): void {
    const room = this.rooms.get(payload.roomId);
    if (room) {
      client.join(room.id);
      room.selectedCategory = payload.categoryName;
      this.server.to(room.id).emit('selectDifficulty', {
        categoryName: room.selectedCategory,
        playerIndex: room.categorySelectionIndex,
        playerName: room.players[room.categorySelectionIndex].name,
        difficulty: room.difficulty,
      });
    }
  }

  @SubscribeMessage('createCustomCategory')
  async createCustomCategory(
    client: Socket,
    payload: { categoryName: string },
  ): Promise<void> {
    await this.perplexityService.run(payload.categoryName);
    client.emit('categoryCreated');
  }

  @SubscribeMessage('showResultAfterLastReply')
  handleShowResultAfterLastReply(client: Socket, roomId: string): void {
    const room = this.rooms.get(roomId);
    if (room) {
      client.join(room.id);
      room.readyForNextQuestion++;
      if (room.readyForNextQuestion === room.players.length) {
        this.showResultAfterLastReply(room);
      }
    }
  }

  @SubscribeMessage('submitAnswer')
  handleSubmitAnswer(
    client: Socket,
    payload: { roomId: string; answerIndex: number; currentPlayer: string },
  ): void {
    const room = this.rooms.get(payload.roomId);
    if (room && room.gameStarted) {
      client.join(room.id);
      const player = room.players.find((p) => p.name === payload.currentPlayer);
      player.lastQuestionCorrect = false;
      const question = room.questions[room.currentQuestionIndex];
      if (player && question && !player.answered) {
        player.answered = true;
        if (payload.answerIndex === question.correctIndex) {
          player.score += 1;
          player.lastQuestionCorrect = true;
        }
        room.allPlayersAnsweredQuestion = room.players.every((p) => p.answered);
        if (room.allPlayersAnsweredQuestion) {
          this.revealAnswer(room);
        }
      }
    }
  }

  @SubscribeMessage('readyForNextQuestion')
  handleReadyForNextQuestion(client: Socket, roomId: string): void {
    const room = this.rooms.get(roomId);
    if (room) {
      client.join(roomId);
      room.readyForNextQuestion++;
      if (room.readyForNextQuestion === room.players.length) {
        room.currentQuestionIndex++;
        this.askNextQuestion(room);
      }
    }
  }

  @SubscribeMessage('startNewGame')
  handleStartNewGame(client: Socket, roomId: string): void {
    const room = this.rooms.get(roomId);
    if (room) {
      client.join(roomId);
      room.players.forEach((p) => {
        p.ready = false;
        p.score = 0;
        p.answered = false;
      });
      room.currentQuestionIndex = 0;
      room.gameStarted = false;
      room.answersReceived = 0;
      room.readyForNextQuestion = 0;
      room.selectedCategory = '';
      this.server.to(roomId).emit('newGameStarted', room.players);
    }
  }

  @SubscribeMessage('getGameState')
  handleGetGameState(client: Socket, roomId: string): void {
    const room = this.rooms.get(roomId);
    if (room) {
      client.join(roomId);
      client.emit('gameStateUpdate', {
        players: room.players,
        currentQuestionIndex: room.currentQuestionIndex,
        gameStarted: room.gameStarted,
        selectedCategory: room.selectedCategory,
        difficulty: room.difficulty,
      });
    }
  }

  handleConnection(client: Socket): void {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    console.log(`Client disconnected: ${client.id}`);
  }

  private async startCategorySelection(room: Room): Promise<void> {
    room.categorySelectionIndex = 0;
    await this.loadCategories();
    this.server.to(room.id).emit('selectCategory', {
      categories: this.categories,
      playerIndex: room.categorySelectionIndex,
      playerName: room.players[room.categorySelectionIndex].name,
    });
  }

  private showResultAfterLastReply(room: Room): void {
    if (room.currentQuestionIndex < this.questionsNumberInGame) {
      this.server.to(room.id).emit('showResultAfterLastReply', room.players);
    }
  }

  private askNextQuestion(room: Room): void {
    if (room.currentQuestionIndex < this.questionsNumberInGame) {
      const question = room.questions[room.currentQuestionIndex];
      room.players.forEach((p) => (p.answered = false));
      room.allPlayersAnsweredQuestion = false;
      room.readyForNextQuestion = 0;
      this.server.to(room.id).emit('newQuestion', {
        question: question.question,
        options: question.options,
        categoryName: room.selectedCategory,
        difficulty: room.difficulty,
        totalQuestionsCount: room.questions.length,
      });
    } else {
      this.endGame(room);
    }
  }

  private revealAnswer(room: Room): void {
    const question = room.questions[room.currentQuestionIndex];
    this.server.to(room.id).emit('answerRevealed', {
      correctIndex: question.correctIndex,
      explanation: question.explanation,
      options: question.options,
      leaderboard: room.players.sort((a, b) => b.score - a.score),
      allPlayersAnsweredQuestion: room.allPlayersAnsweredQuestion,
    });
  }

  private endGame(room: Room): void {
    const answeredQuestions = room.questions.slice(
      0,
      room.currentQuestionIndex,
    );
    this.server.to(room.id).emit('gameEnded', {
      results: answeredQuestions,
      leaderboard: room.players.sort((a, b) => b.score - a.score),
    });
  }

  private generateFunnyRoomName(): string {
    const adjectives = [
      'Silly',
      'Wacky',
      'Zany',
      'Goofy',
      'Quirky',
      'Bizarre',
      'Whimsical',
      'Loony',
      'Nutty',
      'Kooky',
      'Spooky',
    ];
    const nouns = [
      'Banana',
      'Unicorn',
      'Pickle',
      'Noodle',
      'Penguin',
      'Waffle',
      'Llama',
      'Kazoo',
      'Flamingo',
      'Sushi',
      'Tiger',
      'Fish',
    ];
    const randomAdjective =
      adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${randomAdjective}${randomNoun}`;
  }

  private async getMongoDbCollection(): Promise<Collection> {
    const client = new MongoClient(this.mongoUri);
    await client.connect();
    const db = client.db(this.dbName);
    return db.collection(this.collectionName);
  }

  private async getQuestionsFromMongoDB(
    category: string,
    difficulty: string,
  ): Promise<Question[]> {
    try {
      const collection = await this.getMongoDbCollection();
      const questions = await collection
        .aggregate([
          { $match: { category: category, difficulty: difficulty } },
          { $sample: { size: this.questionsNumberInGame } },
        ])
        .toArray();

      const uniqueQuestions = this.removeDuplicates(
        questions.map((q) => ({
          question: q.question,
          options: q.options,
          correctIndex: q.correctIndex,
          explanation: q.explanation,
        })),
      );

      const shuffledQuestions = this.shuffleArray(uniqueQuestions);

      return shuffledQuestions;
    } catch (error) {
      console.error('Error fetching questions from MongoDB:', error);
      return [];
    }
  }

  private removeDuplicates(questions: Question[]): Question[] {
    const seen = new Set();
    return questions.filter((q) => {
      const duplicate = seen.has(q.question);
      seen.add(q.question);
      return !duplicate;
    });
  }

  private shuffleArray(array: Question[]): Question[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}
