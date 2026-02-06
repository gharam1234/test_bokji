/**
 * 알림 상수 정의
 * 프론트엔드에서 사용되는 알림 관련 상수들
 */

import { NotificationType, EmailDigestFrequency } from '../types/notification.types';

/**
 * 알림 유형별 레이블
 */
export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  [NotificationType.NEW_WELFARE]: '새 복지 프로그램',
  [NotificationType.DEADLINE_ALERT]: '마감 임박',
  [NotificationType.PROFILE_MATCH]: '프로필 매칭',
  [NotificationType.RECOMMENDATION]: '맞춤 추천',
  [NotificationType.SYSTEM]: '시스템 공지',
};

/**
 * 알림 유형별 아이콘 (Heroicons 이름)
 */
export const NOTIFICATION_TYPE_ICONS: Record<NotificationType, string> = {
  [NotificationType.NEW_WELFARE]: 'sparkles',
  [NotificationType.DEADLINE_ALERT]: 'clock',
  [NotificationType.PROFILE_MATCH]: 'user-circle',
  [NotificationType.RECOMMENDATION]: 'light-bulb',
  [NotificationType.SYSTEM]: 'megaphone',
};

/**
 * 알림 유형별 색상 (Tailwind CSS 클래스)
 */
export const NOTIFICATION_TYPE_COLORS: Record<NotificationType, string> = {
  [NotificationType.NEW_WELFARE]: 'text-green-500 bg-green-50',
  [NotificationType.DEADLINE_ALERT]: 'text-orange-500 bg-orange-50',
  [NotificationType.PROFILE_MATCH]: 'text-blue-500 bg-blue-50',
  [NotificationType.RECOMMENDATION]: 'text-purple-500 bg-purple-50',
  [NotificationType.SYSTEM]: 'text-gray-500 bg-gray-50',
};

/**
 * 이메일 수신 빈도 레이블
 */
export const EMAIL_FREQUENCY_LABELS: Record<EmailDigestFrequency, string> = {
  [EmailDigestFrequency.REALTIME]: '즉시 발송',
  [EmailDigestFrequency.DAILY]: '일간 요약',
  [EmailDigestFrequency.WEEKLY]: '주간 요약',
  [EmailDigestFrequency.NONE]: '수신 안함',
};

/**
 * 기본 페이지 크기
 */
export const DEFAULT_PAGE_SIZE = 20;

/**
 * 최대 페이지 크기
 */
export const MAX_PAGE_SIZE = 50;

/**
 * SSE 재연결 간격 (밀리초)
 */
export const SSE_RECONNECT_INTERVAL = 5000;

/**
 * 토스트 표시 시간 (밀리초)
 */
export const TOAST_DURATION = 5000;

/**
 * 알림 새로고침 간격 (밀리초)
 */
export const NOTIFICATION_REFRESH_INTERVAL = 60000;

/**
 * API 기본 URL
 */
export const API_BASE_URL = '/api/notifications';
