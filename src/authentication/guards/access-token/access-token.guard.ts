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
import { getAccessToken, REQUEST_USER_KEY } from '../../../core';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly _jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly _jwtConfig: ConfigType<typeof jwtConfig>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = getAccessToken(request);

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      request[REQUEST_USER_KEY] = await this._jwtService.verifyAsync(
        token,
        this._jwtConfig,
      );
    } catch (error) {
      throw new UnauthorizedException();
    }

    return true;
  }
}
