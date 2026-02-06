/**
 * 인증 가드
 * JWT 토큰 검증 및 사용자 인증 처리
 */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';

/** 인증된 사용자 정보 */
export interface AuthenticatedUser {
  userId: string;
  email?: string;
  role?: string;
}

/** Request with User */
export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('인증 토큰이 필요합니다.');
    }

    try {
      // JWT 토큰 검증 (실제 구현 시 JWT 라이브러리 사용)
      const payload = await this.verifyToken(token);
      request.user = payload;
    } catch (error) {
      this.logger.warn(`Invalid token: ${error.message}`);
      throw new UnauthorizedException('유효하지 않은 인증 토큰입니다.');
    }

    return true;
  }

  /**
   * Authorization 헤더에서 Bearer 토큰 추출
   */
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  /**
   * 토큰 검증
   * TODO: 실제 JWT 라이브러리 (jsonwebtoken, @nestjs/jwt) 연동
   */
  private async verifyToken(token: string): Promise<AuthenticatedUser> {
    // 개발 환경에서는 간단한 토큰 검증
    // 실제 환경에서는 JWT 검증 로직 구현 필요
    
    // 개발용 토큰 형식: dev-token-{userId}
    if (token.startsWith('dev-token-')) {
      const userId = token.replace('dev-token-', '');
      return { userId };
    }

    // 테스트용 고정 토큰
    if (token === 'test-auth-token') {
      return { userId: 'test-user-id' };
    }

    // JWT 토큰 검증 (실제 구현)
    // const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // return { userId: decoded.sub, email: decoded.email, role: decoded.role };

    throw new Error('Invalid token format');
  }
}
