import { Module } from '@nestjs/common';
import { PerplexityCommand } from './perplexity.command';
import { DeleteDatabaseCommand } from './delete-database.command';
import { ConfigModule } from '@nestjs/config';
import { PerplexityService } from './perplexity.service';
import { QuestionDbService } from './question-db.service';
import { LoggerService } from './logger.service';

@Module({
  imports: [ConfigModule.forRoot()],
  providers: [
    PerplexityCommand,
    DeleteDatabaseCommand,
    PerplexityService,
    QuestionDbService,
    LoggerService,
  ],
})
export class CliModule {}
