/**
 * 알림 서비스
 * 알림 관련 비즈니스 로직 처리
 */

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { NotificationRepository } from './notification.repository';
import { SSEManager } from './managers/sse.manager';
import {
  Notification,
  CreateNotificationData,
  NotificationMetadata,
} from './entities/notification.entity';
import { NotificationSetting } from './entities/notification-setting.entity';
import {
  GetNotificationsDto,
  GetNotificationsResponseDto,
  NotificationItemDto,
} from './dto/get-notifications.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { SendNotificationDto, BulkSendNotificationDto } from './dto/send-notification.dto';
import {
  NotificationType,
  NotificationChannel,
  NotificationPriority,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
} from './constants/notification.constants';
import { INotificationService } from './interfaces/notification.interface';

@Injectable()
export class NotificationService implements INotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly repository: NotificationRepository,
    private readonly sseManager: SSEManager,
  ) {}

  // ==================== 알림 조회 ====================

  /**
   * 알림 목록 조회
   */
  async getNotifications(
    userId: string,
    options: GetNotificationsDto,
  ): Promise<GetNotificationsResponseDto> {
    const page = options.page || 1;
    const limit = Math.min(options.limit || DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);

    const { notifications, totalCount } = await this.repository.findByUserId(userId, options);
    const unreadCount = await this.repository.countUnread(userId);

    const notificationItems: NotificationItemDto[] = notifications.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      linkUrl: n.linkUrl,
      isRead: n.isRead,
      createdAt: n.createdAt,
      metadata: n.metadata,
    }));

    return {
      notifications: notificationItems,
      totalCount,
      unreadCount,
      page,
      limit,
      hasMore: page * limit < totalCount,
    };
  }

  /**
   * 읽지 않은 알림 개수 조회
   */
  async getUnreadCount(userId: string): Promise<number> {
    return this.repository.countUnread(userId);
  }

  /**
   * 단일 알림 조회
   */
  async getNotificationById(
    notificationId: string,
    userId: string,
  ): Promise<Notification | null> {
    const notification = await this.repository.findById(notificationId);
    if (notification && notification.userId === userId) {
      return notification;
    }
    return null;
  }

  // ==================== 알림 상태 관리 ====================

  /**
   * 알림 읽음 처리
   */
  async markAsRead(userId: string, notificationIds: string[]): Promise<number> {
    if (notificationIds.length === 0) {
      return this.markAllAsRead(userId);
    }
    return this.repository.markAsRead(userId, notificationIds);
  }

  /**
   * 모든 알림 읽음 처리
   */
  async markAllAsRead(userId: string): Promise<number> {
    return this.repository.markAllAsRead(userId);
  }

  /**
   * 알림 삭제
   */
  async deleteNotifications(userId: string, notificationIds: string[]): Promise<number> {
    if (notificationIds.length === 0) {
      return this.deleteAllNotifications(userId);
    }
    return this.repository.deleteNotifications(userId, notificationIds);
  }

  /**
   * 모든 알림 삭제
   */
  async deleteAllNotifications(userId: string): Promise<number> {
    return this.repository.deleteAllNotifications(userId);
  }

  // ==================== 알림 발송 ====================

  /**
   * 단일 알림 발송
   */
  async sendNotification(request: SendNotificationDto): Promise<Notification> {
    const { userId, type, title, message, linkUrl, metadata, priority, channels, scheduledAt } =
      request;

    // 예약 발송인 경우
    if (scheduledAt && scheduledAt > new Date()) {
      await this.scheduleNotification(request);
      // 예약된 경우 임시 알림 객체 반환
      return {
        id: '',
        userId,
        type,
        title,
        message,
        linkUrl,
        metadata,
        isRead: false,
        createdAt: new Date(),
      };
    }

    // 사용자 알림 설정 확인
    const settings = await this.getOrCreateSettings(userId);

    // 알림 유형별 수신 동의 확인
    if (!this.isNotificationTypeEnabled(type, settings)) {
      this.logger.debug(`User ${userId} has disabled ${type} notifications`);
      return {
        id: '',
        userId,
        type,
        title,
        message,
        isRead: false,
        createdAt: new Date(),
      };
    }

    // 방해금지 시간 확인
    if (this.isQuietHours(settings) && priority !== NotificationPriority.URGENT) {
      this.logger.debug(`User ${userId} is in quiet hours, scheduling for later`);
      // 방해금지 시간 종료 후 발송 예약
      const scheduleTime = this.getQuietHoursEndTime(settings);
      await this.scheduleNotification({ ...request, scheduledAt: scheduleTime });
      return {
        id: '',
        userId,
        type,
        title,
        message,
        isRead: false,
        createdAt: new Date(),
      };
    }

    // 알림 생성
    const notificationData: CreateNotificationData = {
      userId,
      type,
      title,
      message,
      linkUrl,
      metadata,
    };
    const notification = await this.repository.createNotification(notificationData);

    // 채널별 발송
    const enabledChannels = channels || this.getEnabledChannels(settings);
    await this.dispatchToChannels(notification, enabledChannels, settings);

    return notification;
  }

  /**
   * 대량 알림 발송
   */
  async sendBulkNotification(request: BulkSendNotificationDto): Promise<number> {
    const { userIds, type, title, message, linkUrl, metadata, priority } = request;

    const notificationDataList: CreateNotificationData[] = [];

    for (const userId of userIds) {
      // 사용자별 설정 확인
      const settings = await this.getOrCreateSettings(userId);

      if (!this.isNotificationTypeEnabled(type, settings)) {
        continue;
      }

      if (this.isQuietHours(settings) && priority !== NotificationPriority.URGENT) {
        // 방해금지 시간인 경우 예약 발송
        const scheduleTime = this.getQuietHoursEndTime(settings);
        await this.repository.createScheduledNotification({
          userId,
          type,
          title,
          message,
          linkUrl,
          metadata,
          priority,
          scheduledAt: scheduleTime,
        });
        continue;
      }

      notificationDataList.push({
        userId,
        type,
        title,
        message,
        linkUrl,
        metadata,
      });
    }

    // 대량 생성
    const insertedCount = await this.repository.createBulkNotifications(notificationDataList);

    // SSE로 실시간 알림 전송
    for (const data of notificationDataList) {
      this.sseManager.sendToUser(data.userId, {
        event: 'new-notification',
        data: {
          id: '', // 대량 생성 시 개별 ID는 알 수 없음
          type: data.type,
          title: data.title,
          message: data.message,
          linkUrl: data.linkUrl,
          isRead: false,
          createdAt: new Date(),
          metadata: data.metadata,
        },
      });
    }

    return insertedCount;
  }

  /**
   * 알림 예약
   */
  async scheduleNotification(request: SendNotificationDto): Promise<string> {
    const scheduled = await this.repository.createScheduledNotification({
      userId: request.userId,
      type: request.type,
      title: request.title,
      message: request.message,
      linkUrl: request.linkUrl,
      metadata: request.metadata,
      priority: request.priority,
      scheduledAt: request.scheduledAt || new Date(),
    });
    return scheduled.id;
  }

  // ==================== 설정 관리 ====================

  /**
   * 알림 설정 조회
   */
  async getSettings(userId: string): Promise<NotificationSetting> {
    return this.getOrCreateSettings(userId);
  }

  /**
   * 알림 설정 업데이트
   */
  async updateSettings(
    userId: string,
    settings: UpdateSettingsDto,
  ): Promise<NotificationSetting> {
    // 시간 형식 검증
    if (settings.quietHoursStart && !this.isValidTimeFormat(settings.quietHoursStart)) {
      throw new Error('Invalid quiet hours start time format. Use HH:mm');
    }
    if (settings.quietHoursEnd && !this.isValidTimeFormat(settings.quietHoursEnd)) {
      throw new Error('Invalid quiet hours end time format. Use HH:mm');
    }

    return this.repository.upsertSetting(userId, settings);
  }

  /**
   * 기본 알림 설정 초기화
   */
  async initializeSettings(userId: string): Promise<NotificationSetting> {
    return this.repository.createDefaultSetting(userId);
  }

  // ==================== FCM 토큰 관리 ====================

  /**
   * FCM 토큰 등록
   */
  async registerFcmToken(
    userId: string,
    token: string,
    deviceType: string,
  ): Promise<void> {
    await this.repository.upsertFcmToken({
      userId,
      token,
      deviceType: deviceType as any,
    });
  }

  /**
   * FCM 토큰 삭제
   */
  async removeFcmToken(token: string): Promise<void> {
    await this.repository.deleteFcmToken(token);
  }

  // ==================== Private 헬퍼 메서드 ====================

  /**
   * 설정 조회 또는 생성
   */
  private async getOrCreateSettings(userId: string): Promise<NotificationSetting> {
    let settings = await this.repository.findSettingByUserId(userId);
    if (!settings) {
      settings = await this.repository.createDefaultSetting(userId);
    }
    return settings;
  }

  /**
   * 알림 유형별 활성화 여부 확인
   */
  private isNotificationTypeEnabled(
    type: NotificationType,
    settings: NotificationSetting,
  ): boolean {
    switch (type) {
      case NotificationType.NEW_WELFARE:
        return settings.newWelfareEnabled;
      case NotificationType.DEADLINE_ALERT:
        return settings.deadlineAlertEnabled;
      case NotificationType.PROFILE_MATCH:
      case NotificationType.RECOMMENDATION:
        return settings.recommendationEnabled;
      case NotificationType.SYSTEM:
        return true; // 시스템 알림은 항상 발송
      default:
        return true;
    }
  }

  /**
   * 방해금지 시간 여부 확인
   */
  private isQuietHours(settings: NotificationSetting): boolean {
    if (!settings.quietHoursEnabled || !settings.quietHoursStart || !settings.quietHoursEnd) {
      return false;
    }

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const start = settings.quietHoursStart;
    const end = settings.quietHoursEnd;

    // 시작 시간이 종료 시간보다 이전인 경우 (예: 22:00 ~ 08:00)
    if (start > end) {
      return currentTime >= start || currentTime < end;
    }

    // 시작 시간이 종료 시간보다 이후인 경우 (예: 08:00 ~ 22:00)
    return currentTime >= start && currentTime < end;
  }

  /**
   * 방해금지 시간 종료 시각 계산
   */
  private getQuietHoursEndTime(settings: NotificationSetting): Date {
    if (!settings.quietHoursEnd) {
      return new Date();
    }

    const [hours, minutes] = settings.quietHoursEnd.split(':').map(Number);
    const endTime = new Date();
    endTime.setHours(hours, minutes, 0, 0);

    // 종료 시간이 이미 지났으면 다음 날로 설정
    if (endTime <= new Date()) {
      endTime.setDate(endTime.getDate() + 1);
    }

    return endTime;
  }

  /**
   * 활성화된 채널 목록 조회
   */
  private getEnabledChannels(settings: NotificationSetting): NotificationChannel[] {
    const channels: NotificationChannel[] = [];

    if (settings.inAppEnabled) {
      channels.push(NotificationChannel.IN_APP);
    }
    if (settings.pushEnabled) {
      channels.push(NotificationChannel.PUSH);
    }
    if (settings.emailEnabled) {
      channels.push(NotificationChannel.EMAIL);
    }

    return channels;
  }

  /**
   * 채널별 알림 발송
   */
  private async dispatchToChannels(
    notification: Notification,
    channels: NotificationChannel[],
    settings: NotificationSetting,
  ): Promise<void> {
    for (const channel of channels) {
      try {
        switch (channel) {
          case NotificationChannel.IN_APP:
            await this.sendInAppNotification(notification);
            break;
          case NotificationChannel.PUSH:
            // 푸시 알림 발송 (FCM 연동 시 구현)
            this.logger.debug(`Push notification for ${notification.userId} - skipped (not implemented)`);
            break;
          case NotificationChannel.EMAIL:
            // 이메일 발송 (SendGrid 연동 시 구현)
            this.logger.debug(`Email notification for ${notification.userId} - skipped (not implemented)`);
            break;
        }
      } catch (error) {
        this.logger.error(`Failed to send notification via ${channel}:`, error);
      }
    }
  }

  /**
   * 인앱 알림 발송 (SSE)
   */
  private async sendInAppNotification(notification: Notification): Promise<void> {
    this.sseManager.sendToUser(notification.userId, {
      event: 'new-notification',
      data: {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        linkUrl: notification.linkUrl,
        isRead: false,
        createdAt: notification.createdAt,
        metadata: notification.metadata,
      },
    });
  }

  /**
   * 시간 형식 검증 (HH:mm)
   */
  private isValidTimeFormat(time: string): boolean {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  }
}
