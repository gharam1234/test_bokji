/**
 * 알림 서비스 인터페이스
 */

import { Notification } from '../entities/notification.entity';
import { NotificationSetting } from '../entities/notification-setting.entity';
import {
  GetNotificationsDto,
  GetNotificationsResponseDto,
} from '../dto/get-notifications.dto';
import { UpdateSettingsDto } from '../dto/update-settings.dto';
import { SendNotificationDto, BulkSendNotificationDto } from '../dto/send-notification.dto';

/**
 * 알림 서비스 인터페이스
 */
export interface INotificationService {
  // 알림 조회
  getNotifications(userId: string, options: GetNotificationsDto): Promise<GetNotificationsResponseDto>;
  getUnreadCount(userId: string): Promise<number>;
  getNotificationById(notificationId: string, userId: string): Promise<Notification | null>;

  // 알림 상태 관리
  markAsRead(userId: string, notificationIds: string[]): Promise<number>;
  markAllAsRead(userId: string): Promise<number>;
  deleteNotifications(userId: string, notificationIds: string[]): Promise<number>;
  deleteAllNotifications(userId: string): Promise<number>;

  // 알림 발송
  sendNotification(request: SendNotificationDto): Promise<Notification>;
  sendBulkNotification(request: BulkSendNotificationDto): Promise<number>;
  scheduleNotification(request: SendNotificationDto): Promise<string>;

  // 설정 관리
  getSettings(userId: string): Promise<NotificationSetting>;
  updateSettings(userId: string, settings: UpdateSettingsDto): Promise<NotificationSetting>;
  initializeSettings(userId: string): Promise<NotificationSetting>;
}
