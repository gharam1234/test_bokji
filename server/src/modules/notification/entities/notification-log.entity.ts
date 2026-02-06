/**
 * 알림 발송 로그 엔티티
 * 알림 발송 결과 기록
 */

import { NotificationChannel, NotificationStatus } from '../constants/notification.constants';

/**
 * 발송 로그 엔티티 인터페이스
 */
export interface NotificationLog {
  /** 로그 고유 ID */
  id: string;
  /** 알림 ID */
  notificationId: string;
  /** 발송 채널 */
  channel: NotificationChannel;
  /** 발송 상태 */
  status: NotificationStatus;
  /** 오류 메시지 (실패 시) */
  errorMessage?: string;
  /** 발송 완료 시각 */
  sentAt?: Date;
  /** 생성 시각 */
  createdAt: Date;
}

/**
 * 발송 로그 생성 데이터
 */
export interface CreateNotificationLogData {
  notificationId: string;
  channel: NotificationChannel;
  status: NotificationStatus;
  errorMessage?: string;
  sentAt?: Date;
}

/**
 * DB 로우를 엔티티로 변환
 */
export function mapRowToNotificationLog(row: any): NotificationLog {
  return {
    id: row.id,
    notificationId: row.notification_id,
    channel: row.channel as NotificationChannel,
    status: row.status as NotificationStatus,
    errorMessage: row.error_message || undefined,
    sentAt: row.sent_at ? new Date(row.sent_at) : undefined,
    createdAt: new Date(row.created_at),
  };
}
