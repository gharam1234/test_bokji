/**
 * 알림 설정 엔티티
 * 사용자별 알림 수신 설정
 */

import { EmailDigestFrequency } from '../constants/notification.constants';

/**
 * 알림 설정 엔티티 인터페이스
 */
export interface NotificationSetting {
  /** 설정 고유 ID */
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
  /** 방해금지 시작 시간 (HH:mm 형식) */
  quietHoursStart?: string;
  /** 방해금지 종료 시간 (HH:mm 형식) */
  quietHoursEnd?: string;

  /** 이메일 수신 빈도 */
  emailDigestFrequency: EmailDigestFrequency;

  /** 생성 시각 */
  createdAt: Date;
  /** 수정 시각 */
  updatedAt: Date;
}

/**
 * 알림 설정 생성/업데이트 데이터
 */
export interface UpsertNotificationSettingData {
  userId: string;
  inAppEnabled?: boolean;
  pushEnabled?: boolean;
  emailEnabled?: boolean;
  newWelfareEnabled?: boolean;
  deadlineAlertEnabled?: boolean;
  recommendationEnabled?: boolean;
  quietHoursEnabled?: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  emailDigestFrequency?: EmailDigestFrequency;
}

/**
 * 기본 알림 설정값
 */
export const DEFAULT_NOTIFICATION_SETTING: Omit<NotificationSetting, 'id' | 'userId' | 'createdAt' | 'updatedAt'> = {
  inAppEnabled: true,
  pushEnabled: true,
  emailEnabled: true,
  newWelfareEnabled: true,
  deadlineAlertEnabled: true,
  recommendationEnabled: true,
  quietHoursEnabled: false,
  quietHoursStart: undefined,
  quietHoursEnd: undefined,
  emailDigestFrequency: EmailDigestFrequency.DAILY,
};

/**
 * DB 로우를 엔티티로 변환
 */
export function mapRowToNotificationSetting(row: any): NotificationSetting {
  return {
    id: row.id,
    userId: row.user_id,
    inAppEnabled: row.in_app_enabled,
    pushEnabled: row.push_enabled,
    emailEnabled: row.email_enabled,
    newWelfareEnabled: row.new_welfare_enabled,
    deadlineAlertEnabled: row.deadline_alert_enabled,
    recommendationEnabled: row.recommendation_enabled,
    quietHoursEnabled: row.quiet_hours_enabled,
    quietHoursStart: row.quiet_hours_start || undefined,
    quietHoursEnd: row.quiet_hours_end || undefined,
    emailDigestFrequency: row.email_digest_frequency as EmailDigestFrequency,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}
