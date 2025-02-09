import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Roles } from '../enums';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @MinLength(8)
  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  role: Roles;
}
