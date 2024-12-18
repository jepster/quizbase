import { Module } from '@nestjs/common';
import {PerplexityCommand} from "./perplexity.command";
import {DeleteDatabaseCommand} from "./delete-database.command";
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [ConfigModule.forRoot()],
    providers: [PerplexityCommand, DeleteDatabaseCommand],
})
export class CliModule {}