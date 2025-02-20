import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as process from 'node:process';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());

  app.enableCors({
    origin: [
      process.env.CORS_ORIGIN_1 ?? 'http://localhost:5173',
      process.env.CORS_ORIGIN_2 ?? 'https://localhost:5173',
    ],
    methods: process.env.CORS_METHODS,
    credentials: true,
    exposedHeaders: ['Set-Cookie'],
  });

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap().catch((err) => console.error(err));
