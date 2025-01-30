import {
  Inject,
  Injectable,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import Redis from 'ioredis';
import { redisConfig } from '../../configs/redis.config';
import { ConfigType } from '@nestjs/config';

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
    this._redisClient = new Redis({
      port: this._redisConfig.port,
      host: this._redisConfig.host,
    });
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
