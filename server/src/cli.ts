import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CommandFactory } from 'nest-commander';
import { CliModule } from './cli.module';

async function bootstrap() {
    await CommandFactory.run(CliModule);
}
bootstrap();
