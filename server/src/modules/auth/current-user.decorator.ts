/**
 * CurrentUser 데코레이터
 * 인증된 사용자 정보를 컨트롤러에서 쉽게 접근
 */

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedRequest, AuthenticatedUser } from './auth.guard';

/**
 * @CurrentUser() 데코레이터
 * 
 * 사용 예시:
 * @Get()
 * async getProfile(@CurrentUser() user: AuthenticatedUser) {
 *   return this.service.getProfile(user.userId);
 * }
 * 
 * @Get()
 * async getProfile(@CurrentUser('userId') userId: string) {
 *   return this.service.getProfile(userId);
 * }
 */
export const CurrentUser = createParamDecorator(
  (data: keyof AuthenticatedUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user) {
      return null;
    }

    return data ? user[data] : user;
  },
);
