import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateMessageDto } from '../dto/create-message.dto';
import { UpdateMessageDto } from '../dto/update-message.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageDetailed } from '../types/message-detailed.type';
import { Auth } from '../../authentication/decorators/auth.decorator';
import { AuthType } from '../../authentication/types/auth-type.enum';
import { Like, Message, User } from '../../core';
import { Pagination } from '../dto/pagination.dto';
import { MessagesResponse } from '../types/messages-response.type';

@Auth(AuthType.Bearer)
@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly _messagesRepository: Repository<Message>,
    @InjectRepository(User)
    private readonly _userRepository: Repository<User>,
    @InjectRepository(Like)
    private readonly _likeRepository: Repository<Like>,
  ) {}

  async create(createMessageDto: CreateMessageDto) {
    const user = await this._userRepository.findOne({
      where: { id: createMessageDto.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    try {
      const { message } = createMessageDto;

      const newMessage: Message = this._messagesRepository.create({
        postedOn: new Date(),
        message,
        user,
      });

      return await this._messagesRepository.save(newMessage);
    } catch {
      throw new NotFoundException('Failed to create message');
    }
  }

  async findAll(
    userId: number,
    { page, pageSize }: Pagination,
  ): Promise<MessagesResponse> {
    try {
      const [messagesRow, total] = await this._messagesRepository.findAndCount({
        relations: ['user', 'likes', 'likes.user'],
        take: pageSize,
        skip: (page - 1) * pageSize,
      });

      const mappedMessages = await this._mapMessage(messagesRow, userId);

      return {
        messages: mappedMessages,
        total,
        page,
        pageSize,
      };
    } catch {
      throw new NotFoundException('');
    }
  }

  async findOne(id: string, userId: number): Promise<MessageDetailed[]> {
    try {
      const message = await this._messagesRepository.findOne({
        where: { id },
      });

      console.log(message);

      return await this._mapMessage(message, userId);
    } catch {
      throw new NotFoundException();
    }
  }

  async update(id: number, updateMessageDto: UpdateMessageDto): Promise<void> {
    if (Object.keys(updateMessageDto).length === 0)
      throw new HttpException('No content was provided', 204);

    try {
      await this._messagesRepository.update(id, updateMessageDto);
    } catch {
      throw new NotFoundException();
    }
  }

  async remove(id: number) {
    try {
      await this._messagesRepository.delete(id);
    } catch {
      throw new NotFoundException();
    }
  }

  async likeMessage(id: string, userId: number): Promise<void> {
    const existingLike = await this._likeRepository.findOne({
      where: { user: { id: userId }, message: { id } },
    });

    if (!existingLike) {
      const user = await this._userRepository.findOne({
        where: { id: userId },
        relations: ['likes'],
      });
      const message = await this._messagesRepository.findOne({
        where: { id },
      });

      if (!message) throw new NotFoundException('No messages with such id');
      else if (!user) throw new NotFoundException('No user with such id');

      const newLike = this._likeRepository.create({ user, message });

      await this._likeRepository.save(newLike);
    }
  }

  async unlike(id: string, userId: number): Promise<void> {
    await this._likeRepository.delete({
      user: { id: userId },
      message: { id },
    });
  }

  private async _mapMessage(
    message: Message | Message[] | null,
    userId: number,
  ): Promise<MessageDetailed[]> {
    if (!message) return [];

    const user = await this._userRepository.findOneBy({ id: userId });

    if (!user) return [];

    if (Array.isArray(message)) {
      return message.map((m) => ({
        id: m.id,
        message: m.message,
        postedOn: m.postedOn,
        userId: m.user.id,
        userName: m.user.name,
        likeCount: m.likes?.length ?? 0,
        likedByUser: m?.likes?.some((l) => l.user.id === user.id) ?? false,
      }));
    }

    const { id, postedOn } = message;

    return [
      {
        id,
        message: message.message,
        userId: userId,
        postedOn: postedOn,
        userName: user.name,
        likeCount: message?.likes?.length ?? 0,
        likedByUser:
          message?.likes?.some((l) => l.user.id === user.id) ?? false,
      },
    ];
  }
}
