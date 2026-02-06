/**
 * 통계 API 클라이언트
 */

import { ADMIN_API, ADMIN_STORAGE_KEYS } from '../constants/routes';
import type { DashboardStats, ProgramStats } from '../types';

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
 * 대시보드 통계 개요 조회
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await fetch(`${API_BASE_URL}${ADMIN_API.STATS.OVERVIEW}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return handleResponse<DashboardStats>(response);
}

/**
 * 프로그램 상세 통계 조회
 */
export async function getProgramStats(): Promise<ProgramStats> {
  const response = await fetch(`${API_BASE_URL}${ADMIN_API.STATS.PROGRAMS}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return handleResponse<ProgramStats>(response);
}
