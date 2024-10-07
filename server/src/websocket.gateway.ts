import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import * as fs from 'fs';
import * as path from 'path';

interface Room {
  id: string;
  players: Player[];
  questions: Question[];
  currentQuestionIndex: number;
  gameStarted: boolean;
  answersReceived: number;
}

interface Player {
  id: string;
  name: string;
  score: number;
  ready: boolean;
  answered: boolean;
}

interface Question {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
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
  private questions: Question[];

  constructor() {
    this.loadQuestions();
  }

  private loadQuestions() {
    const filePath = path.join(__dirname, '../src/questions.json');
    const data = fs.readFileSync(filePath, 'utf8');
    this.questions = JSON.parse(data);
  }

  private generateFunnyRoomName(): string {
    const adjectives = ['Silly', 'Wacky', 'Zany', 'Goofy', 'Quirky', 'Bizarre', 'Whimsical', 'Loony', 'Nutty', 'Kooky'];
    const nouns = ['Banana', 'Unicorn', 'Pickle', 'Noodle', 'Penguin', 'Waffle', 'Llama', 'Kazoo', 'Flamingo', 'Sushi'];
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${randomAdjective}${randomNoun}`;
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
    });
    return roomId;
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: Socket, payload: { roomId: string; playerName: string }): void {
    const room = this.rooms.get(payload.roomId);
    if (room && !room.gameStarted) {
      const player: Player = {
        id: client.id,
        name: payload.playerName,
        score: 0,
        ready: false,
        answered: false,
      };
      room.players.push(player);
      client.join(payload.roomId);
      this.server.to(payload.roomId).emit('playerJoined', { players: room.players, roomId: room.id });
    }
  }

  @SubscribeMessage('playerReady')
  handlePlayerReady(client: Socket, roomId: string): void {
    const room = this.rooms.get(roomId);
    if (room) {
      const player = room.players.find(p => p.id === client.id);
      if (player) {
        player.ready = true;
        this.server.to(roomId).emit('playerReady', room.players);
        if (room.players.every(p => p.ready)) {
          this.startGame(room);
        }
      }
    }
  }

  private startGame(room: Room): void {
    room.gameStarted = true;
    room.questions = this.getRandomQuestions(5);
    room.currentQuestionIndex = 0;
    room.answersReceived = 0;
    room.players.forEach(p => {
      p.score = 0;
      p.answered = false;
    });
    this.askNextQuestion(room);
  }

  private getRandomQuestions(count: number): Question[] {
    const shuffled = [...this.questions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  private askNextQuestion(room: Room): void {
    if (room.currentQuestionIndex < room.questions.length) {
      const question = room.questions[room.currentQuestionIndex];
      room.players.forEach(p => p.answered = false);
      room.answersReceived = 0;
      this.server.to(room.id).emit('newQuestion', {
        question: question.question,
        options: question.options,
      });
    } else {
      this.endGame(room);
    }
  }

  @SubscribeMessage('submitAnswer')
  handleSubmitAnswer(client: Socket, payload: { roomId: string; answerIndex: number }): void {
    const room = this.rooms.get(payload.roomId);
    if (room && room.gameStarted) {
      const player = room.players.find(p => p.id === client.id);
      const question = room.questions[room.currentQuestionIndex];
      if (player && question && !player.answered) {
        player.answered = true;
        if (payload.answerIndex === question.correctIndex) {
          player.score += 1;
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
    room.currentQuestionIndex++;
    setTimeout(() => this.askNextQuestion(room), 5000);
  }

  private endGame(room: Room): void {
    this.server.to(room.id).emit('gameEnded', {
      results: room.questions,
      leaderboard: room.players.sort((a, b) => b.score - a.score),
    });
  }

  @SubscribeMessage('startNewGame')
  handleStartNewGame(client: Socket, roomId: string): void {
    const room = this.rooms.get(roomId);
    if (room) {
      room.players.forEach(p => {
        p.ready = false;
        p.score = 0;
        p.answered = false;
      });
      room.currentQuestionIndex = 0;
      room.gameStarted = false;
      room.answersReceived = 0;
      this.server.to(roomId).emit('newGameStarted', room.players);
    }
  }
}
