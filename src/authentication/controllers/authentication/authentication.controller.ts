import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
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
import { cookieConfig } from '../../../core/cookies';
import { ConfigType } from '@nestjs/config';

@Auth(AuthType.None)
@Controller('auth')
export class AuthenticationController {
  constructor(
    private readonly _authService: AuthenticationService,
    @Inject(cookieConfig.KEY)
    private readonly _config: ConfigType<typeof cookieConfig>,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Get('me')
  async me(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { accessToken, refreshToken } = await this._authService.me(request);

    this._setCookie(response, REFRESH_TOKEN_KEY, refreshToken);

    return { accessToken };
  }

  @HttpCode(HttpStatus.OK)
  @Post('sign-up')
  async signUp(
    @Body() signUpDto: SignUpDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<Pick<AuthResponse, 'accessToken'>> {
    const { accessToken, refreshToken } =
      await this._authService.signUp(signUpDto);

    this._setCookie(response, REFRESH_TOKEN_KEY, refreshToken);

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

    this._setCookie(response, REFRESH_TOKEN_KEY, refreshToken);

    return { accessToken };
  }

  @HttpCode(HttpStatus.OK)
  @Get('sign-out')
  signOut(@Res({ passthrough: true }) response: Response): void {
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

    this._setCookie(response, REFRESH_TOKEN_KEY, refreshToken);

    return { accessToken };
  }

  private _setCookie(response: Response, key: string, value: string): void {
    response.cookie(key, value, {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    });
  }
}
