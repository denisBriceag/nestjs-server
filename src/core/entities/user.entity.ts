import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Roles } from '../../users/enums';
import { IsEnum } from 'class-validator';
import { Message } from './message.entity';
import { Like } from './like.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ length: 100 })
  name: string;

  @Column()
  password: string;

  @Column()
  @IsEnum(Roles)
  role: Roles;

  @OneToMany(() => Message, (message) => message.user)
  messages: Message[];

  @OneToMany(() => Like, (like) => like.user)
  likes: Like[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
