import { Collection, MongoClient } from 'mongodb';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SinglePlayerQuiz } from './asynchronous-quiz.gateway';
import Category from "./types/category";

interface QuizResult {
  playerName: string;
  score: number;
  category: string;
  difficulty: string;
  playDate: Date;
}

@Injectable()
export class SinglePlayerQuizDbService {
  private readonly dbName = 'quizbase';
  private readonly collectionName = 'single_player_quizzes';
  private readonly mongoUri = '';

  constructor(private configService: ConfigService) {
    this.mongoUri = this.configService.get('DATABASE_URL');
  }

  public async storeQuizResult(quiz: SinglePlayerQuiz): Promise<void> {
    const collection = await this.getMongoDbCollection();
    await collection.insertOne({
      ...quiz,
      playDate: new Date(),
    });
  }

  public async getToplist(
    category: Category,
    limit: number = 10,
  ): Promise<QuizResult[]> {
    const collection = await this.getMongoDbCollection();

    const results = await collection
      .find({ category })
      .project({
        playerName: '$player.name',
        score: '$player.score',
        category: 1,
        difficulty: 1,
        playDate: 1,
      })
      .sort({ 'player.score': -1 })
      .limit(limit)
      .toArray();

    return results.map((result) => ({
      playerName: result.playerName,
      score: result.score,
      category: result.category,
      difficulty: result.difficulty,
      playDate: result.playDate,
    }));
  }

  private async getMongoDbCollection(): Promise<Collection> {
    const client = new MongoClient(this.mongoUri);
    await client.connect();
    const db = client.db(this.dbName);
    return db.collection(this.collectionName);
  }
}
