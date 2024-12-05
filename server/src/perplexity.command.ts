import { Command, CommandRunner } from 'nest-commander';

@Command({ name: 'perplexity-command', description: 'Imports questions from perplexity' })
export class PerplexityCommand extends CommandRunner {
    async run(passedParams: string[]): Promise<void> {
        console.log('Hello from NestJS CLI!');
    }
}