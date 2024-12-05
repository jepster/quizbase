import { Module } from '@nestjs/common';
import {PerplexityCommand} from "./perplexity.command";

@Module({
    providers: [PerplexityCommand],
})
export class CliModule {}