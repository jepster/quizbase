import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { OpenAI } from 'openai';
import { MongoClient } from 'mongodb';

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

interface Category {
  name: string;
  folder: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class WebsocketGateway {
  @WebSocketServer()
  server: Server;

  private rooms: Map<string, Room> = new Map();
  private categories: Category[];
  private questionsNumberInGame: number = 10;

  private readonly mongoUri = 'mongodb://root:example@localhost:27017';
  private readonly dbName = 'quizbase';
  private readonly collectionName = 'trivia_questions';

  constructor() {
    this.loadCategories();
  }

  private loadCategories() {
    const categoriesPath = path.join(
      __dirname,
      '../src/questions/categories.yml',
    );
    const fileContents = fs.readFileSync(categoriesPath, 'utf8');
    const data = yaml.load(fileContents) as { categories: Category[] };
    this.categories = data.categories;
  }

  @SubscribeMessage('difficultySelected')
  async handleDifficultySelected(
    client: Socket,
    payload: { roomId: string; difficulty: string },
  ): Promise<void> {
    const room = this.rooms.get(payload.roomId);
    if (room) {
      const category = this.categories.find(
        (c) => c.name === room.selectedCategory,
      );

      room.difficulty = payload.difficulty;

      let categoryName = category.name;
      let roomDifficulty = room.difficulty;

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
    });
    return roomId;
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
      this.server
        .to(payload.roomId)
        .emit('playerJoined', { players: room.players, roomId: room.id });
    }
  }

  @SubscribeMessage('playerReady')
  handlePlayerReady(client: Socket, roomId: string): void {
    const room = this.rooms.get(roomId);
    if (room) {
      const player = room.players.find((p) => p.id === client.id);
      if (player) {
        player.ready = true;
        this.server.to(roomId).emit('playerReady', room.players);
        if (room.players.every((p) => p.ready)) {
          this.startCategorySelection(room);
        }
      }
    }
  }

  private startCategorySelection(room: Room): void {
    room.categorySelectionIndex = 0;
    this.server.to(room.id).emit('selectCategory', {
      categories: this.categories,
      playerIndex: room.categorySelectionIndex,
      playerName: room.players[room.categorySelectionIndex].name,
    });
  }

  @SubscribeMessage('categorySelected')
  handleCategorySelected(
    client: Socket,
    payload: { roomId: string; categoryName: string },
  ): void {
    const room = this.rooms.get(payload.roomId);
    if (room) {
      room.selectedCategory = payload.categoryName;
      this.server.to(room.id).emit('selectDifficulty', {
        categoryName: room.selectedCategory,
        playerIndex: room.categorySelectionIndex,
        playerName: room.players[room.categorySelectionIndex].name,
        difficulty: room.difficulty,
      });
    }
  }

  private showResultAfterLastReply(room: Room): void {
    if (room.currentQuestionIndex < this.questionsNumberInGame) {
      this.server.to(room.id).emit('showResultAfterLastReply', room.players);
    }
  }

  private askNextQuestion(room: Room): void {
    if (room.currentQuestionIndex < this.questionsNumberInGame) {
      const question = room.questions[room.currentQuestionIndex];
      room.players.forEach(p => p.answered = false);
      room.answersReceived = 0;
      room.readyForNextQuestion = 0;

      this.server.to(room.id).emit('newQuestion', {
        question: question.question,
        options: question.options,
        categoryName: room.selectedCategory,
        difficulty: room.difficulty,
      });
    } else {
      this.endGame(room);
    }
  }

  @SubscribeMessage('showResultAfterLastReply')
  handleShowResultAfterLastReply(client: Socket, roomId: string): void {
    const room = this.rooms.get(roomId);
    if (room) {
      room.readyForNextQuestion++;
      if (room.readyForNextQuestion === room.players.length) {
        this.showResultAfterLastReply(room);
      }
    }
  }

  @SubscribeMessage('submitAnswer')
  handleSubmitAnswer(
    client: Socket,
    payload: { roomId: string; answerIndex: number },
  ): void {
    const room = this.rooms.get(payload.roomId);
    if (room && room.gameStarted) {
      const player = room.players.find((p) => p.id === client.id);
      player.lastQuestionCorrect = false;
      const question = room.questions[room.currentQuestionIndex];
      if (player && question && !player.answered) {
        player.answered = true;
        if (payload.answerIndex === question.correctIndex) {
          player.score += 1;
          player.lastQuestionCorrect = true;
        }
        room.answersReceived++;

        if (room.answersReceived === room.players.length) {
          this.revealAnswer(room);
        }
      }
    }
  }

  private revealAnswer(room: Room): void {
    const question = room.questions[room.currentQuestionIndex];
    this.server.to(room.id).emit('answerRevealed', {
      correctIndex: question.correctIndex,
      explanation: question.explanation,
      options: question.options,
      leaderboard: room.players.sort((a, b) => b.score - a.score),
    });
  }

  @SubscribeMessage('readyForNextQuestion')
  handleReadyForNextQuestion(client: Socket, roomId: string): void {
    const room = this.rooms.get(roomId);
    if (room) {
      room.readyForNextQuestion++;
      if (room.readyForNextQuestion === room.players.length) {
        room.currentQuestionIndex++;
        this.askNextQuestion(room);
      }
    }
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

  @SubscribeMessage('startNewGame')
  handleStartNewGame(client: Socket, roomId: string): void {
    const room = this.rooms.get(roomId);
    if (room) {
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

  private async getQuestionsFromMongoDB(category: string, difficulty: string): Promise<Question[]> {
    const client = new MongoClient(this.mongoUri);

    try {
      await client.connect();
      const db = client.db(this.dbName);
      const collection = db.collection(this.collectionName);

      const questions = await collection.aggregate([
        { $match: { category: category, difficulty: difficulty } },
        { $sample: { size: this.questionsNumberInGame } }
      ]).toArray();

      return questions.map(q => ({
        question: q.question,
        options: q.options,
        correctIndex: q.correctIndex,
        explanation: q.explanation
      }));
    } catch (error) {
      console.error('Error fetching questions from MongoDB:', error);
      return [];
    } finally {
      await client.close();
    }
  }
}
