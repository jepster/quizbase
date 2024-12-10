import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CommandFactory } from 'nest-commander';
import { CliModule } from './cli.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      'http://backend',
      'http://0.0.0.0',
      'https://mobilefish.de',
      'http://localhost:63342',
      'http://localhost:3000',
      'http://104.248.132.247:3000',
      'http://172.17.30.97:3000',
    ],
    methods: ['GET', 'POST'],
    credentials: true,
  });

  await app.listen(3000);
}
bootstrap();
