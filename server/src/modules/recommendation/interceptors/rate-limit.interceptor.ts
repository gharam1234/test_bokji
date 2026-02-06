/**
 * 요청 제한 데코레이터
 * 특정 액션에 대한 요청 횟수 제한
 */

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
  SetMetadata,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { CacheService } from '../services/cache.service';

/** Rate Limit 메타데이터 키 */
export const RATE_LIMIT_KEY = 'rateLimit';

/** Rate Limit 옵션 */
export interface RateLimitOptions {
  /** 제한 윈도우 (초) */
  windowSeconds: number;
  /** 윈도우 내 최대 요청 수 */
  maxRequests: number;
  /** 액션 식별자 */
  action: string;
}

/**
 * Rate Limit 데코레이터
 * @example
 * @RateLimit({ action: 'refresh', windowSeconds: 60, maxRequests: 1 })
 */
export const RateLimit = (options: RateLimitOptions) =>
  SetMetadata(RATE_LIMIT_KEY, options);

/**
 * Rate Limit 인터셉터
 */
@Injectable()
export class RateLimitInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly cacheService: CacheService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const options = this.reflector.get<RateLimitOptions>(
      RATE_LIMIT_KEY,
      context.getHandler(),
    );

    // Rate Limit 설정이 없으면 통과
    if (!options) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    
    // 사용자 ID 추출 (실제 구현시 인증에서 가져옴)
    const userId = request.user?.id || request.headers['x-user-id'] || 'anonymous';

    const { allowed, remainingTime } = await this.cacheService.checkRateLimit(
      userId,
      options.action,
      options.windowSeconds,
      options.maxRequests,
    );

    if (!allowed) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: `요청이 너무 많습니다. ${remainingTime}초 후에 다시 시도해주세요.`,
          error: 'Too Many Requests',
          retryAfter: remainingTime,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return next.handle();
  }
}
