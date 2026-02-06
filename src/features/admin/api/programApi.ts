/**
 * 프로그램 관리 API 클라이언트
 */

import { ADMIN_API, ADMIN_STORAGE_KEYS } from '../constants/routes';
import type {
  WelfareProgram,
  CreateProgramRequest,
  UpdateProgramRequest,
  ProgramListParams,
  PaginatedResponse,
} from '../types';

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
 * 프로그램 목록 조회
 */
export async function getPrograms(
  params: ProgramListParams = {}
): Promise<PaginatedResponse<WelfareProgram>> {
  const query = toQueryString(params as Record<string, unknown>);
  const response = await fetch(`${API_BASE_URL}${ADMIN_API.PROGRAMS.BASE}${query}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return handleResponse<PaginatedResponse<WelfareProgram>>(response);
}

/**
 * 프로그램 상세 조회
 */
export async function getProgram(
  id: string,
  includeDeleted: boolean = false
): Promise<WelfareProgram> {
  const query = includeDeleted ? '?includeDeleted=true' : '';
  const response = await fetch(
    `${API_BASE_URL}${ADMIN_API.PROGRAMS.DETAIL(id)}${query}`,
    {
      method: 'GET',
      headers: getAuthHeaders(),
    }
  );

  return handleResponse<WelfareProgram>(response);
}

/**
 * 프로그램 생성
 */
export async function createProgram(
  data: CreateProgramRequest
): Promise<WelfareProgram> {
  const response = await fetch(`${API_BASE_URL}${ADMIN_API.PROGRAMS.BASE}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  return handleResponse<WelfareProgram>(response);
}

/**
 * 프로그램 수정
 */
export async function updateProgram(
  id: string,
  data: UpdateProgramRequest
): Promise<WelfareProgram> {
  const response = await fetch(`${API_BASE_URL}${ADMIN_API.PROGRAMS.DETAIL(id)}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  return handleResponse<WelfareProgram>(response);
}

/**
 * 프로그램 삭제
 */
export async function deleteProgram(id: string): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}${ADMIN_API.PROGRAMS.DETAIL(id)}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  return handleResponse<{ message: string }>(response);
}

/**
 * 프로그램 복구
 */
export async function restoreProgram(id: string): Promise<WelfareProgram> {
  const response = await fetch(`${API_BASE_URL}${ADMIN_API.PROGRAMS.RESTORE(id)}`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  return handleResponse<WelfareProgram>(response);
}
