/**
 * 알림 발송 DTO (내부용)
 */

import {
  NotificationType,
  NotificationChannel,
  NotificationPriority,
} from '../constants/notification.constants';
import { NotificationMetadata } from '../entities/notification.entity';

/**
 * 단일 알림 발송 요청 DTO
 */
export interface SendNotificationDto {
  /** 대상 사용자 ID */
  userId: string;
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
  priority?: NotificationPriority;
  /** 발송 채널 (지정하지 않으면 설정에 따름) */
  channels?: NotificationChannel[];
  /** 예약 발송 시간 */
  scheduledAt?: Date;
}

/**
 * 대량 알림 발송 요청 DTO
 */
export interface BulkSendNotificationDto {
  /** 대상 사용자 ID 배열 */
  userIds: string[];
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
  priority?: NotificationPriority;
}

/**
 * 알림 발송 응답 DTO
 */
export interface SendNotificationResponseDto {
  /** 성공 여부 */
  success: boolean;
  /** 생성된 알림 ID */
  notificationId?: string;
  /** 발송된 사용자 수 (대량 발송 시) */
  sentCount?: number;
}
