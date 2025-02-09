import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dto';
import { UpdateUserDto } from '../dto';
import { Auth } from '../../authentication/decorators/auth.decorator';
import { AuthType } from '../../authentication/types/auth-type.enum';
import { ActiveUser } from '../../authentication/decorators/active-user.decorator';
import { Role } from '../decorators/role.decorator';
import { Roles } from '../enums';
import { ActiveUserData } from '../../authentication/types/active-user-data.type';

@Auth(AuthType.Bearer)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Role(Roles.ADMIN)
  @Post()
  create(@Body() createUserDto: CreateUserDto): Promise<ActiveUserData> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll(
    @ActiveUser() user: typeof ActiveUser,
  ): Promise<ActiveUserData | ActiveUserData[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<ActiveUserData | ActiveUserData[]> {
    return this.usersService.findOne(+id);
  }

  @Role(Roles.ADMIN)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<void> {
    await this.usersService.update(+id, updateUserDto);
  }

  @Role(Roles.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    await this.usersService.remove(+id);
  }
}
