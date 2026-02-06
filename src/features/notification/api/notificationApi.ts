/**
 * 알림 API 클라이언트
 * 알림 관련 API 호출 함수
 */

import {
  GetNotificationsParams,
  GetNotificationsResponse,
  UnreadCountResponse,
  MarkAsReadRequest,
  MarkAsReadResponse,
  MarkSingleAsReadResponse,
  DeleteNotificationsRequest,
  DeleteNotificationsResponse,
  GetSettingsResponse,
  UpdateSettingsRequest,
  UpdateSettingsResponse,
  RegisterFcmTokenRequest,
  DeleteFcmTokenRequest,
  FcmTokenResponse,
} from '../types/notification.types';
import { API_BASE_URL } from '../constants/notification.constants';

// API 기본 URL (환경변수에서 가져오기)
const BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * API 요청 헬퍼 함수
 */
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `API Error: ${response.status}`);
  }

  // 204 No Content 처리
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// ==================== 알림 목록 API ====================

/**
 * 알림 목록 조회
 * GET /api/notifications
 */
export async function getNotifications(
  params: GetNotificationsParams = {},
): Promise<GetNotificationsResponse> {
  const searchParams = new URLSearchParams();

  if (params.type) searchParams.append('type', params.type);
  if (params.isRead !== undefined) searchParams.append('isRead', String(params.isRead));
  if (params.page) searchParams.append('page', String(params.page));
  if (params.limit) searchParams.append('limit', String(params.limit));

  const queryString = searchParams.toString();
  const url = queryString ? `${API_BASE_URL}?${queryString}` : API_BASE_URL;

  return fetchApi<GetNotificationsResponse>(url);
}

/**
 * 읽지 않은 알림 개수 조회
 * GET /api/notifications/unread-count
 */
export async function getUnreadCount(): Promise<UnreadCountResponse> {
  return fetchApi<UnreadCountResponse>(`${API_BASE_URL}/unread-count`);
}

// ==================== 알림 읽음 처리 API ====================

/**
 * 알림 읽음 처리 (복수)
 * PATCH /api/notifications/read
 */
export async function markAsRead(
  request: MarkAsReadRequest,
): Promise<MarkAsReadResponse> {
  return fetchApi<MarkAsReadResponse>(`${API_BASE_URL}/read`, {
    method: 'PATCH',
    body: JSON.stringify(request),
  });
}

/**
 * 단일 알림 읽음 처리
 * PATCH /api/notifications/:id/read
 */
export async function markSingleAsRead(
  notificationId: string,
): Promise<MarkSingleAsReadResponse> {
  return fetchApi<MarkSingleAsReadResponse>(`${API_BASE_URL}/${notificationId}/read`, {
    method: 'PATCH',
  });
}

/**
 * 모든 알림 읽음 처리
 * PATCH /api/notifications/read (빈 배열 전송)
 */
export async function markAllAsRead(): Promise<MarkAsReadResponse> {
  return markAsRead({ notificationIds: [] });
}

// ==================== 알림 삭제 API ====================

/**
 * 알림 삭제 (복수)
 * DELETE /api/notifications
 */
export async function deleteNotifications(
  request: DeleteNotificationsRequest,
): Promise<DeleteNotificationsResponse> {
  return fetchApi<DeleteNotificationsResponse>(API_BASE_URL, {
    method: 'DELETE',
    body: JSON.stringify(request),
  });
}

/**
 * 단일 알림 삭제
 * DELETE /api/notifications/:id
 */
export async function deleteSingleNotification(
  notificationId: string,
): Promise<DeleteNotificationsResponse> {
  return fetchApi<DeleteNotificationsResponse>(`${API_BASE_URL}/${notificationId}`, {
    method: 'DELETE',
  });
}

/**
 * 모든 알림 삭제
 * DELETE /api/notifications (빈 배열 전송)
 */
export async function deleteAllNotifications(): Promise<DeleteNotificationsResponse> {
  return deleteNotifications({ notificationIds: [] });
}

// ==================== 알림 설정 API ====================

/**
 * 알림 설정 조회
 * GET /api/notifications/settings
 */
export async function getSettings(): Promise<GetSettingsResponse> {
  return fetchApi<GetSettingsResponse>(`${API_BASE_URL}/settings`);
}

/**
 * 알림 설정 업데이트
 * PATCH /api/notifications/settings
 */
export async function updateSettings(
  request: UpdateSettingsRequest,
): Promise<UpdateSettingsResponse> {
  return fetchApi<UpdateSettingsResponse>(`${API_BASE_URL}/settings`, {
    method: 'PATCH',
    body: JSON.stringify(request),
  });
}

// ==================== FCM 토큰 API ====================

/**
 * FCM 토큰 등록
 * POST /api/notifications/fcm-token
 */
export async function registerFcmToken(
  request: RegisterFcmTokenRequest,
): Promise<FcmTokenResponse> {
  return fetchApi<FcmTokenResponse>(`${API_BASE_URL}/fcm-token`, {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

/**
 * FCM 토큰 삭제
 * DELETE /api/notifications/fcm-token
 */
export async function deleteFcmToken(
  request: DeleteFcmTokenRequest,
): Promise<FcmTokenResponse> {
  return fetchApi<FcmTokenResponse>(`${API_BASE_URL}/fcm-token`, {
    method: 'DELETE',
    body: JSON.stringify(request),
  });
}
