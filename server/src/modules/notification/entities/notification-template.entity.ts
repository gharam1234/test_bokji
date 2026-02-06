/**
 * 알림 템플릿 엔티티
 * 알림 메시지 템플릿 정의
 */

import { NotificationType, NotificationChannel } from '../constants/notification.constants';

/**
 * 알림 템플릿 엔티티 인터페이스
 */
export interface NotificationTemplate {
  /** 템플릿 고유 ID */
  id: string;
  /** 알림 유형 */
  type: NotificationType;
  /** 알림 채널 */
  channel: NotificationChannel;
  /** 제목 템플릿 (Handlebars 형식 변수 포함) */
  titleTemplate: string;
  /** 본문 템플릿 (Handlebars 형식 변수 포함) */
  messageTemplate: string;
  /** 활성화 여부 */
  isActive: boolean;
  /** 생성 시각 */
  createdAt: Date;
  /** 수정 시각 */
  updatedAt: Date;
}

/**
 * DB 로우를 엔티티로 변환
 */
export function mapRowToNotificationTemplate(row: any): NotificationTemplate {
  return {
    id: row.id,
    type: row.type as NotificationType,
    channel: row.channel as NotificationChannel,
    titleTemplate: row.title_template,
    messageTemplate: row.message_template,
    isActive: row.is_active,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}
