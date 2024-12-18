import { Command, CommandRunner } from 'nest-commander';
import { MongoClient } from 'mongodb';
import {ConfigService} from "@nestjs/config";
import { Injectable } from '@nestjs/common';

@Injectable()
@Command({ name: 'delete-database-command', description: 'Deletes the entire quizbase database' })
export class DeleteDatabaseCommand extends CommandRunner {
    private readonly dbName = 'quizbase';
    private readonly mongoUri = '';

    constructor(private configService: ConfigService) {
        super();
        this.mongoUri = this.configService.get('DATABASE_URL');
    }

    async run(): Promise<void> {
        const client = new MongoClient(this.mongoUri);

        try {
            await client.connect();
            const db = client.db(this.dbName);

            await db.dropDatabase();
            console.log(`Database ${this.dbName} has been successfully deleted.`);
        } catch (error) {
            console.error('Error deleting database:', error);
        } finally {
            await client.close();
        }
    }
}
