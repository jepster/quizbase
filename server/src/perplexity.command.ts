import { Command, CommandRunner } from 'nest-commander';
import {OpenAI} from "openai";
import { MongoClient } from 'mongodb';

// Run this command like this: node dist/main.js perplexity-command
@Command({ name: 'perplexity-command', description: 'Imports questions from perplexity' })
export class PerplexityCommand extends CommandRunner {
    private readonly mongoUri = 'mongodb://root:example@localhost:27017'; // Update with your MongoDB URI
    private readonly dbName = 'quizbase';
    private readonly collectionName = 'trivia_questions';
    private insertedCount = 0;
    private skippedCount = 0;

    async run(passedParams: string[]): Promise<void> {
        for (let i = 0; i < 10; i++) {
            await this.createQuestionIteration();
        }
    }

    private async createQuestionIteration() {
        const apiKey = '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';
        const client = new OpenAI({apiKey, baseURL: 'https://api.perplexity.ai'});

        const category = 'AfD';
        const difficulty = 'low';

        const response = await client.chat.completions.create({
            model: 'llama-3.1-sonar-small-128k-online',
            messages: [
                {
                    role: 'user',
                    content:
                        'Generiere 10 trivia Fragen mit 3 Optionen im JSON Format. Die Kategorie ist ' + category + ' und der Schwierigkeitsgrad: ' + difficulty + '. Bitte achte auf korrekte deutsche Rechtschreibung. Hier ist ein Beispiel für den Aufbau: ' +
                        '{"question": "Welchen ungewöhnlichen Beruf hatte Tino Chrupalla vor seiner politischen Karriere?",' +
                        '"options": ["Malermeister", "Zirkusclown", "Imker"],' +
                        '"correctIndex": 0,' +
                        '"explanation": "Tino Chrupalla war vor seiner politischen Karriere als Malermeister tätig.", + ' +
                        '"difficulty: "' + difficulty + '",' +
                        '"category: "' + category + '"}',
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
            console.error('Error parsing JSON:', error);
            console.log('Raw content:', content);
        }
    }

    private async storeDataInMongoDB(dataset: any[]): Promise<void> {
        const client = new MongoClient(this.mongoUri);

        try {
            await client.connect();
            const db = client.db(this.dbName);
            const collection = db.collection(this.collectionName);

            for (const item of dataset) {
                const existingQuestion = await collection.findOne({ question: item.question });
                if (!existingQuestion) {
                    const result = await collection.insertOne(item);
                    if (result.acknowledged) {
                        this.insertedCount++;
                    }
                } else {
                    this.skippedCount++;
                }
            }

            console.log(`${this.insertedCount} documents were inserted`);
            console.log(`${this.skippedCount} documents were skipped (already exist)`);
        } catch (error) {
            console.error('Error storing data in MongoDB:', error);
        } finally {
            await client.close();
        }
    }
}