/**
 * 알림 정리 Job
 * 오래된 알림 삭제 및 정리 작업
 */

import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { NotificationRepository } from '../notification.repository';

/**
 * 정리 작업 결과
 */
export interface CleanupResult {
  deletedNotifications: number;
  deletedLogs: number;
  deletedScheduled: number;
  executedAt: Date;
}

@Injectable()
export class CleanupJob {
  private readonly logger = new Logger(CleanupJob.name);

  // 기본 보관 기간 (일)
  private readonly DEFAULT_RETENTION_DAYS = 30;

  // 읽은 알림 보관 기간 (일)
  private readonly READ_NOTIFICATION_RETENTION_DAYS = 14;

  // 발송 로그 보관 기간 (일)
  private readonly LOG_RETENTION_DAYS = 90;

  // 처리 완료된 예약 알림 보관 기간 (일)
  private readonly SCHEDULED_RETENTION_DAYS = 7;

  constructor(private readonly repository: NotificationRepository) {}

  /**
   * 매일 새벽 3시에 실행
   * Cron: 0 0 3 * * * (매일 03:00)
   */
  @Cron('0 0 3 * * *')
  async handleCleanup(): Promise<CleanupResult> {
    this.logger.log('Starting notification cleanup job...');

    const result: CleanupResult = {
      deletedNotifications: 0,
      deletedLogs: 0,
      deletedScheduled: 0,
      executedAt: new Date(),
    };

    try {
      // 1. 오래된 알림 삭제
      result.deletedNotifications = await this.cleanupOldNotifications();

      // 2. 오래된 발송 로그 삭제
      result.deletedLogs = await this.cleanupOldLogs();

      // 3. 처리 완료된 예약 알림 삭제
      result.deletedScheduled = await this.cleanupProcessedScheduled();

      this.logger.log(
        `Cleanup completed: ${result.deletedNotifications} notifications, ` +
          `${result.deletedLogs} logs, ${result.deletedScheduled} scheduled notifications deleted`,
      );

      return result;
    } catch (error) {
      this.logger.error(`Cleanup job failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 오래된 알림 삭제
   * - 읽은 알림: 14일 이상 지난 것
   * - 읽지 않은 알림: 30일 이상 지난 것
   */
  private async cleanupOldNotifications(): Promise<number> {
    // 오래된 읽은 알림 삭제
    const readCount = await this.repository.deleteOldNotifications(
      this.READ_NOTIFICATION_RETENTION_DAYS,
    );

    this.logger.debug(`Deleted ${readCount} old notifications`);
    return readCount;
  }

  /**
   * 오래된 발송 로그 삭제 (90일 이상)
   */
  private async cleanupOldLogs(): Promise<number> {
    const query = `
      DELETE FROM notification_log 
      WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '${this.LOG_RETENTION_DAYS} days'
    `;

    try {
      const result = await this.repository['pool'].query(query);
      const count = result.rowCount || 0;
      this.logger.debug(`Deleted ${count} old notification logs`);
      return count;
    } catch (error) {
      this.logger.error(`Failed to cleanup old logs: ${error.message}`);
      return 0;
    }
  }

  /**
   * 처리 완료된 예약 알림 삭제 (7일 이상)
   */
  private async cleanupProcessedScheduled(): Promise<number> {
    const query = `
      DELETE FROM scheduled_notification 
      WHERE 
        status IN ('processed', 'cancelled')
        AND processed_at < CURRENT_TIMESTAMP - INTERVAL '${this.SCHEDULED_RETENTION_DAYS} days'
    `;

    try {
      const result = await this.repository['pool'].query(query);
      const count = result.rowCount || 0;
      this.logger.debug(`Deleted ${count} processed scheduled notifications`);
      return count;
    } catch (error) {
      this.logger.error(`Failed to cleanup processed scheduled: ${error.message}`);
      return 0;
    }
  }

  /**
   * 수동 실행 (관리자용)
   * @param options 정리 옵션
   */
  async runManually(options?: {
    notificationDays?: number;
    logDays?: number;
    scheduledDays?: number;
  }): Promise<CleanupResult> {
    this.logger.log('Running manual cleanup job');
    return this.handleCleanup();
  }

  /**
   * 특정 사용자의 오래된 알림만 정리
   */
  async cleanupUserNotifications(
    userId: string,
    daysOld: number = this.DEFAULT_RETENTION_DAYS,
  ): Promise<number> {
    const query = `
      DELETE FROM notification 
      WHERE user_id = $1 
        AND created_at < CURRENT_TIMESTAMP - INTERVAL '${daysOld} days'
    `;

    try {
      const result = await this.repository['pool'].query(query, [userId]);
      const count = result.rowCount || 0;
      this.logger.debug(`Deleted ${count} old notifications for user ${userId}`);
      return count;
    } catch (error) {
      this.logger.error(`Failed to cleanup user notifications: ${error.message}`);
      return 0;
    }
  }

  /**
   * 정리 통계 조회
   */
  async getCleanupStats(): Promise<{
    totalNotifications: number;
    oldNotifications: number;
    oldLogs: number;
    processedScheduled: number;
  }> {
    const queries = {
      total: `SELECT COUNT(*) as count FROM notification`,
      oldNotifications: `
        SELECT COUNT(*) as count FROM notification 
        WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '${this.DEFAULT_RETENTION_DAYS} days'
      `,
      oldLogs: `
        SELECT COUNT(*) as count FROM notification_log 
        WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '${this.LOG_RETENTION_DAYS} days'
      `,
      processedScheduled: `
        SELECT COUNT(*) as count FROM scheduled_notification 
        WHERE status IN ('processed', 'cancelled')
          AND processed_at < CURRENT_TIMESTAMP - INTERVAL '${this.SCHEDULED_RETENTION_DAYS} days'
      `,
    };

    try {
      const [total, oldNotifications, oldLogs, processedScheduled] = await Promise.all([
        this.repository['pool'].query(queries.total),
        this.repository['pool'].query(queries.oldNotifications),
        this.repository['pool'].query(queries.oldLogs),
        this.repository['pool'].query(queries.processedScheduled),
      ]);

      return {
        totalNotifications: parseInt(total.rows[0].count, 10),
        oldNotifications: parseInt(oldNotifications.rows[0].count, 10),
        oldLogs: parseInt(oldLogs.rows[0].count, 10),
        processedScheduled: parseInt(processedScheduled.rows[0].count, 10),
      };
    } catch (error) {
      this.logger.error(`Failed to get cleanup stats: ${error.message}`);
      return {
        totalNotifications: 0,
        oldNotifications: 0,
        oldLogs: 0,
        processedScheduled: 0,
      };
    }
  }
}
