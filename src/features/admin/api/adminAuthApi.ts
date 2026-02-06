/**
 * 관리자 인증 API 클라이언트
 */

import { ADMIN_API, ADMIN_STORAGE_KEYS } from '../constants/routes';
import type { AdminUser, AdminLoginRequest, AdminLoginResponse } from '../types';

/** API 기본 URL */
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

/** 인증 헤더 가져오기 */
function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem(ADMIN_STORAGE_KEYS.ACCESS_TOKEN);
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/** API 응답 처리 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  return response.json();
}

/**
 * 관리자 로그인
 */
export async function adminLogin(credentials: AdminLoginRequest): Promise<AdminLoginResponse> {
  const response = await fetch(`${API_BASE_URL}${ADMIN_API.AUTH.LOGIN}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  const data = await handleResponse<AdminLoginResponse>(response);

  // 토큰 저장
  localStorage.setItem(ADMIN_STORAGE_KEYS.ACCESS_TOKEN, data.accessToken);
  localStorage.setItem(ADMIN_STORAGE_KEYS.ADMIN_INFO, JSON.stringify(data.admin));

  return data;
}

/**
 * 관리자 로그아웃
 */
export async function adminLogout(): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}${ADMIN_API.AUTH.LOGOUT}`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
  } finally {
    // 로컬 스토리지 정리
    localStorage.removeItem(ADMIN_STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(ADMIN_STORAGE_KEYS.ADMIN_INFO);
  }
}

/**
 * 현재 관리자 정보 조회
 */
export async function getAdminMe(): Promise<AdminUser> {
  const response = await fetch(`${API_BASE_URL}${ADMIN_API.AUTH.ME}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return handleResponse<AdminUser>(response);
}

/**
 * 토큰 갱신
 */
export async function refreshAdminToken(): Promise<AdminLoginResponse> {
  const response = await fetch(`${API_BASE_URL}${ADMIN_API.AUTH.REFRESH}`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  const data = await handleResponse<AdminLoginResponse>(response);

  // 새 토큰 저장
  localStorage.setItem(ADMIN_STORAGE_KEYS.ACCESS_TOKEN, data.accessToken);
  localStorage.setItem(ADMIN_STORAGE_KEYS.ADMIN_INFO, JSON.stringify(data.admin));

  return data;
}

/**
 * 저장된 토큰 확인
 */
export function getStoredToken(): string | null {
  return localStorage.getItem(ADMIN_STORAGE_KEYS.ACCESS_TOKEN);
}

/**
 * 저장된 관리자 정보 확인
 */
export function getStoredAdmin(): AdminUser | null {
  const stored = localStorage.getItem(ADMIN_STORAGE_KEYS.ADMIN_INFO);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}
