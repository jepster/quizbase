import { Collection, MongoClient } from 'mongodb';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Category from './types/category';

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

  public async getQuestionsByCategoryMachineName(
    categoryMachineName: string,
    difficulty: string,
  ): Promise<Question[]> {
    return this.fetchAndProcessQuestions({
      categoryMachineName: categoryMachineName,
      difficulty: difficulty,
    });
  }

  public async getQuestionsByHumanReadableCategory(
    category: Category,
    difficulty: string,
  ): Promise<Question[]> {
    return this.fetchAndProcessQuestions({
      categoryHumanReadable: category.humanReadableName,
      difficulty: difficulty,
    });
  }

  public async loadCategories(): Promise<Category[]> {
    try {
      const collection = await this.getMongoDbCollection();
      const categories = await collection
        .aggregate([
          {
            $group: {
              _id: {
                machine: '$categoryMachineName',
                human: '$categoryHumanReadable',
              },
            },
          },
          {
            $project: {
              _id: 0,
              categoryMachineName: '$_id.machine',
              categoryHumanReadable: '$_id.human',
            },
          },
        ])
        .toArray();

      return categories
        .filter(
          (category) =>
            category.categoryHumanReadable &&
            category.categoryHumanReadable.length > 1,
        )
        .map((category) => ({
          machineName: category.categoryMachineName as string,
          humanReadableName: category.categoryHumanReadable as string,
        }));
    } catch (error) {
      console.error('Error fetching categories with machine names:', error);
      return [];
    }
  }

  public async deleteCategory(category: Category): Promise<boolean> {
    try {
      const collection = await this.getMongoDbCollection();
      const result = await collection.deleteMany({
        categoryHumanReadable: category.humanReadableName,
      });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error deleting category:', error);
      return false;
    }
  }

  public async getCategoryByMachineName(
    machineName: string,
  ): Promise<Category | null> {
    try {
      const collection = await this.getMongoDbCollection();
      const category = await collection.findOne({
        categoryMachineName: machineName,
      });

      if (category) {
        return {
          machineName: category.categoryMachineName,
          humanReadableName: category.categoryHumanReadable,
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching category by machine name:', error);
      return null;
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
    const db = client.db(this.dbName);
    return db.collection(this.collectionName);
  }

  private async fetchAndProcessQuestions(matchCriteria: {
    [key: string]: string;
  }): Promise<Question[]> {
    try {
      const collection = await this.getMongoDbCollection();
      const questions = await collection
        .aggregate([
          { $match: matchCriteria },
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

      return this.shuffleArray(uniqueQuestions);
    } catch (error) {
      console.error('Error fetching questions from MongoDB:', error);
      return [];
    }
  }
}
