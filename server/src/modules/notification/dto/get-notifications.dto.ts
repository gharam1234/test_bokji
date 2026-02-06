/**
 * 알림 목록 조회 DTO
 */

import { NotificationType } from '../constants/notification.constants';
import { NotificationMetadata } from '../entities/notification.entity';

/**
 * 알림 목록 요청 DTO
 */
export interface GetNotificationsDto {
  /** 알림 유형 필터 */
  type?: NotificationType;
  /** 읽음 상태 필터 */
  isRead?: boolean;
  /** 페이지 번호 (기본: 1) */
  page?: number;
  /** 페이지당 개수 (기본: 20, 최대: 50) */
  limit?: number;
}

/**
 * 알림 아이템 응답 DTO
 */
export interface NotificationItemDto {
  /** 알림 ID */
  id: string;
  /** 알림 유형 */
  type: NotificationType;
  /** 알림 제목 */
  title: string;
  /** 알림 본문 */
  message: string;
  /** 클릭 시 이동 URL */
  linkUrl?: string;
  /** 읽음 여부 */
  isRead: boolean;
  /** 생성 시각 */
  createdAt: Date;
  /** 추가 메타데이터 */
  metadata?: NotificationMetadata;
}

/**
 * 알림 목록 응답 DTO
 */
export interface GetNotificationsResponseDto {
  /** 알림 목록 */
  notifications: NotificationItemDto[];
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
 * 읽지 않은 알림 개수 응답 DTO
 */
export interface UnreadCountResponseDto {
  /** 읽지 않은 개수 */
  count: number;
}
