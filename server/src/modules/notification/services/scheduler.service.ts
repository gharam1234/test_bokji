/**
 * 알림 스케줄러 서비스
 * 예약 알림 처리 및 스케줄링 관리
 */

import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { NotificationRepository } from '../notification.repository';
import { NotificationService } from '../notification.service';
import { ScheduledNotification } from '../entities/scheduled-notification.entity';
import {
  NotificationType,
  ScheduledNotificationStatus,
} from '../constants/notification.constants';

/**
 * 스케줄러 인터페이스
 */
export interface INotificationScheduler {
  scheduleNewWelfareNotification(programId: string): Promise<void>;
  scheduleDeadlineAlerts(): Promise<void>;
  processScheduledNotifications(): Promise<number>;
}

@Injectable()
export class SchedulerService implements INotificationScheduler {
  private readonly logger = new Logger(SchedulerService.name);

  // 한 번에 처리할 최대 예약 알림 수
  private readonly BATCH_SIZE = 100;

  constructor(
    private readonly repository: NotificationRepository,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * 매 분마다 예약 알림 처리
   * Cron: 0 * * * * * (매 분 0초)
   */
  @Cron('0 * * * * *')
  async handleScheduledNotifications(): Promise<void> {
    this.logger.debug('Processing scheduled notifications...');

    try {
      const processedCount = await this.processScheduledNotifications();
      if (processedCount > 0) {
        this.logger.log(`Processed ${processedCount} scheduled notifications`);
      }
    } catch (error) {
      this.logger.error(`Failed to process scheduled notifications: ${error.message}`);
    }
  }

  /**
   * 대기중인 예약 알림 처리
   */
  async processScheduledNotifications(): Promise<number> {
    // 처리 대기중인 예약 알림 조회
    const pendingNotifications = await this.repository.findPendingScheduledNotifications();

    if (pendingNotifications.length === 0) {
      return 0;
    }

    this.logger.debug(`Found ${pendingNotifications.length} pending scheduled notifications`);

    let processedCount = 0;

    for (const scheduled of pendingNotifications) {
      try {
        await this.processScheduledNotification(scheduled);
        processedCount++;
      } catch (error) {
        this.logger.error(
          `Failed to process scheduled notification ${scheduled.id}: ${error.message}`,
        );
        // 실패해도 다음 알림 계속 처리
      }
    }

    return processedCount;
  }

  /**
   * 단일 예약 알림 처리
   */
  private async processScheduledNotification(
    scheduled: ScheduledNotification,
  ): Promise<void> {
    this.logger.debug(`Processing scheduled notification ${scheduled.id}`);

    try {
      // 단일 사용자 알림
      if (scheduled.userId) {
        await this.notificationService.sendNotification({
          userId: scheduled.userId,
          type: scheduled.type,
          title: scheduled.title,
          message: scheduled.message,
          linkUrl: scheduled.linkUrl,
          metadata: scheduled.metadata,
          priority: scheduled.priority,
        });
      }
      // 대량 발송 (여러 사용자)
      else if (scheduled.userIds && scheduled.userIds.length > 0) {
        await this.notificationService.sendBulkNotification({
          userIds: scheduled.userIds,
          type: scheduled.type,
          title: scheduled.title,
          message: scheduled.message,
          linkUrl: scheduled.linkUrl,
          metadata: scheduled.metadata,
          priority: scheduled.priority,
        });
      }

      // 상태 업데이트: 처리 완료
      await this.repository.updateScheduledNotificationStatus(
        scheduled.id,
        ScheduledNotificationStatus.PROCESSED,
      );

      this.logger.debug(`Scheduled notification ${scheduled.id} processed successfully`);
    } catch (error) {
      this.logger.error(
        `Error processing scheduled notification ${scheduled.id}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * 새 복지 프로그램 알림 예약
   * @param programId 복지 프로그램 ID
   */
  async scheduleNewWelfareNotification(programId: string): Promise<void> {
    this.logger.debug(`Scheduling new welfare notification for program ${programId}`);

    // 프로그램 정보 조회
    const programQuery = `
      SELECT id, name, category, summary 
      FROM welfare_program 
      WHERE id = $1 AND is_active = true
    `;

    try {
      const result = await this.repository['pool'].query(programQuery, [programId]);

      if (result.rows.length === 0) {
        this.logger.warn(`Program ${programId} not found or inactive`);
        return;
      }

      const program = result.rows[0];

      // 대상 사용자 조회 (카테고리 관심 사용자)
      const targetUserIds = await this.findTargetUsersForNewWelfare(program.category);

      if (targetUserIds.length === 0) {
        this.logger.debug(`No target users found for new welfare notification`);
        return;
      }

      // 즉시 발송이 아닌 5분 후 예약 (중복 방지)
      const scheduledAt = new Date(Date.now() + 5 * 60 * 1000);

      await this.repository.createScheduledNotification({
        userIds: targetUserIds,
        type: NotificationType.NEW_WELFARE,
        title: '새로운 복지 혜택 안내',
        message: `${program.name} 혜택이 새로 등록되었습니다.`,
        linkUrl: `/welfare/${program.id}`,
        metadata: {
          programId: program.id,
          programName: program.name,
          category: program.category,
        },
        scheduledAt,
      });

      this.logger.log(
        `Scheduled new welfare notification for program ${program.name} to ${targetUserIds.length} users`,
      );
    } catch (error) {
      this.logger.error(`Failed to schedule new welfare notification: ${error.message}`);
      throw error;
    }
  }

  /**
   * 마감 임박 알림 예약
   * DeadlineAlertJob과 연동하여 사용
   */
  async scheduleDeadlineAlerts(): Promise<void> {
    this.logger.debug('Scheduling deadline alerts...');

    // 마감 7일, 3일, 1일 전 프로그램 조회 및 알림 예약
    const deadlines = [7, 3, 1];

    for (const daysLeft of deadlines) {
      await this.scheduleDeadlineAlertsForDays(daysLeft);
    }
  }

  /**
   * 특정 일수 후 마감 프로그램 알림 예약
   */
  private async scheduleDeadlineAlertsForDays(daysLeft: number): Promise<void> {
    const query = `
      SELECT 
        wp.id, wp.name, wp.deadline, wp.category,
        array_agg(DISTINCT r.user_id) FILTER (WHERE r.user_id IS NOT NULL) as user_ids
      FROM welfare_program wp
      LEFT JOIN recommendation r ON wp.id = r.welfare_program_id
      WHERE 
        wp.is_active = true 
        AND wp.deleted_at IS NULL
        AND wp.deadline IS NOT NULL
        AND DATE(wp.deadline) = CURRENT_DATE + INTERVAL '${daysLeft} days'
      GROUP BY wp.id, wp.name, wp.deadline, wp.category
      HAVING COUNT(r.user_id) > 0
    `;

    try {
      const result = await this.repository['pool'].query(query);

      for (const row of result.rows) {
        const userIds = row.user_ids || [];
        if (userIds.length === 0) continue;

        // 다음 날 오전 9시에 예약
        const scheduledAt = new Date();
        scheduledAt.setDate(scheduledAt.getDate() + 1);
        scheduledAt.setHours(9, 0, 0, 0);

        await this.repository.createScheduledNotification({
          userIds,
          type: NotificationType.DEADLINE_ALERT,
          title: `마감 임박: ${row.name}`,
          message: `${row.name} 신청 마감이 ${daysLeft}일 남았습니다!`,
          linkUrl: `/welfare/${row.id}`,
          metadata: {
            programId: row.id,
            programName: row.name,
            deadline: row.deadline,
            category: row.category,
          },
          scheduledAt,
        });
      }

      this.logger.debug(`Scheduled D-${daysLeft} deadline alerts for ${result.rows.length} programs`);
    } catch (error) {
      this.logger.error(`Failed to schedule deadline alerts: ${error.message}`);
    }
  }

  /**
   * 새 복지 프로그램 알림 대상 사용자 조회
   */
  private async findTargetUsersForNewWelfare(category: string): Promise<string[]> {
    // 해당 카테고리에 관심있는 사용자 또는 전체 알림 수신 사용자
    const query = `
      SELECT DISTINCT ns.user_id
      FROM notification_setting ns
      WHERE ns.new_welfare_enabled = true AND ns.in_app_enabled = true
      LIMIT 1000
    `;

    try {
      const result = await this.repository['pool'].query(query);
      return result.rows.map((row) => row.user_id);
    } catch (error) {
      this.logger.error(`Failed to find target users: ${error.message}`);
      return [];
    }
  }

  /**
   * 예약 알림 취소
   */
  async cancelScheduledNotification(scheduledId: string): Promise<void> {
    await this.repository.updateScheduledNotificationStatus(
      scheduledId,
      ScheduledNotificationStatus.CANCELLED,
    );
    this.logger.debug(`Scheduled notification ${scheduledId} cancelled`);
  }

  /**
   * 수동 실행 (관리자용)
   */
  async runManually(): Promise<number> {
    this.logger.log('Running manual scheduled notification processing');
    return this.processScheduledNotifications();
  }
}
