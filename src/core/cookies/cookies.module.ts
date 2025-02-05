import {
  Global,
  Inject,
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { cookieConfig } from './configs/cookie.config';

@Global()
@Module({
  providers: [{ provide: cookieConfig.KEY, useValue: cookieConfig }],
  exports: [{ provide: cookieConfig.KEY, useValue: cookieConfig }],
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
