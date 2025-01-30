import { Inject, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { cookieConfig } from './configs/cookie.config';

@Module({
  imports: [ConfigModule.forFeature(cookieConfig)],
})
export class CookiesModule implements NestModule {
  constructor(
    @Inject(cookieConfig.KEY)
    private readonly _config: ConfigType<typeof cookieConfig>,
  ) {}

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(cookieParser(this._config.secret)).forRoutes('*');
  }
}
