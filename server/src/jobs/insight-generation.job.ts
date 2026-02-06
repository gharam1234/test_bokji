/**
 * 인사이트 생성 배치 작업
 * 정기적으로 사용자 인사이트 생성
 */

import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InsightGeneratorService } from '../modules/analytics/services/insight-generator.service';

@Injectable()
export class InsightGenerationJob {
  private readonly logger = new Logger(InsightGenerationJob.name);

  constructor(private readonly insightGeneratorService: InsightGeneratorService) {}

  /**
   * 매일 새벽 3시에 인사이트 생성 (일별 집계 후 실행)
   * Cron: 0 0 3 * * * (매일 03:00)
   */
  @Cron('0 0 3 * * *')
  async handleDailyInsightGeneration(): Promise<void> {
    this.logger.log('Starting daily insight generation job...');

    try {
      // 모든 활성 사용자 ID 조회
      const userIds = await this.getAllActiveUserIds();

      let successCount = 0;
      let failCount = 0;

      for (const userId of userIds) {
        try {
          await this.insightGeneratorService.generateInsights(userId);
          successCount++;
        } catch (error) {
          this.logger.warn(`Failed to generate insights for user ${userId}: ${error.message}`);
          failCount++;
        }
      }

      this.logger.log(
        `Daily insight generation completed: ${successCount} succeeded, ${failCount} failed`,
      );
    } catch (error) {
      this.logger.error(`Daily insight generation job failed: ${error.message}`, error.stack);
    }
  }

  /**
   * 매주 월요일 새벽 4시에 주간 인사이트 생성
   * Cron: 0 0 4 * * 1 (매주 월요일 04:00)
   */
  @Cron('0 0 4 * * 1')
  async handleWeeklyInsightGeneration(): Promise<void> {
    this.logger.log('Starting weekly insight generation job...');

    try {
      const userIds = await this.getAllActiveUserIds();

      for (const userId of userIds) {
        try {
          // 주간 특화 인사이트 생성
          await this.generateWeeklyInsights(userId);
        } catch (error) {
          this.logger.warn(`Failed to generate weekly insights for user ${userId}: ${error.message}`);
        }
      }

      this.logger.log('Weekly insight generation completed');
    } catch (error) {
      this.logger.error(`Weekly insight generation job failed: ${error.message}`, error.stack);
    }
  }

  /**
   * 특정 사용자의 인사이트 수동 생성 (관리자용)
   * @param userId 사용자 ID
   */
  async runManuallyForUser(userId: string): Promise<void> {
    this.logger.log(`Running manual insight generation for user ${userId}`);
    await this.insightGeneratorService.generateInsights(userId);
  }

  /**
   * 모든 사용자의 인사이트 수동 생성 (관리자용)
   */
  async runManuallyForAll(): Promise<void> {
    this.logger.log('Running manual insight generation for all users');
    const userIds = await this.getAllActiveUserIds();

    for (const userId of userIds) {
      try {
        await this.insightGeneratorService.generateInsights(userId);
      } catch (error) {
        this.logger.warn(`Failed to generate insights for user ${userId}: ${error.message}`);
      }
    }
  }

  /**
   * 주간 특화 인사이트 생성
   * @param userId 사용자 ID
   */
  private async generateWeeklyInsights(userId: string): Promise<void> {
    // 주간 분석 기반 인사이트 (활동 증가/감소 트렌드 등)
    await this.insightGeneratorService.generateInsights(userId);
  }

  /**
   * 모든 활성 사용자 ID 조회
   * 실제 구현시 User 서비스에서 조회
   */
  private async getAllActiveUserIds(): Promise<string[]> {
    // TODO: 실제 구현 필요
    // return this.userService.getAllActiveUserIds();
    return [];
  }
}
