import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dto';
import { UpdateUserDto } from '../dto';
import { Auth } from '../../authentication/decorators/auth.decorator';
import { AuthType } from '../../authentication/types/auth-type.enum';
import { ActiveUser } from '../../authentication/decorators/active-user.decorator';
import { Request } from 'express';
import { Role } from '../decorators/role.decorator';
import { Roles } from '../enums';

@Auth(AuthType.Bearer)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Role(Roles.ADMIN)
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll(@ActiveUser() user: typeof ActiveUser, @Req() request: Request) {
    console.log(request.cookies);
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Role(Roles.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Role(Roles.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
