import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs';
import { REFRESH_TOKEN_KEY } from '../constants';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response> {
    const request: Request = context.switchToHttp().getRequest();
    const now: number = Date.now();

    return next.handle().pipe(
      tap(() => {
        console.log(
          `[After ${Date.now() - now}ms] refreshToken from http cookies = ${request.cookies[REFRESH_TOKEN_KEY]} from ${request.url}`,
        );
      }),
    );
  }
}
