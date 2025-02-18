import { Module } from '@nestjs/common';
import { AuthenticationModule } from './authentication/authentication.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { HashingModule } from './core';
import { ConfigModule } from '@nestjs/config';
import { CookiesModule } from './core/cookies';
import { RedisModule } from './core/redis';
import * as process from 'node:process';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from './core/interceptors';
import { MessagesModule } from './messages/messages.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    AuthenticationModule,
    HashingModule,
    ConfigModule.forRoot({
      envFilePath: `${process.cwd()}/.env.${process.env.NODE_ENV}`,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(`${process.env.DB_PORT}`, 10),
      username: process.env.DB_USERNAME || '',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || '',
      autoLoadEntities: true,
      synchronize: true,
      ssl: false,
    }),
    UsersModule,
    CookiesModule,
    RedisModule,
    MessagesModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
