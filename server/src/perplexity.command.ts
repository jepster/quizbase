import {Command, CommandRunner, Option} from 'nest-commander';
import {PerplexityService} from './perplexity.service';

// Run this command like this: node dist/main.js perplexity-command
@Command({
  name: 'perplexity-command',
  description: 'Imports questions from perplexity',
})
export class PerplexityCommand extends CommandRunner {
  constructor(private readonly perplexityService: PerplexityService) {
    super();
  }

  @Option({
    flags: '-c, --category [category]',
    description: 'The category for the trivia questions',
  })
  parseCategory(val: string): string {
    if (val === '') {
      throw new Error('Invalid category. You must enter a category.');
    }
    return val;
  }

  @Option({
    flags: '-t, --topic [topic]',
    description: 'The topic for the trivia questions',
  })
  parseTopic(val: string): string {
    if (val === '') {
      throw new Error('Invalid topic. You must enter a topic.');
    }
    return val;
  }

  async run(
    passedParams: string[],
    options?: { category: string; topic: string; difficulty: string },
  ): Promise<void> {
    const categoryHumanReadable = options.category;
    const topicHumanReadable = options.topic;

    await this.perplexityService.run(categoryHumanReadable, topicHumanReadable);
  }
}
