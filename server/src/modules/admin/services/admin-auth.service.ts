/**
 * 관리자 인증 서비스
 * 로그인, 로그아웃, 세션 관리
 */

import { Injectable, Logger, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Pool } from 'pg';
import {
  AdminUserEntity,
  AdminUserPublic,
  toAdminUserEntity,
  toAdminUserPublic,
} from '../entities/admin-user.entity';
import { AdminLoginDto, AdminLoginResponseDto } from '../dto/admin-login.dto';
import { createAdminJwt, ADMIN_JWT_EXPIRES_IN } from '../guards/admin-auth.guard';

/** 로그인 실패 시 잠금 설정 */
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MINUTES = 15;

@Injectable()
export class AdminAuthService {
  private readonly logger = new Logger(AdminAuthService.name);

  constructor(private readonly pool: Pool) {}

  /**
   * 관리자 로그인
   */
  async login(dto: AdminLoginDto, ipAddress?: string): Promise<AdminLoginResponseDto> {
    const { email, password } = dto;

    // 관리자 조회
    const admin = await this.findByEmail(email);

    if (!admin) {
      this.logger.warn(`Login attempt for non-existent admin: ${email}`);
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    // 계정 잠금 확인
    if (admin.lockedUntil && admin.lockedUntil > new Date()) {
      const remainingMinutes = Math.ceil(
        (admin.lockedUntil.getTime() - Date.now()) / (1000 * 60)
      );
      throw new ForbiddenException(
        `계정이 잠금되었습니다. ${remainingMinutes}분 후에 다시 시도해주세요.`
      );
    }

    // 비활성 계정 확인
    if (!admin.isActive) {
      throw new ForbiddenException('비활성화된 계정입니다. 관리자에게 문의하세요.');
    }

    // 비밀번호 검증 (실제 운영 시 bcrypt.compare 사용)
    const isPasswordValid = await this.verifyPassword(password, admin.passwordHash);

    if (!isPasswordValid) {
      await this.handleFailedLogin(admin);
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    // 로그인 성공 처리
    await this.handleSuccessfulLogin(admin.id, ipAddress);

    // 업데이트된 관리자 정보 조회
    const updatedAdmin = await this.findById(admin.id);
    if (!updatedAdmin) {
      throw new Error('관리자 정보 조회 실패');
    }

    // JWT 토큰 생성
    const adminPublic = toAdminUserPublic(updatedAdmin);
    const accessToken = createAdminJwt(adminPublic);

    this.logger.log(`Admin logged in: ${email}`);

    return {
      admin: adminPublic,
      accessToken,
      expiresIn: ADMIN_JWT_EXPIRES_IN,
    };
  }

  /**
   * 현재 관리자 정보 조회
   */
  async getMe(adminId: string): Promise<AdminUserPublic> {
    const admin = await this.findById(adminId);
    if (!admin) {
      throw new UnauthorizedException('관리자 정보를 찾을 수 없습니다.');
    }
    return toAdminUserPublic(admin);
  }

  /**
   * 이메일로 관리자 조회
   */
  private async findByEmail(email: string): Promise<AdminUserEntity | null> {
    const result = await this.pool.query(
      'SELECT * FROM admin_user WHERE email = $1',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return toAdminUserEntity(result.rows[0]);
  }

  /**
   * ID로 관리자 조회
   */
  private async findById(id: string): Promise<AdminUserEntity | null> {
    const result = await this.pool.query(
      'SELECT * FROM admin_user WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return toAdminUserEntity(result.rows[0]);
  }

  /**
   * 비밀번호 검증
   * TODO: 실제 운영 시 bcrypt.compare 사용
   */
  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    // 간단한 검증 (테스트용) - 실제로는 bcrypt 사용 필요
    // 초기 비밀번호: admin123!
    if (hash === '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4WwuG.VqVzjXK6Gy') {
      return password === 'admin123!';
    }
    // bcrypt 해시 형식이면 bcrypt 비교 필요
    return false;
  }

  /**
   * 로그인 실패 처리
   */
  private async handleFailedLogin(admin: AdminUserEntity): Promise<void> {
    const newAttempts = admin.loginAttempts + 1;
    let lockedUntil: Date | null = null;

    if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
      lockedUntil = new Date(Date.now() + LOCK_DURATION_MINUTES * 60 * 1000);
      this.logger.warn(`Admin account locked: ${admin.email}`);
    }

    await this.pool.query(
      `UPDATE admin_user 
       SET login_attempts = $1, locked_until = $2 
       WHERE id = $3`,
      [newAttempts, lockedUntil, admin.id]
    );
  }

  /**
   * 로그인 성공 처리
   */
  private async handleSuccessfulLogin(adminId: string, ipAddress?: string): Promise<void> {
    await this.pool.query(
      `UPDATE admin_user 
       SET login_attempts = 0, locked_until = NULL, last_login_at = CURRENT_TIMESTAMP 
       WHERE id = $1`,
      [adminId]
    );

    // 로그인 감사 로그 기록 (별도 처리)
    this.logger.log(`Admin login successful: ${adminId} from ${ipAddress || 'unknown'}`);
  }
}
