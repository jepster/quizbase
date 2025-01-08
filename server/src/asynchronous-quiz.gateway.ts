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
  questionAnswered: boolean;
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
export class AsynchronousQuizGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private singlePlayerQuizzes: Map<string, SinglePlayerQuiz> = new Map();
  private categories: string[];
  private questionsNumberInGame: number = 10;

  private readonly mongoUri = '';
  private readonly dbName = 'quizbase';
  private readonly collectionName = 'trivia_questions';

  constructor(private configService: ConfigService) {
    this.mongoUri = this.configService.get('DATABASE_URL');
  }

  handleConnection(client: any, ...args: any[]): any {}

  handleDisconnect(client: any): any {}

  @SubscribeMessage('createSinglePlayerQuiz')
  createSinglePlayerQuiz(
    client: Socket,
    payload: { category: string },
  ): string {
    const singlePlayerQuizId = crypto.randomUUID();
    this.singlePlayerQuizzes.set(singlePlayerQuizId, {
      id: singlePlayerQuizId,
      category: payload.category,
      questions: [],
      currentQuestionIndex: 0,
      gameStarted: false,
      answersReceived: 0,
      categorySelectionIndex: 0,
      readyForNextQuestion: 0,
      difficulty: '',
      questionAnswered: false,
    });
    return singlePlayerQuizId;
  }
}
