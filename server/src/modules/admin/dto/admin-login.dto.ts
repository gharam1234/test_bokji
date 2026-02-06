/**
 * 관리자 로그인 DTO
 * 로그인 요청 데이터 검증
 */

/** 로그인 요청 DTO */
export interface AdminLoginDto {
  /** 관리자 이메일 */
  email: string;

  /** 비밀번호 */
  password: string;
}

/** 로그인 요청 유효성 검사 */
export function validateAdminLoginDto(data: unknown): AdminLoginDto {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid request body');
  }

  const dto = data as Record<string, unknown>;

  // 이메일 검증
  if (!dto.email || typeof dto.email !== 'string') {
    throw new Error('이메일을 입력해주세요.');
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(dto.email)) {
    throw new Error('유효한 이메일 형식이 아닙니다.');
  }

  // 비밀번호 검증
  if (!dto.password || typeof dto.password !== 'string') {
    throw new Error('비밀번호를 입력해주세요.');
  }

  if (dto.password.length < 6) {
    throw new Error('비밀번호는 최소 6자 이상이어야 합니다.');
  }

  return {
    email: dto.email.toLowerCase().trim(),
    password: dto.password,
  };
}

/** 로그인 응답 DTO */
export interface AdminLoginResponseDto {
  /** 관리자 정보 */
  admin: {
    id: string;
    email: string;
    name: string;
    role: string;
    isActive: boolean;
    lastLoginAt: string | null;
    createdAt: string;
    updatedAt: string;
  };

  /** 액세스 토큰 */
  accessToken: string;

  /** 토큰 만료 시간 (초) */
  expiresIn: number;
}
