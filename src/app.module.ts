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
import { LoggingInterceptor } from './core/interceptors/logging.interceptor';

@Module({
  imports: [
    AuthenticationModule,
    HashingModule,
    ConfigModule.forRoot({
      envFilePath: `${process.cwd()}/.env.${process.env.NODE_ENV}`,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'dbriceag',
      password: '1234',
      database: 'smaple_db',
      autoLoadEntities: true,
      synchronize: true,
    }),
    UsersModule,
    CookiesModule,
    RedisModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
