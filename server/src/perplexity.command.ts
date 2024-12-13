import { Command, CommandRunner, Option } from 'nest-commander';
import { OpenAI } from "openai";
import { MongoClient } from 'mongodb';

// Run this command like this: node dist/main.js perplexity-command
@Command({ name: 'perplexity-command', description: 'Imports questions from perplexity' })
export class PerplexityCommand extends CommandRunner {
    private readonly mongoUri = 'mongodb://root:example@localhost:27017';
    private readonly dbName = 'quizbase';
    private readonly collectionName = 'trivia_questions';
    private insertedCount = 0;
    private skippedCount = 0;

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
        flags: '-d, --difficulty [difficulty]',
        description: 'The difficulty level for the trivia questions',
    })
    parseDifficulty(val: string): string {
        const lowercaseVal = val.toLowerCase();
        if (lowercaseVal !== 'high' && lowercaseVal !== 'low') {
            throw new Error('Invalid difficulty. Only "high" or "low" are allowed.');
        }
        return lowercaseVal;
    }

    async run(passedParams: string[], options?: { category: string, difficulty: string }): Promise<void> {
        const category = options.category;

        await (async (category) => {
            const difficulties = ['high', 'low'];
            await Promise.all(difficulties.map(async (difficulty) => {
                await Promise.all(Array(10).fill(null).map(() => this.createQuestionIteration(category, difficulty)));
            }));
        })(category);
    }

    private async createQuestionIteration(category: string, difficulty: string) {
        const apiKey = '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';
        const client = new OpenAI({apiKey, baseURL: 'https://api.perplexity.ai'});

        const response = await client.chat.completions.create({
            model: 'llama-3.1-sonar-small-128k-online',
            messages: [
                {
                    role: 'user',
                    content:
                        'Generiere 10 trivia Fragen mit 3 Optionen im JSON Format. Da es 3 Antwortoptionen gibt, muss der Index bei 0 beginnen und bei 2 enden. Die Erklärung muss aus zwei bis drei knappen Sätzen bestehen. Die Kategorie ist ' + category + ' und der Schwierigkeitsgrad: ' + difficulty + '. Bitte achte auf korrekte deutsche Rechtschreibung. Hier ist ein Beispiel für den Aufbau: ' +
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
                if (!item.explanation || item.explanation.trim() === '') {
                    this.skippedCount++;
                    continue;
                }

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
            console.log(`${this.skippedCount} documents were skipped (empty explanation or already exist)`);
        } catch (error) {
            console.error('Error storing data in MongoDB:', error);
        } finally {
            await client.close();
        }
    }

}