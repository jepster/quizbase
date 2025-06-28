import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAI } from 'openai';
import { MongoClient } from 'mongodb';
import { LoggerService } from './logger.service';

@Injectable()
export class PerplexityService {
  private readonly dbName = 'quizbase';
  private readonly collectionName = 'trivia_questions';
  private insertedCount = 0;
  private skippedCount = 0;
  private readonly mongoUri = '';

  constructor(
    private configService: ConfigService,
    private loggerService: LoggerService,
  ) {
    this.mongoUri = this.configService.get('DATABASE_URL');
  }

  async run(category: string, topic: string): Promise<void> {
    await (async (category) => {
      const difficulties = ['high', 'low'];
      await Promise.all(
        difficulties.map(async (difficulty) => {
          await Promise.all(
            Array(5)
              .fill(null)
              .map(() => this.createQuestionIteration(category, difficulty, topic)),
          );
        }),
      );
    })(category);
  }

  private async createQuestionIteration(
    categoryHumanReadable: string,
    difficulty: string,
    topicHumanReadable: string,
  ) {
    const apiKey = this.configService.get<string>('PERPLEXITY_API_KEY');
    const client = new OpenAI({ apiKey, baseURL: 'https://api.perplexity.ai' });

    const categoryMachineName = this.generateMachineName(categoryHumanReadable);
    const topicMachineName = this.generateMachineName(topicHumanReadable);

    const response = await client.chat.completions.create({
      model: 'sonar',
      messages: [
        {
          role: 'user',
          content:
            'Generiere 10 trivia Fragen mit immer 3 Antwortoptionen im JSON Format. Die Fragen müssen sich stark unterscheiden und dürfen sich nicht ähneln. ' +
            'Es muss 3 Antwortoptionen geben. Keine "Ja" oder "Nein" Antworten. Damit muss der Index der Antwortoptionen bei 0 beginnen und ' +
            'bei 2 enden. Die richtige Antwort muss eindeutig sein. Die richtige Antwort darf keine Überschneidung mit den anderen Antwortmöglichkeiten haben. ' +
            'Überprüfe ob der Index der richtigen Antwortoption eindeutig und klar zur Frage passt. Erstelle erst dann die jeweilige Frage.' +
            'Die Erklärung muss aus zwei bis drei knappen Sätzen bestehen. Die Kategorie ist ' +
            categoryHumanReadable +
            ' und der Schwierigkeitsgrad: ' +
            difficulty +
            '. Bitte achte auf korrekte deutsche Rechtschreibung. Die Kategorie soll ausdrücklich nur ' +
            categoryHumanReadable +
            ' sein. Keine anderen Kategorien. Bitte erzeuge keine Verweise oder Links zu Inhalten. Hier ist ein Beispiel für den Aufbau: ' +
            '{"question": "Welchen ungewöhnlichen Beruf hatte Tino Chrupalla vor seiner politischen Karriere?",' +
            '"options": ["Malermeister", "Zirkusclown", "Imker"],' +
            '"correctIndex": 0,' +
            '"explanation": "Tino Chrupalla war vor seiner politischen Karriere als Malermeister tätig.", + ' +
            '"difficulty: "' +
            difficulty +
            '",' +
            '"categoryHumanReadable: "' +
            categoryHumanReadable +
            '",' +
            '"categoryMachineName: "' +
            categoryMachineName +
            '",' +
            '"topicHumanReadable: "' +
            topicHumanReadable +
            '",' +
            '"topicMachineName: "' +
            topicMachineName +
            '"',
        },
      ],
      temperature: 0.7,
    });

    const content = response.choices[0].message.content;
    const jsonString = content.replace(/```json\n|\n```/g, '');

    try {
      const jsonMatch = jsonString.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        await this.storeDataInMongoDB(data);
      } else {
        throw new Error('No JSON array found in the response');
      }
    } catch (error) {
      this.loggerService.error('Error parsing JSON: ' + error);
      this.loggerService.log('Raw content: ' + content);
    }
  }

  private async storeDataInMongoDB(dataset: any[]): Promise<void> {
    const client = new MongoClient(this.mongoUri);

    try {
      await client.connect();
      const db = client.db(this.dbName);
      const collection = db.collection(this.collectionName);

      const requiredKeys = [
        'question',
        'options',
        'correctIndex',
        'explanation',
        'difficulty',
        'categoryHumanReadable',
        'categoryMachineName',
        'topicHumanReadable',
        'topicMachineName',
      ];

      for (const item of dataset) {
        if (!this.checkRequiredKeys(item, requiredKeys)) {
          this.skippedCount++;
          continue;
        }

        const existingQuestion = await collection.findOne({
          question: item.question,
        });
        if (!existingQuestion) {
          const result = await collection.insertOne(item);
          if (result.acknowledged) {
            this.insertedCount++;
          }
        } else {
          this.skippedCount++;
        }
      }

      this.loggerService.log(`${this.insertedCount} documents were inserted`);
      this.loggerService.log(
        `${this.skippedCount} documents were skipped (empty explanation or already exist)`,
      );
    } catch (error) {
      this.loggerService.error('Error storing data in MongoDB: ' + error);
    } finally {
      await client.close();
    }
  }

  private generateMachineName(humanReadableString: string): string {
    return humanReadableString
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/-+/g, '-');
  }

  private checkRequiredKeys(obj: any, requiredKeys: string[]): boolean {
    for (const key of requiredKeys) {
      if (
        !obj.hasOwnProperty(key) ||
        obj[key] === null ||
        obj[key] === undefined
      ) {
        return false;
      }
      if (typeof obj[key] === 'string' && obj[key].trim() === '') {
        return false;
      }
    }
    return true;
  }
}
