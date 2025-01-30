import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { AuthenticationService } from '../../services/authentication/authentication.service';
import { SignUpDto } from '../../dto/sign-up.dto';
import { SignInDto } from '../../dto/sign-in.dto';
import { AuthResponse } from '../../types/auth-response.type';
import { Auth } from '../../decorators/auth.decorator';
import { AuthType } from '../../types/auth-type.enum';
import { Request, Response } from 'express';
import { RefreshTokenDto } from '../../dto/refresh-token.dto';
import { REFRESH_TOKEN_KEY } from '../../../core';

@Auth(AuthType.None)
@Controller('auth')
export class AuthenticationController {
  constructor(private readonly _authService: AuthenticationService) {}

  @HttpCode(HttpStatus.OK)
  @Post('sign-up')
  async signUp(
    @Body() signUpDto: SignUpDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<Pick<AuthResponse, 'accessToken'>> {
    const { accessToken, refreshToken } =
      await this._authService.signUp(signUpDto);

    response.cookie(REFRESH_TOKEN_KEY, refreshToken);

    return { accessToken };
  }

  @HttpCode(HttpStatus.OK)
  @Post('sign-in')
  async signIn(
    @Body() signInDto: SignInDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<Pick<AuthResponse, 'accessToken'>> {
    const { accessToken, refreshToken } =
      await this._authService.signIn(signInDto);

    response.cookie(REFRESH_TOKEN_KEY, refreshToken);

    return { accessToken };
  }

  @HttpCode(HttpStatus.OK)
  @Get('sign-out')
  async signOut(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    await this._authService.signOut(request.cookies as RefreshTokenDto);

    response.clearCookie(REFRESH_TOKEN_KEY);
  }

  @HttpCode(HttpStatus.OK)
  @Get('refresh-tokens')
  async refreshTokens(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<Pick<AuthResponse, 'accessToken'>> {
    const { accessToken, refreshToken } = await this._authService.refreshTokens(
      request.cookies as RefreshTokenDto,
    );

    response.cookie(REFRESH_TOKEN_KEY, refreshToken);

    return { accessToken };
  }
}
