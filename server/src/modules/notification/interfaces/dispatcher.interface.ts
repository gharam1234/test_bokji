/**
 * 알림 디스패처 인터페이스
 */

import { Notification } from '../entities/notification.entity';
import { NotificationChannel } from '../constants/notification.constants';
import { NotificationItemDto } from '../dto/get-notifications.dto';

/**
 * 알림 발송 디스패처 인터페이스
 */
export interface INotificationDispatcher {
  /**
   * 알림을 지정된 채널들로 발송
   */
  dispatch(notification: Notification, channels: NotificationChannel[]): Promise<void>;

  /**
   * 단일 채널로 알림 발송
   */
  dispatchToChannel(notification: Notification, channel: NotificationChannel): Promise<boolean>;
}

/**
 * 인앱 알림 어댑터 인터페이스
 */
export interface IInAppNotificationAdapter {
  /**
   * 단일 사용자에게 알림 전송
   */
  send(notification: Notification): Promise<void>;

  /**
   * 여러 사용자에게 알림 전송
   */
  broadcast(userIds: string[], notification: Notification): Promise<void>;
}

/**
 * 푸시 알림 어댑터 인터페이스
 */
export interface IPushNotificationAdapter {
  /**
   * 단일 사용자에게 푸시 알림 발송
   */
  send(userId: string, notification: Notification): Promise<boolean>;

  /**
   * 여러 사용자에게 푸시 알림 발송
   */
  sendBulk(userIds: string[], notification: Notification): Promise<Map<string, boolean>>;

  /**
   * FCM 토큰 등록
   */
  registerToken(userId: string, token: string, deviceType: string): Promise<void>;

  /**
   * FCM 토큰 삭제
   */
  removeToken(token: string): Promise<void>;
}

/**
 * 이메일 알림 어댑터 인터페이스
 */
export interface IEmailNotificationAdapter {
  /**
   * 단일 사용자에게 이메일 발송
   */
  send(userId: string, notification: Notification): Promise<boolean>;

  /**
   * 여러 사용자에게 이메일 발송
   */
  sendBulk(userIds: string[], notification: Notification): Promise<Map<string, boolean>>;

  /**
   * 이메일 요약 발송
   */
  sendDigest(userId: string, notifications: Notification[]): Promise<boolean>;
}

/**
 * SSE 관리자 인터페이스
 */
export interface ISSEManager {
  /**
   * SSE 연결 추가
   */
  addConnection(userId: string, response: any): void;

  /**
   * SSE 연결 제거
   */
  removeConnection(userId: string, response: any): void;

  /**
   * 특정 사용자에게 이벤트 전송
   */
  sendToUser(userId: string, event: SSENotificationEvent): void;

  /**
   * 모든 연결에 이벤트 전송
   */
  broadcast(event: SSENotificationEvent): void;

  /**
   * 활성 연결 수 조회
   */
  getActiveConnections(): number;
}

/**
 * SSE 알림 이벤트
 */
export interface SSENotificationEvent {
  /** 이벤트 타입 */
  event: 'new-notification' | 'heartbeat';
  /** 이벤트 데이터 */
  data: NotificationItemDto | null;
}
