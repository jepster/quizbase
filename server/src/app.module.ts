import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SynchronousQuizGateway } from './synchronous-quiz.gateway';
import { AsynchronousQuizGateway } from './asynchronous-quiz.gateway';
import { PerplexityService } from './perplexity.service';
import { QuestionDbService } from './question-db.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [],
  providers: [
    SynchronousQuizGateway,
    AsynchronousQuizGateway,
    PerplexityService,
    QuestionDbService,
  ],
})
export class AppModule {}
