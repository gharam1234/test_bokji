/**
 * 알림 레포지토리
 * 알림 관련 데이터베이스 작업 처리
 */

import { Injectable, Logger } from '@nestjs/common';
import { Pool } from 'pg';
import {
  Notification,
  CreateNotificationData,
  mapRowToNotification,
} from './entities/notification.entity';
import {
  NotificationSetting,
  mapRowToNotificationSetting,
  DEFAULT_NOTIFICATION_SETTING,
} from './entities/notification-setting.entity';
import {
  NotificationTemplate,
  mapRowToNotificationTemplate,
} from './entities/notification-template.entity';
import {
  NotificationLog,
  CreateNotificationLogData,
  mapRowToNotificationLog,
} from './entities/notification-log.entity';
import {
  UserFcmToken,
  UpsertFcmTokenData,
  mapRowToUserFcmToken,
} from './entities/user-fcm-token.entity';
import {
  ScheduledNotification,
  CreateScheduledNotificationData,
  mapRowToScheduledNotification,
} from './entities/scheduled-notification.entity';
import { GetNotificationsDto } from './dto/get-notifications.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import {
  NotificationType,
  NotificationChannel,
  ScheduledNotificationStatus,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
} from './constants/notification.constants';

@Injectable()
export class NotificationRepository {
  private readonly logger = new Logger(NotificationRepository.name);

  constructor(private readonly pool: Pool) {}

  // ==================== 알림 CRUD ====================

  /**
   * 알림 생성
   */
  async createNotification(data: CreateNotificationData): Promise<Notification> {
    const query = `
      INSERT INTO notification (user_id, type, title, message, link_url, metadata)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [
      data.userId,
      data.type,
      data.title,
      data.message,
      data.linkUrl || null,
      data.metadata ? JSON.stringify(data.metadata) : null,
    ];

    const result = await this.pool.query(query, values);
    return mapRowToNotification(result.rows[0]);
  }

  /**
   * 대량 알림 생성
   */
  async createBulkNotifications(dataList: CreateNotificationData[]): Promise<number> {
    if (dataList.length === 0) return 0;

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      let insertedCount = 0;
      for (const data of dataList) {
        const query = `
          INSERT INTO notification (user_id, type, title, message, link_url, metadata)
          VALUES ($1, $2, $3, $4, $5, $6)
        `;
        const values = [
          data.userId,
          data.type,
          data.title,
          data.message,
          data.linkUrl || null,
          data.metadata ? JSON.stringify(data.metadata) : null,
        ];
        await client.query(query, values);
        insertedCount++;
      }

      await client.query('COMMIT');
      return insertedCount;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * 알림 ID로 조회
   */
  async findById(id: string): Promise<Notification | null> {
    const query = `SELECT * FROM notification WHERE id = $1`;
    const result = await this.pool.query(query, [id]);
    return result.rows[0] ? mapRowToNotification(result.rows[0]) : null;
  }

  /**
   * 사용자의 알림 목록 조회
   */
  async findByUserId(
    userId: string,
    options: GetNotificationsDto,
  ): Promise<{ notifications: Notification[]; totalCount: number }> {
    const page = options.page || 1;
    const limit = Math.min(options.limit || DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
    const offset = (page - 1) * limit;

    // WHERE 조건 구성
    const conditions: string[] = ['user_id = $1'];
    const values: any[] = [userId];
    let paramIndex = 2;

    if (options.type) {
      conditions.push(`type = $${paramIndex++}`);
      values.push(options.type);
    }

    if (options.isRead !== undefined) {
      conditions.push(`is_read = $${paramIndex++}`);
      values.push(options.isRead);
    }

    const whereClause = conditions.join(' AND ');

    // 총 개수 조회
    const countQuery = `SELECT COUNT(*) as count FROM notification WHERE ${whereClause}`;
    const countResult = await this.pool.query(countQuery, values);
    const totalCount = parseInt(countResult.rows[0].count, 10);

    // 알림 목록 조회
    const listQuery = `
      SELECT * FROM notification 
      WHERE ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex}
    `;
    values.push(limit, offset);

    const listResult = await this.pool.query(listQuery, values);
    const notifications = listResult.rows.map(mapRowToNotification);

    return { notifications, totalCount };
  }

  /**
   * 읽지 않은 알림 개수 조회
   */
  async countUnread(userId: string): Promise<number> {
    const query = `
      SELECT COUNT(*) as count FROM notification 
      WHERE user_id = $1 AND is_read = FALSE
    `;
    const result = await this.pool.query(query, [userId]);
    return parseInt(result.rows[0].count, 10);
  }

  /**
   * 알림 읽음 처리
   */
  async markAsRead(userId: string, notificationIds: string[]): Promise<number> {
    const query = `
      UPDATE notification 
      SET is_read = TRUE, read_at = CURRENT_TIMESTAMP
      WHERE user_id = $1 AND id = ANY($2) AND is_read = FALSE
    `;
    const result = await this.pool.query(query, [userId, notificationIds]);
    return result.rowCount || 0;
  }

  /**
   * 모든 알림 읽음 처리
   */
  async markAllAsRead(userId: string): Promise<number> {
    const query = `
      UPDATE notification 
      SET is_read = TRUE, read_at = CURRENT_TIMESTAMP
      WHERE user_id = $1 AND is_read = FALSE
    `;
    const result = await this.pool.query(query, [userId]);
    return result.rowCount || 0;
  }

  /**
   * 알림 삭제
   */
  async deleteNotifications(userId: string, notificationIds: string[]): Promise<number> {
    const query = `DELETE FROM notification WHERE user_id = $1 AND id = ANY($2)`;
    const result = await this.pool.query(query, [userId, notificationIds]);
    return result.rowCount || 0;
  }

  /**
   * 모든 알림 삭제
   */
  async deleteAllNotifications(userId: string): Promise<number> {
    const query = `DELETE FROM notification WHERE user_id = $1`;
    const result = await this.pool.query(query, [userId]);
    return result.rowCount || 0;
  }

  /**
   * 오래된 알림 삭제 (정리 작업용)
   */
  async deleteOldNotifications(daysOld: number): Promise<number> {
    const query = `
      DELETE FROM notification 
      WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '${daysOld} days'
    `;
    const result = await this.pool.query(query);
    return result.rowCount || 0;
  }

  // ==================== 알림 설정 ====================

  /**
   * 알림 설정 조회
   */
  async findSettingByUserId(userId: string): Promise<NotificationSetting | null> {
    const query = `SELECT * FROM notification_setting WHERE user_id = $1`;
    const result = await this.pool.query(query, [userId]);
    return result.rows[0] ? mapRowToNotificationSetting(result.rows[0]) : null;
  }

  /**
   * 알림 설정 생성 또는 업데이트
   */
  async upsertSetting(userId: string, data: UpdateSettingsDto): Promise<NotificationSetting> {
    const existing = await this.findSettingByUserId(userId);

    if (existing) {
      // 업데이트
      const fields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (data.inAppEnabled !== undefined) {
        fields.push(`in_app_enabled = $${paramIndex++}`);
        values.push(data.inAppEnabled);
      }
      if (data.pushEnabled !== undefined) {
        fields.push(`push_enabled = $${paramIndex++}`);
        values.push(data.pushEnabled);
      }
      if (data.emailEnabled !== undefined) {
        fields.push(`email_enabled = $${paramIndex++}`);
        values.push(data.emailEnabled);
      }
      if (data.newWelfareEnabled !== undefined) {
        fields.push(`new_welfare_enabled = $${paramIndex++}`);
        values.push(data.newWelfareEnabled);
      }
      if (data.deadlineAlertEnabled !== undefined) {
        fields.push(`deadline_alert_enabled = $${paramIndex++}`);
        values.push(data.deadlineAlertEnabled);
      }
      if (data.recommendationEnabled !== undefined) {
        fields.push(`recommendation_enabled = $${paramIndex++}`);
        values.push(data.recommendationEnabled);
      }
      if (data.quietHoursEnabled !== undefined) {
        fields.push(`quiet_hours_enabled = $${paramIndex++}`);
        values.push(data.quietHoursEnabled);
      }
      if (data.quietHoursStart !== undefined) {
        fields.push(`quiet_hours_start = $${paramIndex++}`);
        values.push(data.quietHoursStart);
      }
      if (data.quietHoursEnd !== undefined) {
        fields.push(`quiet_hours_end = $${paramIndex++}`);
        values.push(data.quietHoursEnd);
      }
      if (data.emailDigestFrequency !== undefined) {
        fields.push(`email_digest_frequency = $${paramIndex++}`);
        values.push(data.emailDigestFrequency);
      }

      fields.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(userId);

      const query = `
        UPDATE notification_setting 
        SET ${fields.join(', ')}
        WHERE user_id = $${paramIndex}
        RETURNING *
      `;

      const result = await this.pool.query(query, values);
      return mapRowToNotificationSetting(result.rows[0]);
    } else {
      // 생성
      const setting = { ...DEFAULT_NOTIFICATION_SETTING, ...data };
      const query = `
        INSERT INTO notification_setting (
          user_id, in_app_enabled, push_enabled, email_enabled,
          new_welfare_enabled, deadline_alert_enabled, recommendation_enabled,
          quiet_hours_enabled, quiet_hours_start, quiet_hours_end,
          email_digest_frequency
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `;
      const values = [
        userId,
        setting.inAppEnabled,
        setting.pushEnabled,
        setting.emailEnabled,
        setting.newWelfareEnabled,
        setting.deadlineAlertEnabled,
        setting.recommendationEnabled,
        setting.quietHoursEnabled,
        setting.quietHoursStart || null,
        setting.quietHoursEnd || null,
        setting.emailDigestFrequency,
      ];

      const result = await this.pool.query(query, values);
      return mapRowToNotificationSetting(result.rows[0]);
    }
  }

  /**
   * 기본 알림 설정 생성
   */
  async createDefaultSetting(userId: string): Promise<NotificationSetting> {
    return this.upsertSetting(userId, {});
  }

  // ==================== 알림 템플릿 ====================

  /**
   * 템플릿 조회
   */
  async findTemplate(
    type: NotificationType,
    channel: NotificationChannel,
  ): Promise<NotificationTemplate | null> {
    const query = `
      SELECT * FROM notification_template 
      WHERE type = $1 AND channel = $2 AND is_active = TRUE
    `;
    const result = await this.pool.query(query, [type, channel]);
    return result.rows[0] ? mapRowToNotificationTemplate(result.rows[0]) : null;
  }

  /**
   * 유형별 모든 활성 템플릿 조회
   */
  async findTemplatesByType(type: NotificationType): Promise<NotificationTemplate[]> {
    const query = `
      SELECT * FROM notification_template 
      WHERE type = $1 AND is_active = TRUE
    `;
    const result = await this.pool.query(query, [type]);
    return result.rows.map(mapRowToNotificationTemplate);
  }

  // ==================== 발송 로그 ====================

  /**
   * 발송 로그 생성
   */
  async createLog(data: CreateNotificationLogData): Promise<NotificationLog> {
    const query = `
      INSERT INTO notification_log (notification_id, channel, status, error_message, sent_at)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [
      data.notificationId,
      data.channel,
      data.status,
      data.errorMessage || null,
      data.sentAt || null,
    ];

    const result = await this.pool.query(query, values);
    return mapRowToNotificationLog(result.rows[0]);
  }

  // ==================== FCM 토큰 ====================

  /**
   * FCM 토큰 저장/업데이트
   */
  async upsertFcmToken(data: UpsertFcmTokenData): Promise<UserFcmToken> {
    const query = `
      INSERT INTO user_fcm_token (user_id, token, device_type)
      VALUES ($1, $2, $3)
      ON CONFLICT (token) 
      DO UPDATE SET 
        user_id = $1,
        device_type = $3,
        is_active = TRUE,
        last_used_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    const values = [data.userId, data.token, data.deviceType];
    const result = await this.pool.query(query, values);
    return mapRowToUserFcmToken(result.rows[0]);
  }

  /**
   * 사용자의 활성 FCM 토큰 조회
   */
  async findActiveFcmTokens(userId: string): Promise<UserFcmToken[]> {
    const query = `
      SELECT * FROM user_fcm_token 
      WHERE user_id = $1 AND is_active = TRUE
      ORDER BY last_used_at DESC
    `;
    const result = await this.pool.query(query, [userId]);
    return result.rows.map(mapRowToUserFcmToken);
  }

  /**
   * FCM 토큰 비활성화
   */
  async deactivateFcmToken(token: string): Promise<void> {
    const query = `UPDATE user_fcm_token SET is_active = FALSE WHERE token = $1`;
    await this.pool.query(query, [token]);
  }

  /**
   * FCM 토큰 삭제
   */
  async deleteFcmToken(token: string): Promise<void> {
    const query = `DELETE FROM user_fcm_token WHERE token = $1`;
    await this.pool.query(query, [token]);
  }

  // ==================== 예약 알림 ====================

  /**
   * 예약 알림 생성
   */
  async createScheduledNotification(
    data: CreateScheduledNotificationData,
  ): Promise<ScheduledNotification> {
    const query = `
      INSERT INTO scheduled_notification (
        user_id, user_ids, type, title, message, link_url, metadata, priority, scheduled_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const values = [
      data.userId || null,
      data.userIds || null,
      data.type,
      data.title,
      data.message,
      data.linkUrl || null,
      data.metadata ? JSON.stringify(data.metadata) : null,
      data.priority || 'normal',
      data.scheduledAt,
    ];

    const result = await this.pool.query(query, values);
    return mapRowToScheduledNotification(result.rows[0]);
  }

  /**
   * 처리 대기중인 예약 알림 조회
   */
  async findPendingScheduledNotifications(): Promise<ScheduledNotification[]> {
    const query = `
      SELECT * FROM scheduled_notification 
      WHERE status = 'pending' AND scheduled_at <= CURRENT_TIMESTAMP
      ORDER BY scheduled_at ASC
      LIMIT 100
    `;
    const result = await this.pool.query(query);
    return result.rows.map(mapRowToScheduledNotification);
  }

  /**
   * 예약 알림 상태 업데이트
   */
  async updateScheduledNotificationStatus(
    id: string,
    status: ScheduledNotificationStatus,
  ): Promise<void> {
    const query = `
      UPDATE scheduled_notification 
      SET status = $1, processed_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `;
    await this.pool.query(query, [status, id]);
  }
}
