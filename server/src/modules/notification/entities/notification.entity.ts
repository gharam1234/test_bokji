/**
 * 알림 엔티티
 * 사용자에게 발송된 알림 정보
 */

import { NotificationType } from '../constants/notification.constants';

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
  deadline?: Date | string;
  /** 카테고리 */
  category?: string;
  /** 남은 일수 */
  daysLeft?: number;
  /** 추천 개수 */
  count?: number;
  /** 기타 추가 데이터 */
  [key: string]: any;
}

/**
 * 알림 엔티티 인터페이스
 */
export interface Notification {
  /** 알림 고유 ID */
  id: string;
  /** 사용자 ID */
  userId: string;
  /** 알림 유형 */
  type: NotificationType;
  /** 알림 제목 */
  title: string;
  /** 알림 본문 */
  message: string;
  /** 클릭 시 이동할 URL */
  linkUrl?: string;
  /** 추가 메타데이터 */
  metadata?: NotificationMetadata;
  /** 읽음 여부 */
  isRead: boolean;
  /** 읽은 시각 */
  readAt?: Date;
  /** 생성 시각 */
  createdAt: Date;
}

/**
 * 알림 생성 데이터
 */
export interface CreateNotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  linkUrl?: string;
  metadata?: NotificationMetadata;
}

/**
 * 알림 업데이트 데이터
 */
export interface UpdateNotificationData {
  isRead?: boolean;
  readAt?: Date;
}

/**
 * DB 로우를 엔티티로 변환
 */
export function mapRowToNotification(row: any): Notification {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type as NotificationType,
    title: row.title,
    message: row.message,
    linkUrl: row.link_url || undefined,
    metadata: row.metadata || undefined,
    isRead: row.is_read,
    readAt: row.read_at ? new Date(row.read_at) : undefined,
    createdAt: new Date(row.created_at),
  };
}
