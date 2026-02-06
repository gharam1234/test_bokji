/**
 * 푸시 알림 어댑터 (FCM)
 * Firebase Cloud Messaging을 통한 푸시 알림 발송
 */

import { Injectable, Logger } from '@nestjs/common';
import { IPushNotificationAdapter } from '../interfaces/dispatcher.interface';
import { Notification } from '../entities/notification.entity';
import { NotificationRepository } from '../notification.repository';

/**
 * FCM 메시지 페이로드
 */
interface FcmMessage {
  notification: {
    title: string;
    body: string;
  };
  data?: Record<string, string>;
  token?: string;
  tokens?: string[];
}

/**
 * FCM 발송 결과
 */
interface FcmSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

@Injectable()
export class PushAdapter implements IPushNotificationAdapter {
  private readonly logger = new Logger(PushAdapter.name);

  // Firebase Admin SDK (실제 연동 시 주입)
  private firebaseAdmin: any = null;
  private isInitialized = false;

  constructor(private readonly repository: NotificationRepository) {}

  /**
   * Firebase Admin SDK 초기화
   * 실제 사용 시 Firebase 서비스 계정 키 필요
   */
  async initialize(serviceAccountPath?: string): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Firebase Admin SDK 동적 로드
      // const admin = require('firebase-admin');
      
      // 환경 변수 또는 서비스 계정 키로 초기화
      // if (serviceAccountPath) {
      //   const serviceAccount = require(serviceAccountPath);
      //   admin.initializeApp({
      //     credential: admin.credential.cert(serviceAccount),
      //   });
      // } else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      //   const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      //   admin.initializeApp({
      //     credential: admin.credential.cert(serviceAccount),
      //   });
      // }
      
      // this.firebaseAdmin = admin;
      // this.isInitialized = true;
      
      this.logger.log('Push adapter initialized (FCM stub mode)');
    } catch (error) {
      this.logger.error(`Failed to initialize Firebase Admin: ${error.message}`);
    }
  }

  /**
   * 단일 사용자에게 푸시 알림 발송
   */
  async send(userId: string, notification: Notification): Promise<boolean> {
    if (!this.isFirebaseConfigured()) {
      this.logger.debug('Firebase not configured, skipping push notification');
      return false;
    }

    try {
      // 사용자의 FCM 토큰 조회
      const tokens = await this.repository.findActiveFcmTokens(userId);

      if (tokens.length === 0) {
        this.logger.debug(`No FCM tokens found for user ${userId}`);
        return false;
      }

      // 각 토큰으로 발송
      const results = await Promise.all(
        tokens.map((token) => this.sendToToken(token.token, notification)),
      );

      const successCount = results.filter((r) => r).length;
      this.logger.debug(
        `Push notification sent to user ${userId}: ${successCount}/${tokens.length} successful`,
      );

      return successCount > 0;
    } catch (error) {
      this.logger.error(`Failed to send push notification to user ${userId}: ${error.message}`);
      return false;
    }
  }

  /**
   * 여러 사용자에게 푸시 알림 발송
   */
  async sendBulk(
    userIds: string[],
    notification: Notification,
  ): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>();

    // 모든 사용자의 토큰 일괄 조회 후 발송
    for (const userId of userIds) {
      try {
        const success = await this.send(userId, {
          ...notification,
          userId,
        });
        results.set(userId, success);
      } catch (error) {
        this.logger.error(`Failed to send bulk push to user ${userId}: ${error.message}`);
        results.set(userId, false);
      }
    }

    return results;
  }

  /**
   * FCM 토큰 등록
   */
  async registerToken(
    userId: string,
    token: string,
    deviceType: string,
  ): Promise<void> {
    try {
      await this.repository.upsertFcmToken({
        userId,
        token,
        deviceType: deviceType as 'web' | 'android' | 'ios',
      });
      this.logger.debug(`FCM token registered for user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to register FCM token: ${error.message}`);
      throw error;
    }
  }

  /**
   * FCM 토큰 삭제
   */
  async removeToken(token: string): Promise<void> {
    try {
      await this.repository.deleteFcmToken(token);
      this.logger.debug(`FCM token removed: ${token.substring(0, 10)}...`);
    } catch (error) {
      this.logger.error(`Failed to remove FCM token: ${error.message}`);
      throw error;
    }
  }

  /**
   * FCM 토큰 비활성화
   */
  async deactivateToken(token: string): Promise<void> {
    try {
      await this.repository.deactivateFcmToken(token);
      this.logger.debug(`FCM token deactivated: ${token.substring(0, 10)}...`);
    } catch (error) {
      this.logger.error(`Failed to deactivate FCM token: ${error.message}`);
    }
  }

  // ==================== Private 메서드 ====================

  /**
   * Firebase 설정 여부 확인
   */
  private isFirebaseConfigured(): boolean {
    // 실제 구현 시: return this.isInitialized && this.firebaseAdmin !== null;
    return false; // 현재는 stub 모드
  }

  /**
   * 단일 토큰으로 메시지 발송
   */
  private async sendToToken(token: string, notification: Notification): Promise<boolean> {
    if (!this.firebaseAdmin) {
      return false;
    }

    const message: FcmMessage = {
      notification: {
        title: notification.title,
        body: notification.message,
      },
      data: {
        notificationId: notification.id,
        type: notification.type,
        linkUrl: notification.linkUrl || '',
      },
      token,
    };

    try {
      // const response = await this.firebaseAdmin.messaging().send(message);
      // this.logger.debug(`FCM message sent: ${response}`);
      return true;
    } catch (error: any) {
      this.logger.error(`FCM send error: ${error.message}`);

      // 유효하지 않은 토큰인 경우 비활성화
      if (this.isInvalidTokenError(error)) {
        await this.deactivateToken(token);
      }

      return false;
    }
  }

  /**
   * 유효하지 않은 토큰 에러인지 확인
   */
  private isInvalidTokenError(error: any): boolean {
    const invalidTokenCodes = [
      'messaging/invalid-registration-token',
      'messaging/registration-token-not-registered',
    ];
    return invalidTokenCodes.includes(error.code);
  }

  /**
   * FCM 메시지 빌드
   */
  private buildFcmMessage(notification: Notification, token: string): FcmMessage {
    return {
      notification: {
        title: notification.title,
        body: notification.message,
      },
      data: {
        notificationId: notification.id,
        type: notification.type,
        linkUrl: notification.linkUrl || '',
        metadata: notification.metadata ? JSON.stringify(notification.metadata) : '',
      },
      token,
    };
  }
}
