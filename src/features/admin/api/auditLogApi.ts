/**
 * 감사 로그 API 클라이언트
 */

import { ADMIN_API, ADMIN_STORAGE_KEYS } from '../constants/routes';
import type { AuditLog, AuditLogParams, PaginatedResponse } from '../types';

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

/** 쿼리 파라미터 변환 */
function toQueryString(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * 감사 로그 목록 조회
 */
export async function getAuditLogs(
  params: AuditLogParams = {}
): Promise<PaginatedResponse<AuditLog>> {
  const query = toQueryString(params as Record<string, unknown>);
  const response = await fetch(`${API_BASE_URL}${ADMIN_API.AUDIT_LOGS.BASE}${query}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return handleResponse<PaginatedResponse<AuditLog>>(response);
}

/**
 * 특정 엔티티의 감사 로그 조회
 */
export async function getEntityAuditLogs(
  entityType: string,
  entityId: string
): Promise<AuditLog[]> {
  const response = await fetch(
    `${API_BASE_URL}${ADMIN_API.AUDIT_LOGS.ENTITY(entityType, entityId)}`,
    {
      method: 'GET',
      headers: getAuthHeaders(),
    }
  );

  return handleResponse<AuditLog[]>(response);
}

/**
 * 최근 감사 로그 조회 (대시보드용)
 */
export async function getRecentAuditLogs(limit: number = 10): Promise<AuditLog[]> {
  const response = await fetch(
    `${API_BASE_URL}${ADMIN_API.AUDIT_LOGS.RECENT}?limit=${limit}`,
    {
      method: 'GET',
      headers: getAuthHeaders(),
    }
  );

  return handleResponse<AuditLog[]>(response);
}
