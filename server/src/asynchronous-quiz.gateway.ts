import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QuestionDbService } from './question-db.service';
import { SinglePlayerQuizDbService } from './single-player-quiz-db.service';

export interface SinglePlayerQuiz {
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
  private questionsNumberInGame: number = 10;

  constructor(
    private configService: ConfigService,
    private questionDbService: QuestionDbService,
    private singlePlayerQuizDbService: SinglePlayerQuizDbService,
  ) {}

  handleConnection(client: Socket): void {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    console.log(`Client disconnected: ${client.id}`);
  }

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

    const singlePlayerQuiz: SinglePlayerQuiz = {
      id: singlePlayerQuizId,
      category: payload.category,
      questions: questions,
      currentQuestionIndex: 0,
      gameStarted: true,
      answersReceived: 0,
      categorySelectionIndex: 0,
      readyForNextQuestion: 0,
      difficulty: payload.difficulty,
      questionAnswered: false,
      player: player,
    };

    this.singlePlayerQuizzes.set(singlePlayerQuizId, singlePlayerQuiz);
    client.join(singlePlayerQuizId);
    this.askNextQuestion(client, singlePlayerQuizId);
    return singlePlayerQuiz;
  }

  @SubscribeMessage('singlePlayerQuiz:submitAnswer')
  handleSubmitAnswer(
    client: Socket,
    payload: { quizId: string; answerIndex: number },
  ): void {
    const singlePlayerQuiz = this.singlePlayerQuizzes.get(payload.quizId);
    if (singlePlayerQuiz && !singlePlayerQuiz.questionAnswered) {
      const question =
        singlePlayerQuiz.questions[singlePlayerQuiz.currentQuestionIndex];
      singlePlayerQuiz.player.lastQuestionCorrect =
        payload.answerIndex === question.correctIndex;
      if (singlePlayerQuiz.player.lastQuestionCorrect) {
        singlePlayerQuiz.player.score += 1;
      }
      singlePlayerQuiz.questionAnswered = true;
      this.revealAnswer(singlePlayerQuiz);
    }
  }

  @SubscribeMessage('singlePlayerQuiz:nextQuestion')
  handleNextQuestion(client: Socket, quizId: string): void {
    const singlePlayerQuiz = this.singlePlayerQuizzes.get(quizId);
    if (singlePlayerQuiz) {
      singlePlayerQuiz.currentQuestionIndex++;
      singlePlayerQuiz.questionAnswered = false;
      this.askNextQuestion(client, quizId);
    }
  }

  @SubscribeMessage('getCategories')
  async getCategories(
    client: Socket,
  ): Promise<
    Array<{ categoryMachineName: string; categoryHumanReadable: string }>
  > {
    return this.questionDbService.loadCategoriesWithMachineNames();
  }

  private askNextQuestion(client: Socket, quizId: string): void {
    const singlePlayerQuiz = this.singlePlayerQuizzes.get(quizId);
    if (singlePlayerQuiz.currentQuestionIndex < this.questionsNumberInGame) {
      const question =
        singlePlayerQuiz.questions[singlePlayerQuiz.currentQuestionIndex];
      client.emit('singlePlayerQuiz:question', {
        question: question.question,
        options: question.options,
        category: singlePlayerQuiz.category,
        difficulty: singlePlayerQuiz.difficulty,
        currentQuestionIndex: singlePlayerQuiz.currentQuestionIndex + 1,
        totalQuestionsCount: this.questionsNumberInGame,
      });
    } else {
      this.endGame(singlePlayerQuiz);
    }
  }

  private revealAnswer(singlePlayerQuiz: SinglePlayerQuiz): void {
    const question =
      singlePlayerQuiz.questions[singlePlayerQuiz.currentQuestionIndex];
    this.server.to(singlePlayerQuiz.id).emit('singlePlayerQuiz:answerResult', {
      correctIndex: question.correctIndex,
      explanation: question.explanation,
      isCorrect: singlePlayerQuiz.player.lastQuestionCorrect,
      score: singlePlayerQuiz.player.score,
    });
  }

  private async endGame(singlePlayerQuiz: SinglePlayerQuiz): Promise<void> {
    const answeredQuestions = singlePlayerQuiz.questions.slice(
      0,
      singlePlayerQuiz.currentQuestionIndex,
    );
    await this.singlePlayerQuizDbService.storeQuizResult(singlePlayerQuiz);

    const toplist = await this.singlePlayerQuizDbService.getToplist(
      singlePlayerQuiz.category,
    );

    this.server.to(singlePlayerQuiz.id).emit('singlePlayerQuiz:gameEnded', {
      results: answeredQuestions,
      score: singlePlayerQuiz.player.score,
      totalQuestions: this.questionsNumberInGame,
      toplist: toplist,
    });
    this.singlePlayerQuizzes.delete(singlePlayerQuiz.id);
  }
}
