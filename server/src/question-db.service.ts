import { Collection, MongoClient } from 'mongodb';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface Question {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

@Injectable()
export class QuestionDbService {
  private readonly dbName = 'quizbase';
  private readonly collectionName = 'trivia_questions';
  private questionsNumberInGame: number = 10;
  private readonly mongoUri = '';

  constructor(private configService: ConfigService) {
    this.mongoUri = this.configService.get('DATABASE_URL');
  }

  public async getQuestionsFromMongoDB(
    categoryHumanReadable: string,
    difficulty: string,
  ): Promise<Question[]> {
    try {
      const collection = await this.getMongoDbCollection();
      const questions = await collection
        .aggregate([
          {
            $match: {
              categoryHumanReadable: categoryHumanReadable,
              difficulty: difficulty,
            },
          },
          { $sample: { size: this.questionsNumberInGame } },
        ])
        .toArray();

      const uniqueQuestions = this.removeDuplicates(
        questions.map((q) => ({
          question: q.question,
          options: q.options,
          correctIndex: q.correctIndex,
          explanation: q.explanation,
        })),
      );

      const shuffledQuestions = this.shuffleArray(uniqueQuestions);

      return shuffledQuestions;
    } catch (error) {
      console.error('Error fetching questions from MongoDB:', error);
      return [];
    }
  }

  public async loadCategories(): Promise<string[]> {
    try {
      const collection = await this.getMongoDbCollection();
      const allCategories = await collection.distinct('category');
      return allCategories.filter((category) => category.length > 1);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }

  private removeDuplicates(questions: Question[]): Question[] {
    const seen = new Set();
    return questions.filter((q) => {
      const duplicate = seen.has(q.question);
      seen.add(q.question);
      return !duplicate;
    });
  }

  private shuffleArray(array: Question[]): Question[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  private async getMongoDbCollection(): Promise<Collection> {
    const client = new MongoClient(this.mongoUri);
    await client.connect();
    const db = client.db(this.dbName);
    return db.collection(this.collectionName);
  }
}
