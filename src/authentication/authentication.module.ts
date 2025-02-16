import { Module } from '@nestjs/common';
import { AuthenticationService } from './services/authentication/authentication.service';
import { AuthenticationController } from './controllers/authentication/authentication.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from '../core/configs/jwt.config';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuthenticationGuard } from './guards/authentication/authentication.guard';
import { AccessTokenGuard } from './guards/access-token/access-token.guard';
import { RolesGuard } from './guards/roles/roles.guard';
import { User } from '../core';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
  ],
  providers: [
    AuthenticationService,
    AccessTokenGuard,
    { provide: APP_GUARD, useClass: AuthenticationGuard },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
  controllers: [AuthenticationController],
})
export class AuthenticationModule {}
