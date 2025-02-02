import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from '../../../core/configs/jwt.config';
import { ConfigType } from '@nestjs/config';
import { Request } from 'express';
import { ERRORS, REFRESH_TOKEN_KEY, REQUEST_USER_KEY } from '../../../core';
import {
  InvalidatedRefreshTokenError,
  RedisService,
} from '../../../core/redis';
import { ActiveUserData } from '../../types/active-user-data.type';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly _jwtService: JwtService,
    private readonly _redisService: RedisService,
    @Inject(jwtConfig.KEY)
    private readonly _jwtConfig: ConfigType<typeof jwtConfig>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token || !request.cookies[REFRESH_TOKEN_KEY]) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this._jwtService.verifyAsync(
        token,
        this._jwtConfig,
      );

      const { refreshTokenId } = await this._jwtService.verifyAsync<
        Pick<ActiveUserData, 'sub'> & { refreshTokenId: string }
      >(request.cookies[REFRESH_TOKEN_KEY], {
        secret: this._jwtConfig.secret,
        audience: this._jwtConfig.audience,
        issuer: this._jwtConfig.issuer,
      });

      await this._redisService.validate(payload.sub, refreshTokenId);

      request[REQUEST_USER_KEY] = payload;
    } catch (error) {
      if (error instanceof InvalidatedRefreshTokenError) {
        throw new UnauthorizedException(ERRORS.ACCESS_DENIED);
      }
      throw new UnauthorizedException();
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [_, token] = request.headers.authorization?.split(' ') ?? [];

    return token;
  }
}
