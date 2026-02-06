/**
 * 관리자 인증 컨트롤러
 * 로그인, 로그아웃, 현재 관리자 정보 조회 API
 */

import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { AdminAuthService } from '../services/admin-auth.service';
import { AdminLoginDto, validateAdminLoginDto, AdminLoginResponseDto } from '../dto/admin-login.dto';
import { AdminAuthGuard, AdminAuthenticatedRequest } from '../guards/admin-auth.guard';
import { CurrentAdmin } from '../decorators/admin.decorator';
import { AdminUserPublic } from '../entities/admin-user.entity';

@Controller('api/admin/auth')
export class AdminAuthController {
  private readonly logger = new Logger(AdminAuthController.name);

  constructor(private readonly authService: AdminAuthService) {}

  /**
   * 관리자 로그인
   * POST /api/admin/auth/login
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() body: unknown,
    @Req() request: Request
  ): Promise<AdminLoginResponseDto> {
    // 요청 데이터 검증
    const dto = validateAdminLoginDto(body);

    // IP 주소 추출
    const ipAddress =
      (request.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      request.socket.remoteAddress ||
      undefined;

    this.logger.log(`Login attempt from: ${ipAddress}`);

    return this.authService.login(dto, ipAddress);
  }

  /**
   * 관리자 로그아웃
   * POST /api/admin/auth/logout
   */
  @Post('logout')
  @UseGuards(AdminAuthGuard)
  @HttpCode(HttpStatus.OK)
  logout(@CurrentAdmin() admin: AdminUserPublic): { message: string } {
    this.logger.log(`Admin logged out: ${admin.email}`);
    // 클라이언트에서 토큰 삭제 처리
    // 서버에서는 토큰 블랙리스트 관리 가능 (선택사항)
    return { message: 'Logged out successfully' };
  }

  /**
   * 현재 관리자 정보 조회
   * GET /api/admin/auth/me
   */
  @Get('me')
  @UseGuards(AdminAuthGuard)
  async getMe(@CurrentAdmin() admin: AdminUserPublic): Promise<AdminUserPublic> {
    return this.authService.getMe(admin.id);
  }

  /**
   * 토큰 갱신
   * POST /api/admin/auth/refresh
   */
  @Post('refresh')
  @UseGuards(AdminAuthGuard)
  async refresh(
    @CurrentAdmin() admin: AdminUserPublic
  ): Promise<AdminLoginResponseDto> {
    // 현재 관리자 정보로 새 토큰 발급
    const { createAdminJwt, ADMIN_JWT_EXPIRES_IN } = await import('../guards/admin-auth.guard');
    const freshAdmin = await this.authService.getMe(admin.id);
    const accessToken = createAdminJwt(freshAdmin);

    return {
      admin: freshAdmin,
      accessToken,
      expiresIn: ADMIN_JWT_EXPIRES_IN,
    };
  }
}
