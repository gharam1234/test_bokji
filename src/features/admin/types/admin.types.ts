/**
 * 관리자 관련 타입 정의
 */

/** 관리자 역할 */
export type AdminRole = 'admin' | 'super_admin';

/** 관리자 계정 */
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** 관리자 로그인 요청 */
export interface AdminLoginRequest {
  email: string;
  password: string;
}

/** 관리자 로그인 응답 */
export interface AdminLoginResponse {
  admin: AdminUser;
  accessToken: string;
  expiresIn: number;
}

/** 관리자 인증 상태 */
export interface AdminAuthState {
  admin: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
