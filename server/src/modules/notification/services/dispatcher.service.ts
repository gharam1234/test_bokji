/**
 * 알림 발송 디스패처 서비스
 * 알림을 각 채널로 분기하여 발송하는 역할
 */

import { Injectable, Logger } from '@nestjs/common';
import {
  INotificationDispatcher,
  IInAppNotificationAdapter,
  IPushNotificationAdapter,
  IEmailNotificationAdapter,
} from '../interfaces/dispatcher.interface';
import { Notification } from '../entities/notification.entity';
import { NotificationChannel, NotificationStatus } from '../constants/notification.constants';
import { NotificationRepository } from '../notification.repository';
import { SSEManager } from '../managers/sse.manager';

@Injectable()
export class DispatcherService implements INotificationDispatcher {
  private readonly logger = new Logger(DispatcherService.name);

  // 채널별 어댑터 (의존성 주입)
  private inAppAdapter?: IInAppNotificationAdapter;
  private pushAdapter?: IPushNotificationAdapter;
  private emailAdapter?: IEmailNotificationAdapter;

  constructor(
    private readonly repository: NotificationRepository,
    private readonly sseManager: SSEManager,
  ) {}

  /**
   * 어댑터 등록 (선택적 의존성 주입)
   */
  registerInAppAdapter(adapter: IInAppNotificationAdapter): void {
    this.inAppAdapter = adapter;
  }

  registerPushAdapter(adapter: IPushNotificationAdapter): void {
    this.pushAdapter = adapter;
  }

  registerEmailAdapter(adapter: IEmailNotificationAdapter): void {
    this.emailAdapter = adapter;
  }

  /**
   * 알림을 지정된 채널들로 발송
   */
  async dispatch(notification: Notification, channels: NotificationChannel[]): Promise<void> {
    this.logger.debug(
      `Dispatching notification ${notification.id} to channels: ${channels.join(', ')}`,
    );

    const results = await Promise.allSettled(
      channels.map((channel) => this.dispatchToChannel(notification, channel)),
    );

    // 결과 로깅
    results.forEach((result, index) => {
      const channel = channels[index];
      if (result.status === 'fulfilled') {
        this.logger.debug(`Notification ${notification.id} sent via ${channel}: ${result.value}`);
      } else {
        this.logger.error(
          `Notification ${notification.id} failed via ${channel}: ${result.reason}`,
        );
      }
    });
  }

  /**
   * 단일 채널로 알림 발송
   */
  async dispatchToChannel(
    notification: Notification,
    channel: NotificationChannel,
  ): Promise<boolean> {
    try {
      let success = false;

      switch (channel) {
        case NotificationChannel.IN_APP:
          success = await this.sendInApp(notification);
          break;
        case NotificationChannel.PUSH:
          success = await this.sendPush(notification);
          break;
        case NotificationChannel.EMAIL:
          success = await this.sendEmail(notification);
          break;
        default:
          this.logger.warn(`Unknown notification channel: ${channel}`);
          return false;
      }

      // 발송 로그 기록
      await this.logDispatch(notification.id, channel, success);

      return success;
    } catch (error) {
      this.logger.error(
        `Error dispatching notification ${notification.id} via ${channel}:`,
        error,
      );
      await this.logDispatch(notification.id, channel, false, error.message);
      return false;
    }
  }

  /**
   * 인앱 알림 발송 (SSE)
   */
  private async sendInApp(notification: Notification): Promise<boolean> {
    try {
      // 커스텀 어댑터가 등록되어 있으면 사용
      if (this.inAppAdapter) {
        await this.inAppAdapter.send(notification);
        return true;
      }

      // 기본 SSE 발송
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

      this.logger.debug(`In-app notification sent to user ${notification.userId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send in-app notification:`, error);
      return false;
    }
  }

  /**
   * 푸시 알림 발송 (FCM)
   */
  private async sendPush(notification: Notification): Promise<boolean> {
    if (!this.pushAdapter) {
      this.logger.debug('Push adapter not configured, skipping push notification');
      return false;
    }

    try {
      return await this.pushAdapter.send(notification.userId, notification);
    } catch (error) {
      this.logger.error(`Failed to send push notification:`, error);
      return false;
    }
  }

  /**
   * 이메일 알림 발송
   */
  private async sendEmail(notification: Notification): Promise<boolean> {
    if (!this.emailAdapter) {
      this.logger.debug('Email adapter not configured, skipping email notification');
      return false;
    }

    try {
      return await this.emailAdapter.send(notification.userId, notification);
    } catch (error) {
      this.logger.error(`Failed to send email notification:`, error);
      return false;
    }
  }

  /**
   * 발송 로그 기록
   */
  private async logDispatch(
    notificationId: string,
    channel: NotificationChannel,
    success: boolean,
    errorMessage?: string,
  ): Promise<void> {
    try {
      await this.repository.createLog({
        notificationId,
        channel,
        status: success ? NotificationStatus.SENT : NotificationStatus.FAILED,
        errorMessage,
        sentAt: success ? new Date() : undefined,
      });
    } catch (error) {
      this.logger.error(`Failed to log notification dispatch:`, error);
    }
  }

  /**
   * 여러 사용자에게 브로드캐스트
   */
  async broadcastToUsers(
    userIds: string[],
    notification: Omit<Notification, 'id' | 'userId' | 'createdAt' | 'isRead'>,
    channels: NotificationChannel[],
  ): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>();

    for (const userId of userIds) {
      try {
        const fullNotification: Notification = {
          ...notification,
          id: '', // 브로드캐스트 시 개별 ID 없음
          userId,
          isRead: false,
          createdAt: new Date(),
        };

        await this.dispatch(fullNotification, channels);
        results.set(userId, true);
      } catch (error) {
        this.logger.error(`Failed to broadcast to user ${userId}:`, error);
        results.set(userId, false);
      }
    }

    return results;
  }
}
