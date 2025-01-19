import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { MongoClient } from 'mongodb';
import { PerplexityService } from '../src/perplexity.service';
import { LoggerServiceMock } from './logger.mock';
import { LoggerService } from '../src/logger.service';
import { QuestionDbService } from '../src/question-db.service';

describe('PerplexityService Integration', () => {
  let perplexityService: PerplexityService;
  let mongoClient: MongoClient;
  let consoleLogSpy;
  let questionDbService: QuestionDbService;

  let categoryHumanReadable = 'Gina Wild schluckt Sperma';
  let categoryMachineName = 'gina-wild-schluckt-sperma';

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [
        PerplexityService,
        {
          provide: LoggerService,
          useValue: LoggerServiceMock,
        },
        QuestionDbService,
      ],
    }).compile();

    perplexityService = module.get<PerplexityService>(PerplexityService);
    questionDbService = module.get<QuestionDbService>(QuestionDbService);
    mongoClient = new MongoClient(process.env.DATABASE_URL);
    await mongoClient.connect();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterAll(async () => {
    await mongoClient.close();
    consoleLogSpy.mockRestore();
    //await questionDbService.deleteCategory('Geschichten aus dem Mittelalter');
  });

  it('Check perplexity service', async () => {
    const initialCategories = await questionDbService.loadCategories();
    const numInitialCategories = initialCategories.length;
    const category = categoryHumanReadable;
    await perplexityService.run(category);

    const db = mongoClient.db('quizbase');
    const collection = db.collection('trivia_questions');

    const document = await collection.findOne({
      categoryHumanReadable: category,
    });

    expect(document.categoryMachineName).toBe(
      categoryMachineName,
    );

    const updatedCategories = await questionDbService.loadCategories();
    const numUpdatedCategories = updatedCategories.length;
    expect(numUpdatedCategories).toBe(numInitialCategories + 1);
  }, 20000);
});
