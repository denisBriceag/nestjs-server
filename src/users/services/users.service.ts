import { Injectable, NotFoundException, Req } from '@nestjs/common';
import { CreateUserDto } from '../dto';
import { UpdateUserDto } from '../dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities';
import { Repository } from 'typeorm';
import { ActiveUserData } from '../../authentication/types/active-user-data.type';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly _usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<ActiveUserData> {
    try {
      const { email, name, id, role } =
        await this._usersRepository.save(createUserDto);

      return { sub: id, email, name, role };
    } catch {
      throw new NotFoundException();
    }
  }

  async findAll(): Promise<ActiveUserData | ActiveUserData[]> {
    try {
      const users = await this._usersRepository.find();

      return this._mapUser(users);
    } catch {
      throw new NotFoundException();
    }
  }

  async findOne(id: number): Promise<ActiveUserData | ActiveUserData[]> {
    try {
      const user = await this._usersRepository.findOneBy({ id });

      return this._mapUser(user);
    } catch {
      throw new NotFoundException();
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    try {
      await this._usersRepository.update(id, updateUserDto);
    } catch {
      throw new NotFoundException();
    }
  }

  async remove(id: number) {
    try {
      await this._usersRepository.delete(id);
    } catch {
      throw new NotFoundException();
    }
  }

  private _mapUser(
    users: User | User[] | null,
  ): ActiveUserData | ActiveUserData[] {
    if (!users) return [];

    if (Array.isArray(users)) {
      return users.map((user) => ({
        sub: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }));
    }

    const { id, name, email, role } = users;

    return { sub: id, email, name, role };
  }
}
