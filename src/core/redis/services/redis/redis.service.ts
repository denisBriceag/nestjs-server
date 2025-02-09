import {
  Inject,
  Injectable,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import Redis from 'ioredis';
import { redisConfig } from '../../configs/redis.config';
import { ConfigType } from '@nestjs/config';
import * as process from 'node:process';
import { Environment } from '../../../types/environment.enum';

export class InvalidatedRefreshTokenError extends Error {}

@Injectable()
export class RedisService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private _redisClient: Redis;

  constructor(
    @Inject(redisConfig.KEY)
    private readonly _redisConfig: ConfigType<typeof redisConfig>,
  ) {}

  onApplicationBootstrap(): void {
    this._redisClient =
      process.env.NODE_ENV === Environment.DEVELOPMENT
        ? new Redis({
            host: this._redisConfig.host,
            port: this._redisConfig.port,
          })
        : new Redis(`${process.env.REDIS_URL_PROD}`);
  }

  async insert(userId: number, tokenId: string): Promise<void> {
    await this._redisClient.set(this.getKey(userId), tokenId);
  }

  async validate(userId: number, tokenId: string): Promise<boolean> {
    const storedId = await this._redisClient.get(this.getKey(userId));

    if (storedId !== tokenId) {
      throw new InvalidatedRefreshTokenError();
    }

    return storedId === tokenId;
  }

  async invalidate(userId: number): Promise<void> {
    await this._redisClient.del(this.getKey(userId));
  }

  private getKey(userId: number): string {
    return `user-${userId}`;
  }

  async onApplicationShutdown(): Promise<string> {
    this._redisClient.flushdb();

    return this._redisClient.quit();
  }
}
