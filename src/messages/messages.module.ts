import { Module } from '@nestjs/common';
import { MessagesService } from './services/messages.service';
import { MessagesController } from './controllers/messages.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from '../core';
import { Like } from '../core';
import { User } from '../core';

@Module({
  controllers: [MessagesController],
  providers: [MessagesService],
  imports: [TypeOrmModule.forFeature([User, Message, Like])],
})
export class MessagesModule {}
