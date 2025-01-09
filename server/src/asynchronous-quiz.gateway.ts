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
import { QuestionDbService } from './question-db.service';

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
  player: Player;
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

  constructor(
    private configService: ConfigService,
    private questionDbService: QuestionDbService,
  ) {
    this.mongoUri = this.configService.get('DATABASE_URL');
  }

  handleConnection(client: any, ...args: any[]): any {}

  handleDisconnect(client: any): any {}

  @SubscribeMessage('singlePlayerQuiz:create')
  async createSinglePlayerQuiz(
    client: Socket,
    payload: { category: string; playerName: string; difficulty: string },
  ): Promise<SinglePlayerQuiz> {
    const singlePlayerQuizId = crypto.randomUUID();
    const player: Player = {
      id: client.id,
      name: payload.playerName,
      score: 0,
      ready: false,
      answered: false,
      lastQuestionCorrect: false,
    };
    const questions =
      await this.questionDbService.getQuestionsByCategoryMachineName(
        payload.category,
        payload.difficulty,
      );

    this.singlePlayerQuizzes.set(singlePlayerQuizId, {
      id: singlePlayerQuizId,
      category: payload.category,
      questions: questions,
      currentQuestionIndex: 0,
      gameStarted: false,
      answersReceived: 0,
      categorySelectionIndex: 0,
      readyForNextQuestion: 0,
      difficulty: '',
      questionAnswered: false,
      player: player,
    });
    return this.singlePlayerQuizzes.get(singlePlayerQuizId);
  }

  @SubscribeMessage('readyForNextQuestion')
  private askNextQuestion(client: Socket, roomId: string): void {
    const singlePlayerQuiz = this.singlePlayerQuizzes.get(roomId);
    if (singlePlayerQuiz.currentQuestionIndex < this.questionsNumberInGame) {
      const question =
        singlePlayerQuiz.questions[singlePlayerQuiz.currentQuestionIndex];
      this.server.to(singlePlayerQuiz.id).emit('newQuestion', {
        question: question.question,
        options: question.options,
        category: singlePlayerQuiz.category,
        difficulty: singlePlayerQuiz.difficulty,
        totalQuestionsCount: singlePlayerQuiz.questions.length,
      });
    } else {
      this.endGame(singlePlayerQuiz);
    }
  }

  private endGame(singlePlayerQuiz: SinglePlayerQuiz): void {
    const answeredQuestions = singlePlayerQuiz.questions.slice(
      0,
      singlePlayerQuiz.currentQuestionIndex,
    );
    this.server.to(singlePlayerQuiz.id).emit('gameEnded', {
      results: answeredQuestions,
    });
  }

  // @SubscribeMessage('singlePlayerQuiz:submitAnswer')
  // handleSubmitAnswer(
  //   client: Socket,
  //   payload: { roomId: string; answerIndex: number; currentPlayer: string },
  // ): void {
  //   const room = this.rooms.get(payload.roomId);
  //   if (room && room.gameStarted) {
  //     client.join(room.id);
  //     const player = room.players.find((p) => p.name === payload.currentPlayer);
  //     player.lastQuestionCorrect = false;
  //     const question = room.questions[room.currentQuestionIndex];
  //     if (player && question && !player.answered) {
  //       player.answered = true;
  //       if (payload.answerIndex === question.correctIndex) {
  //         player.score += 1;
  //         player.lastQuestionCorrect = true;
  //       }
  //       room.allPlayersAnsweredQuestion = room.players.every((p) => p.answered);
  //       if (room.allPlayersAnsweredQuestion) {
  //         this.revealAnswer(room);
  //       }
  //     }
  //   }
  // }
}
