/**
 * 관리자 데코레이터
 * 컨트롤러에서 현재 로그인한 관리자 정보 접근
 */

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AdminAuthenticatedRequest } from '../guards/admin-auth.guard';
import { AdminUserPublic } from '../entities/admin-user.entity';

/**
 * 현재 관리자 데코레이터
 * @example
 * @Get('me')
 * getMe(@CurrentAdmin() admin: AdminUserPublic) {
 *   return admin;
 * }
 */
export const CurrentAdmin = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AdminUserPublic => {
    const request = ctx.switchToHttp().getRequest<AdminAuthenticatedRequest>();
    return request.admin;
  },
);

/**
 * 관리자 ID만 추출하는 데코레이터
 * @example
 * @Get('logs')
 * getLogs(@AdminId() adminId: string) {
 *   return this.service.getLogs(adminId);
 * }
 */
export const AdminId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<AdminAuthenticatedRequest>();
    return request.admin.id;
  },
);
