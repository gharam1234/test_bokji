/**
 * Auth 모듈
 * 인증/인가 관련 기능 제공
 */

import { Module, Global } from '@nestjs/common';
import { AuthGuard } from './auth.guard';

@Global()
@Module({
  providers: [AuthGuard],
  exports: [AuthGuard],
})
export class AuthModule {}
