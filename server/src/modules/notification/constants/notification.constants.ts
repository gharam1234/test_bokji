/**
 * 알림 상수 정의
 * 알림 시스템에서 사용되는 상수값들
 */

/**
 * 알림 유형
 */
export enum NotificationType {
  /** 새 복지 프로그램 등록 */
  NEW_WELFARE = 'new_welfare',
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
 * 알림 우선순위
 */
export enum NotificationPriority {
  /** 낮음 */
  LOW = 'low',
  /** 보통 */
  NORMAL = 'normal',
  /** 높음 (즉시 발송) */
  HIGH = 'high',
  /** 긴급 (모든 채널 발송) */
  URGENT = 'urgent',
}

/**
 * 알림 발송 상태
 */
export enum NotificationStatus {
  /** 발송 대기 */
  PENDING = 'pending',
  /** 발송 완료 */
  SENT = 'sent',
  /** 발송 실패 */
  FAILED = 'failed',
  /** 발송 취소 */
  CANCELLED = 'cancelled',
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
 * 예약 알림 상태
 */
export enum ScheduledNotificationStatus {
  /** 대기중 */
  PENDING = 'pending',
  /** 처리됨 */
  PROCESSED = 'processed',
  /** 취소됨 */
  CANCELLED = 'cancelled',
}

/**
 * 디바이스 유형
 */
export enum DeviceType {
  WEB = 'web',
  ANDROID = 'android',
  IOS = 'ios',
}

/**
 * 알림 유형 레이블
 */
export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  [NotificationType.NEW_WELFARE]: '새 복지 프로그램',
  [NotificationType.DEADLINE_ALERT]: '마감 임박',
  [NotificationType.PROFILE_MATCH]: '프로필 매칭',
  [NotificationType.RECOMMENDATION]: '맞춤 추천',
  [NotificationType.SYSTEM]: '시스템 공지',
};

/**
 * 알림 채널 레이블
 */
export const NOTIFICATION_CHANNEL_LABELS: Record<NotificationChannel, string> = {
  [NotificationChannel.IN_APP]: '인앱 알림',
  [NotificationChannel.PUSH]: '푸시 알림',
  [NotificationChannel.EMAIL]: '이메일 알림',
};

/**
 * 기본 페이지네이션 설정
 */
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 50;

/**
 * SSE 하트비트 간격 (밀리초)
 */
export const SSE_HEARTBEAT_INTERVAL = 30000;

/**
 * 알림 보관 기간 (일)
 */
export const NOTIFICATION_RETENTION_DAYS = 30;
