import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Roles } from '../enums';
import { IsEnum } from 'class-validator';

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
}
