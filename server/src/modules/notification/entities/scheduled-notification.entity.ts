/**
 * 예약 알림 엔티티
 * 예약 발송 알림 정보
 */

import {
  NotificationType,
  NotificationPriority,
  ScheduledNotificationStatus,
} from '../constants/notification.constants';
import { NotificationMetadata } from './notification.entity';

/**
 * 예약 알림 엔티티 인터페이스
 */
export interface ScheduledNotification {
  /** 예약 알림 고유 ID */
  id: string;
  /** 단일 대상 사용자 ID */
  userId?: string;
  /** 대량 발송 대상 사용자 ID 배열 */
  userIds?: string[];
  /** 알림 유형 */
  type: NotificationType;
  /** 알림 제목 */
  title: string;
  /** 알림 본문 */
  message: string;
  /** 클릭 시 이동 URL */
  linkUrl?: string;
  /** 추가 메타데이터 */
  metadata?: NotificationMetadata;
  /** 우선순위 */
  priority: NotificationPriority;
  /** 발송 예약 시각 */
  scheduledAt: Date;
  /** 처리 상태 */
  status: ScheduledNotificationStatus;
  /** 처리 완료 시각 */
  processedAt?: Date;
  /** 생성 시각 */
  createdAt: Date;
}

/**
 * 예약 알림 생성 데이터
 */
export interface CreateScheduledNotificationData {
  userId?: string;
  userIds?: string[];
  type: NotificationType;
  title: string;
  message: string;
  linkUrl?: string;
  metadata?: NotificationMetadata;
  priority?: NotificationPriority;
  scheduledAt: Date;
}

/**
 * DB 로우를 엔티티로 변환
 */
export function mapRowToScheduledNotification(row: any): ScheduledNotification {
  return {
    id: row.id,
    userId: row.user_id || undefined,
    userIds: row.user_ids || undefined,
    type: row.type as NotificationType,
    title: row.title,
    message: row.message,
    linkUrl: row.link_url || undefined,
    metadata: row.metadata || undefined,
    priority: row.priority as NotificationPriority,
    scheduledAt: new Date(row.scheduled_at),
    status: row.status as ScheduledNotificationStatus,
    processedAt: row.processed_at ? new Date(row.processed_at) : undefined,
    createdAt: new Date(row.created_at),
  };
}
