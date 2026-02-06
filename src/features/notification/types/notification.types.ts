/**
 * 알림 타입 정의
 * 알림 시스템에서 사용되는 TypeScript 타입들
 */

// ==================== Enums ====================

/**
 * 알림 유형
 */
export enum NotificationType {
  /** 새 복지 프로그램 등록 */
  NEW_WELFARE = 'new_welfare',
  /** 새 복지 프로그램 등록 (alias) */
  WELFARE_NEW = 'new_welfare',
  /** 마감 임박 알림 */
  DEADLINE_ALERT = 'deadline_alert',
  /** 프로필 매칭 복지 발견 */
  PROFILE_MATCH = 'profile_match',
  /** 맞춤 추천 알림 */
  RECOMMENDATION = 'recommendation',
  /** 시스템 공지 */
  SYSTEM = 'system',
}

/**
 * 알림 채널
 */
export enum NotificationChannel {
  /** 인앱 알림 */
  IN_APP = 'in_app',
  /** 푸시 알림 (FCM) */
  PUSH = 'push',
  /** 이메일 알림 */
  EMAIL = 'email',
}

/**
 * 이메일 수신 빈도
 */
export enum EmailDigestFrequency {
  /** 즉시 */
  REALTIME = 'realtime',
  /** 일간 요약 */
  DAILY = 'daily',
  /** 주간 요약 */
  WEEKLY = 'weekly',
  /** 수신 안함 */
  NONE = 'none',
}

/**
 * 알림 우선순위
 */
export enum NotificationPriority {
  /** 낮음 */
  LOW = 'low',
  /** 보통 */
  NORMAL = 'normal',
  /** 높음 */
  HIGH = 'high',
  /** 긴급 */
  URGENT = 'urgent',
}

/**
 * 디바이스 유형
 */
export enum DeviceType {
  WEB = 'web',
  ANDROID = 'android',
  IOS = 'ios',
}

// ==================== 알림 메타데이터 ====================

/**
 * 알림 메타데이터 인터페이스
 */
export interface NotificationMetadata {
  /** 연관 복지 프로그램 ID */
  programId?: string;
  /** 복지 프로그램 이름 */
  programName?: string;
  /** 매칭 점수 */
  matchScore?: number;
  /** 마감일 */
  deadline?: string;
  /** 카테고리 */
  category?: string;
  /** 남은 일수 */
  daysLeft?: number;
  /** 추천 개수 */
  count?: number;
  /** 기타 추가 데이터 */
  [key: string]: any;
}

// ==================== 알림 아이템 ====================

/**
 * 알림 아이템 (목록/상세용)
 */
export interface NotificationItem {
  /** 알림 ID */
  id: string;
  /** 알림 유형 */
  type: NotificationType;
  /** 알림 제목 */
  title: string;
  /** 알림 본문 */
  message: string;
  /** 클릭 시 이동할 URL */
  linkUrl?: string;
  /** 읽음 여부 */
  isRead: boolean;
  /** 생성 시각 */
  createdAt: string;
  /** 추가 메타데이터 */
  metadata?: NotificationMetadata;
}

// ==================== 알림 설정 ====================

/**
 * 알림 설정 인터페이스
 */
export interface NotificationSetting {
  /** 설정 ID */
  id: string;
  /** 사용자 ID */
  userId: string;
  
  // 채널별 설정
  /** 인앱 알림 활성화 */
  inAppEnabled: boolean;
  /** 푸시 알림 활성화 */
  pushEnabled: boolean;
  /** 이메일 알림 활성화 */
  emailEnabled: boolean;
  
  // 유형별 설정
  /** 새 복지 알림 수신 */
  newWelfareEnabled: boolean;
  /** 마감 임박 알림 수신 */
  deadlineAlertEnabled: boolean;
  /** 추천 알림 수신 */
  recommendationEnabled: boolean;
  
  // 방해금지 시간
  /** 방해금지 시간 활성화 */
  quietHoursEnabled: boolean;
  /** 방해금지 시작 시간 (HH:mm) */
  quietHoursStart?: string;
  /** 방해금지 종료 시간 (HH:mm) */
  quietHoursEnd?: string;
  
  /** 이메일 수신 빈도 */
  emailDigestFrequency: EmailDigestFrequency;
  
  /** 생성 시각 */
  createdAt: string;
  /** 수정 시각 */
  updatedAt: string;
}

// ==================== API 요청/응답 타입 ====================

/**
 * 알림 목록 요청 파라미터
 */
export interface GetNotificationsParams {
  /** 알림 유형 필터 */
  type?: NotificationType;
  /** 읽음 상태 필터 */
  isRead?: boolean;
  /** 페이지 번호 */
  page?: number;
  /** 페이지당 개수 */
  limit?: number;
}

/**
 * 알림 목록 응답
 */
export interface GetNotificationsResponse {
  /** 알림 목록 */
  notifications: NotificationItem[];
  /** 전체 개수 */
  totalCount: number;
  /** 읽지 않은 개수 */
  unreadCount: number;
  /** 현재 페이지 */
  page: number;
  /** 페이지당 개수 */
  limit: number;
  /** 다음 페이지 존재 여부 */
  hasMore: boolean;
}

/**
 * 읽지 않은 알림 개수 응답
 */
export interface UnreadCountResponse {
  /** 읽지 않은 개수 */
  count: number;
}

/**
 * 알림 읽음 처리 요청
 */
export interface MarkAsReadRequest {
  /** 읽음 처리할 알림 ID 배열 */
  notificationIds: string[];
}

/**
 * 알림 읽음 처리 응답
 */
export interface MarkAsReadResponse {
  /** 성공 여부 */
  success: boolean;
  /** 업데이트된 개수 */
  updatedCount: number;
}

/**
 * 단일 알림 읽음 처리 응답
 */
export interface MarkSingleAsReadResponse {
  /** 성공 여부 */
  success: boolean;
  /** 읽은 시각 */
  readAt: string;
}

/**
 * 알림 삭제 요청
 */
export interface DeleteNotificationsRequest {
  /** 삭제할 알림 ID 배열 */
  notificationIds: string[];
}

/**
 * 알림 삭제 응답
 */
export interface DeleteNotificationsResponse {
  /** 성공 여부 */
  success: boolean;
  /** 삭제된 개수 */
  deletedCount: number;
}

/**
 * 알림 설정 조회 응답
 */
export interface GetSettingsResponse {
  /** 알림 설정 */
  settings: NotificationSetting;
}

/**
 * 알림 설정 업데이트 요청
 */
export interface UpdateSettingsRequest {
  /** 인앱 알림 활성화 */
  inAppEnabled?: boolean;
  /** 푸시 알림 활성화 */
  pushEnabled?: boolean;
  /** 이메일 알림 활성화 */
  emailEnabled?: boolean;
  /** 새 복지 알림 수신 */
  newWelfareEnabled?: boolean;
  /** 마감 임박 알림 수신 */
  deadlineAlertEnabled?: boolean;
  /** 추천 알림 수신 */
  recommendationEnabled?: boolean;
  /** 방해금지 시간 활성화 */
  quietHoursEnabled?: boolean;
  /** 방해금지 시작 시간 */
  quietHoursStart?: string;
  /** 방해금지 종료 시간 */
  quietHoursEnd?: string;
  /** 이메일 수신 빈도 */
  emailDigestFrequency?: EmailDigestFrequency;
}

/**
 * 알림 설정 업데이트 응답
 */
export interface UpdateSettingsResponse {
  /** 성공 여부 */
  success: boolean;
  /** 업데이트된 설정 */
  settings: NotificationSetting;
}

/**
 * FCM 토큰 등록 요청
 */
export interface RegisterFcmTokenRequest {
  /** FCM 토큰 */
  token: string;
  /** 디바이스 유형 */
  deviceType: DeviceType;
}

/**
 * FCM 토큰 삭제 요청
 */
export interface DeleteFcmTokenRequest {
  /** FCM 토큰 */
  token: string;
}

/**
 * FCM 토큰 응답
 */
export interface FcmTokenResponse {
  /** 성공 여부 */
  success: boolean;
}

// ==================== SSE 이벤트 ====================

/**
 * SSE 알림 이벤트 타입
 */
export type SSEEventType = 'new-notification' | 'heartbeat' | 'connected';

/**
 * SSE 알림 이벤트 데이터
 */
export interface SSENotificationEvent {
  /** 이벤트 타입 */
  type: SSEEventType;
  /** 알림 데이터 (new-notification 이벤트 시) */
  data: NotificationItem | null;
}
