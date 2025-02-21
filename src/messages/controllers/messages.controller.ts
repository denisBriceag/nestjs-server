import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { MessagesService } from '../services/messages.service';
import { CreateMessageDto } from '../dto/create-message.dto';
import { UpdateMessageDto } from '../dto/update-message.dto';
import { MessageDetailed } from '../types/message-detailed.type';
import { MessagesResponse } from '../types/messages-response.type';

@Controller('messages')
export class MessagesController {
  constructor(private readonly _messagesService: MessagesService) {}

  @Post()
  async create(@Body() createMessageDto: CreateMessageDto): Promise<void> {
    await this._messagesService.create(createMessageDto);
  }

  @Get('all/:userId/:page/:pageSize')
  findAll(
    @Param('userId') userId: string,
    @Param('page') page: string,
    @Param('pageSize') pageSize: string,
  ): Promise<MessagesResponse> {
    return this._messagesService.findAll(+userId, {
      page: +page,
      pageSize: +pageSize,
    });
  }

  @Get(':id/:userId')
  @HttpCode(HttpStatus.OK)
  findOne(
    @Param('id') id: string,
    @Param('userId') userId: string,
  ): Promise<MessageDetailed[]> {
    return this._messagesService.findOne(id, +userId);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id') id: string,
    @Body() updateMessageDto: UpdateMessageDto,
  ): Promise<void> {
    return this._messagesService.update(id, updateMessageDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string): Promise<void> {
    return this._messagesService.remove(id);
  }

  @Get('like/:id/:userId')
  @HttpCode(HttpStatus.OK)
  async like(
    @Param('id') id: string,
    @Param('userId') userId: string,
  ): Promise<void> {
    await this._messagesService.likeMessage(id, +userId);
  }

  @Get('unlike/:id/:userId')
  @HttpCode(HttpStatus.OK)
  async unlike(
    @Param('id') id: string,
    @Param('userId') userId: string,
  ): Promise<void> {
    await this._messagesService.unlike(id, +userId);
  }
}
