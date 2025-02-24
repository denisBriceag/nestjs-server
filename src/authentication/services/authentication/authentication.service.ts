import {
  ConflictException,
  HttpException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SignUpDto } from '../../dto/sign-up.dto';
import { SignInDto } from '../../dto/sign-in.dto';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from '../../../core/configs/jwt.config';
import { ConfigType } from '@nestjs/config';
import { AuthResponse } from '../../types/auth-response.type';
import { ActiveUserData } from '../../types/active-user-data.type';
import {
  InvalidatedRefreshTokenError,
  RedisService,
} from '../../../core/redis';
import * as crypto from 'node:crypto';
import { RefreshTokenDto } from '../../dto/refresh-token.dto';
import { Request } from 'express';
import { ERRORS, getAccessToken, HashingService, User } from '../../../core';

@Injectable()
export class AuthenticationService {
  constructor(
    @InjectRepository(User) private readonly _usersRepository: Repository<User>,
    @Inject(jwtConfig.KEY)
    private readonly _jwtConfig: ConfigType<typeof jwtConfig>,
    private readonly _hashingService: HashingService,
    private readonly _jwtService: JwtService,
    private readonly _redisService: RedisService,
  ) {}

  async me(request: Request): Promise<AuthResponse> {
    try {
      const accessToken = getAccessToken(request);

      const { sub } = await this._jwtService.verifyAsync<
        Pick<ActiveUserData, 'sub'> & { refreshTokenId: string }
      >(accessToken as string, this._jwtConfig);

      const user = await this._usersRepository.findOneByOrFail({
        id: sub,
      });

      return this._generateTokens(user);
    } catch {
      throw new UnauthorizedException();
    }
  }

  async signUp(signUpDto: SignUpDto): Promise<AuthResponse> {
    try {
      const user = new User();

      user.email = signUpDto.email;
      user.name = signUpDto.name;
      user.role = signUpDto.role;

      user.password = await this._hashingService.hash(signUpDto.password);

      await this._usersRepository.save(user);

      return await this._generateTokens(user);
    } catch (err) {
      if (err.code === ERRORS.PG_UNIQUE_VIOLATION) {
        throw new ConflictException();
      }

      throw err;
    }
  }

  async signIn(signInDto: SignInDto): Promise<AuthResponse> {
    const user = await this._usersRepository.findOneBy({
      email: signInDto.email,
    });

    if (!user) {
      throw new UnauthorizedException(ERRORS.USER_DOES_NO_EXIST);
    }

    const isEqual = await this._hashingService.compare(
      signInDto.password,
      user.password,
    );

    if (!isEqual) {
      throw new UnauthorizedException(ERRORS.PASS_DOES_NOT_MACH);
    }

    return await this._generateTokens(user);
  }

  async refreshTokens({
    refreshToken,
  }: RefreshTokenDto): Promise<AuthResponse> {
    if (!refreshToken) {
      throw new UnauthorizedException();
    }

    try {
      const { sub, refreshTokenId } = await this._jwtService.verifyAsync<
        Pick<ActiveUserData, 'sub'> & { refreshTokenId: string }
      >(refreshToken, {
        secret: this._jwtConfig.secret,
        audience: this._jwtConfig.audience,
        issuer: this._jwtConfig.issuer,
      });

      const user = await this._usersRepository.findOneByOrFail({
        id: sub,
      });

      const isValid = await this._redisService.validate(
        user.id,
        refreshTokenId,
      );

      if (isValid) {
        await this._redisService.invalidate(user.id);
      }

      return this._generateTokens(user);
    } catch {
      throw new HttpException(new Error(), 403, {
        description: 'Access to the resource is denied',
      });
    }
  }

  private async _generateTokens(user: User): Promise<AuthResponse> {
    const refreshTokenId = crypto.randomUUID();

    const [accessToken, refreshToken] = await Promise.all([
      this._signToken<Partial<ActiveUserData>>(
        user.id,
        this._jwtConfig.accessTokenTtl,
        { email: user.email, name: user.name, role: user.role },
      ),

      this._signToken<{ refreshTokenId: string }>(
        user.id,
        this._jwtConfig.refreshTokenTtl,
        {
          refreshTokenId,
        },
      ),
    ]);

    await this._redisService.insert(user.id, refreshTokenId);

    return {
      accessToken,
      refreshToken,
    };
  }

  private async _signToken<T>(userId: number, expiresIn: number, payload?: T) {
    return await this._jwtService.signAsync(
      {
        sub: userId,
        ...payload,
      },
      {
        audience: this._jwtConfig.audience,
        issuer: this._jwtConfig.issuer,
        secret: this._jwtConfig.secret,
        expiresIn,
      },
    );
  }
}
