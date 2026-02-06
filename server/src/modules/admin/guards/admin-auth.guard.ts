/**
 * 관리자 인증 가드
 * 관리자 JWT 토큰 검증 및 권한 확인
 */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { AdminUserPublic } from '../entities/admin-user.entity';

/** JWT Secret (실제 운영 시 환경변수로 관리) */
export const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'admin-jwt-secret-key-change-in-production';

/** JWT 만료 시간 (초) */
export const ADMIN_JWT_EXPIRES_IN = 3600; // 1시간

/** 인증된 관리자 요청 */
export interface AdminAuthenticatedRequest extends Request {
  admin: AdminUserPublic;
}

/** 간단한 JWT 디코딩 (실제 운영 시 jsonwebtoken 라이브러리 사용) */
function decodeJwt(token: string): AdminUserPublic | null {
  try {
    // JWT 구조: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    // Payload 디코딩 (Base64)
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));

    // 만료 시간 확인
    if (payload.exp && payload.exp < Date.now() / 1000) {
      return null;
    }

    return payload.admin as AdminUserPublic;
  } catch {
    return null;
  }
}

/** 간단한 JWT 생성 */
export function createAdminJwt(admin: AdminUserPublic): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    admin,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + ADMIN_JWT_EXPIRES_IN,
  };

  const headerBase64 = Buffer.from(JSON.stringify(header)).toString('base64url');
  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url');

  // 간단한 서명 (실제 운영 시 crypto 사용)
  const signature = Buffer.from(`${headerBase64}.${payloadBase64}.${ADMIN_JWT_SECRET}`)
    .toString('base64url')
    .slice(0, 43);

  return `${headerBase64}.${payloadBase64}.${signature}`;
}

@Injectable()
export class AdminAuthGuard implements CanActivate {
  private readonly logger = new Logger(AdminAuthGuard.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AdminAuthenticatedRequest>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('관리자 인증 토큰이 필요합니다.');
    }

    try {
      const admin = decodeJwt(token);

      if (!admin) {
        throw new UnauthorizedException('유효하지 않거나 만료된 토큰입니다.');
      }

      if (!admin.isActive) {
        throw new UnauthorizedException('비활성화된 관리자 계정입니다.');
      }

      request.admin = admin;
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.warn(`Admin token validation failed: ${error.message}`);
      throw new UnauthorizedException('유효하지 않은 관리자 토큰입니다.');
    }
  }

  /** Authorization 헤더에서 Bearer 토큰 추출 */
  private extractTokenFromHeader(request: Request): string | undefined {
    const authorization = request.headers.authorization;
    if (!authorization) return undefined;

    const [type, token] = authorization.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
