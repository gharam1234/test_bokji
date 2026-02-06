/**
 * 관리자 계정 엔티티
 * 관리자 인증 및 권한 관리
 */

/** 관리자 역할 */
export type AdminRole = 'admin' | 'super_admin';

/** 관리자 계정 엔티티 */
export interface AdminUserEntity {
  /** 관리자 ID (UUID) */
  id: string;

  /** 이메일 (로그인 ID) */
  email: string;

  /** bcrypt 해시된 비밀번호 */
  passwordHash: string;

  /** 관리자 이름 */
  name: string;

  /** 관리자 역할 */
  role: AdminRole;

  /** 계정 활성 상태 */
  isActive: boolean;

  /** 마지막 로그인 시간 */
  lastLoginAt: Date | null;

  /** 연속 로그인 실패 횟수 */
  loginAttempts: number;

  /** 계정 잠금 해제 시간 */
  lockedUntil: Date | null;

  /** 생성 시간 */
  createdAt: Date;

  /** 수정 시간 */
  updatedAt: Date;
}

/** DB 레코드 → 엔티티 변환 */
export function toAdminUserEntity(row: Record<string, unknown>): AdminUserEntity {
  return {
    id: row.id as string,
    email: row.email as string,
    passwordHash: row.password_hash as string,
    name: row.name as string,
    role: row.role as AdminRole,
    isActive: row.is_active as boolean,
    lastLoginAt: row.last_login_at ? new Date(row.last_login_at as string) : null,
    loginAttempts: row.login_attempts as number,
    lockedUntil: row.locked_until ? new Date(row.locked_until as string) : null,
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
  };
}

/** 관리자 공개 정보 (비밀번호 제외) */
export interface AdminUserPublic {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** 엔티티 → 공개 정보 변환 */
export function toAdminUserPublic(entity: AdminUserEntity): AdminUserPublic {
  return {
    id: entity.id,
    email: entity.email,
    name: entity.name,
    role: entity.role,
    isActive: entity.isActive,
    lastLoginAt: entity.lastLoginAt?.toISOString() ?? null,
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
  };
}
