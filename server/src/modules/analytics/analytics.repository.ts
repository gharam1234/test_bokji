/**
 * Analytics Repository
 * 분석 데이터 접근 계층
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import {
  UserActivityLog,
  ActivityType,
} from './entities/user-activity-log.entity';
import {
  UserAnalyticsSummary,
  PeriodType,
  CategoryCount,
  ProgramCount,
} from './entities/user-analytics-summary.entity';
import { UserInsight } from './entities/user-insight.entity';

@Injectable()
export class AnalyticsRepository {
  constructor(
    @InjectRepository(UserActivityLog)
    private readonly activityLogRepo: Repository<UserActivityLog>,
    @InjectRepository(UserAnalyticsSummary)
    private readonly summaryRepo: Repository<UserAnalyticsSummary>,
    @InjectRepository(UserInsight)
    private readonly insightRepo: Repository<UserInsight>,
  ) {}

  // ==================== 활동 로그 ====================

  /**
   * 활동 로그 생성
   */
  async createActivityLog(
    data: Partial<UserActivityLog>,
  ): Promise<UserActivityLog> {
    const log = this.activityLogRepo.create(data);
    return this.activityLogRepo.save(log);
  }

  /**
   * 기간별 활동 로그 조회
   */
  async findActivityLogs(
    userId: string,
    startDate: Date,
    endDate: Date,
    activityType?: ActivityType,
  ): Promise<UserActivityLog[]> {
    const query = this.activityLogRepo
      .createQueryBuilder('log')
      .where('log.userId = :userId', { userId })
      .andWhere('log.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });

    if (activityType) {
      query.andWhere('log.activityType = :activityType', { activityType });
    }

    return query.orderBy('log.createdAt', 'DESC').getMany();
  }

  /**
   * 활동 유형별 카운트 조회
   */
  async getActivityCounts(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{ activityType: ActivityType; count: number }[]> {
    return this.activityLogRepo
      .createQueryBuilder('log')
      .select('log.activityType', 'activityType')
      .addSelect('COUNT(*)', 'count')
      .where('log.userId = :userId', { userId })
      .andWhere('log.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .groupBy('log.activityType')
      .getRawMany();
  }

  /**
   * 카테고리별 활동 분포 조회
   */
  async getCategoryDistribution(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<CategoryCount[]> {
    const results = await this.activityLogRepo
      .createQueryBuilder('log')
      .select('log.targetCategory', 'category')
      .addSelect('COUNT(*)', 'count')
      .where('log.userId = :userId', { userId })
      .andWhere('log.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .andWhere('log.targetCategory IS NOT NULL')
      .groupBy('log.targetCategory')
      .orderBy('count', 'DESC')
      .getRawMany();

    const total = results.reduce((sum, r) => sum + parseInt(r.count), 0);

    return results.map((r) => ({
      category: r.category,
      count: parseInt(r.count),
      percentage: total > 0 ? Math.round((parseInt(r.count) / total) * 1000) / 10 : 0,
    }));
  }

  /**
   * 일별 활동 트렌드 조회
   */
  async getDailyActivityTrend(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<
    {
      date: string;
      searches: number;
      views: number;
      bookmarks: number;
    }[]
  > {
    const results = await this.activityLogRepo
      .createQueryBuilder('log')
      .select("DATE(log.createdAt)", 'date')
      .addSelect(
        `SUM(CASE WHEN log.activityType = 'search' THEN 1 ELSE 0 END)`,
        'searches',
      )
      .addSelect(
        `SUM(CASE WHEN log.activityType = 'view' THEN 1 ELSE 0 END)`,
        'views',
      )
      .addSelect(
        `SUM(CASE WHEN log.activityType = 'bookmark' THEN 1 ELSE 0 END)`,
        'bookmarks',
      )
      .where('log.userId = :userId', { userId })
      .andWhere('log.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .groupBy('DATE(log.createdAt)')
      .orderBy('date', 'ASC')
      .getRawMany();

    return results.map((r) => ({
      date: r.date,
      searches: parseInt(r.searches) || 0,
      views: parseInt(r.views) || 0,
      bookmarks: parseInt(r.bookmarks) || 0,
    }));
  }

  /**
   * 상위 조회 프로그램 조회
   */
  async getTopPrograms(
    userId: string,
    startDate: Date,
    endDate: Date,
    limit: number = 5,
  ): Promise<ProgramCount[]> {
    const results = await this.activityLogRepo
      .createQueryBuilder('log')
      .select('log.targetId', 'programId')
      .addSelect('log.targetCategory', 'category')
      .addSelect('COUNT(*)', 'viewCount')
      .where('log.userId = :userId', { userId })
      .andWhere('log.activityType = :activityType', {
        activityType: ActivityType.VIEW,
      })
      .andWhere('log.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .andWhere('log.targetId IS NOT NULL')
      .groupBy('log.targetId')
      .addGroupBy('log.targetCategory')
      .orderBy('viewCount', 'DESC')
      .limit(limit)
      .getRawMany();

    return results.map((r) => ({
      programId: r.programId,
      programName: `복지 프로그램 ${r.programId.substring(0, 8)}`, // 실제 구현시 JOIN 필요
      category: r.category || '기타',
      viewCount: parseInt(r.viewCount),
    }));
  }

  /**
   * 활동 일수 조회
   */
  async getActiveDays(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const result = await this.activityLogRepo
      .createQueryBuilder('log')
      .select('COUNT(DISTINCT DATE(log.createdAt))', 'days')
      .where('log.userId = :userId', { userId })
      .andWhere('log.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .getRawOne();

    return parseInt(result?.days) || 0;
  }

  /**
   * 현재 즐겨찾기 목록 조회
   * 북마크 추가 후 제거되지 않은 항목들을 조회
   */
  async getCurrentFavorites(userId: string): Promise<UserActivityLog[]> {
    // 최근 북마크 활동에서 아직 제거되지 않은 것들 조회
    // 실제 구현시에는 별도의 favorites 테이블을 사용하는 것이 좋음
    const bookmarkLogs = await this.activityLogRepo
      .createQueryBuilder('log')
      .where('log.userId = :userId', { userId })
      .andWhere('log.activityType = :activityType', {
        activityType: ActivityType.BOOKMARK,
      })
      .andWhere('log.targetId IS NOT NULL')
      .orderBy('log.createdAt', 'DESC')
      .getMany();

    // 제거된 북마크 ID 목록 조회
    const unbookmarkLogs = await this.activityLogRepo
      .createQueryBuilder('log')
      .select('log.targetId', 'targetId')
      .where('log.userId = :userId', { userId })
      .andWhere('log.activityType = :activityType', {
        activityType: ActivityType.UNBOOKMARK,
      })
      .getRawMany();

    const unbookmarkedIds = new Set(unbookmarkLogs.map((u) => u.targetId));

    // 제거되지 않은 북마크만 반환 (중복 제거)
    const seenIds = new Set<string>();
    return bookmarkLogs.filter((log) => {
      if (unbookmarkedIds.has(log.targetId) || seenIds.has(log.targetId)) {
        return false;
      }
      seenIds.add(log.targetId);
      return true;
    });
  }

  // ==================== 분석 요약 ====================

  /**
   * 분석 요약 저장/업데이트 (Upsert)
   */
  async upsertSummary(
    data: Partial<UserAnalyticsSummary>,
  ): Promise<UserAnalyticsSummary> {
    const existing = await this.summaryRepo.findOne({
      where: {
        userId: data.userId,
        periodType: data.periodType,
        periodStart: data.periodStart,
      },
    });

    if (existing) {
      Object.assign(existing, data);
      return this.summaryRepo.save(existing);
    }

    const summary = this.summaryRepo.create(data);
    return this.summaryRepo.save(summary);
  }

  /**
   * 분석 요약 조회
   */
  async findSummary(
    userId: string,
    periodType: PeriodType,
    periodStart: Date,
  ): Promise<UserAnalyticsSummary | null> {
    return this.summaryRepo.findOne({
      where: { userId, periodType, periodStart },
    });
  }

  /**
   * 기간 범위의 분석 요약 목록 조회
   */
  async findSummariesInRange(
    userId: string,
    periodType: PeriodType,
    startDate: Date,
    endDate: Date,
  ): Promise<UserAnalyticsSummary[]> {
    return this.summaryRepo.find({
      where: {
        userId,
        periodType,
        periodStart: Between(startDate, endDate),
      },
      order: { periodStart: 'ASC' },
    });
  }

  // ==================== 인사이트 ====================

  /**
   * 인사이트 생성
   */
  async createInsight(data: Partial<UserInsight>): Promise<UserInsight> {
    const insight = this.insightRepo.create(data);
    return this.insightRepo.save(insight);
  }

  /**
   * 유효한 인사이트 목록 조회
   */
  async findValidInsights(
    userId: string,
    limit: number = 10,
  ): Promise<UserInsight[]> {
    const today = new Date();

    return this.insightRepo
      .createQueryBuilder('insight')
      .where('insight.userId = :userId', { userId })
      .andWhere(
        '(insight.validUntil IS NULL OR insight.validUntil >= :today)',
        { today },
      )
      .orderBy('insight.isRead', 'ASC')
      .addOrderBy('insight.priority', 'DESC')
      .addOrderBy('insight.createdAt', 'DESC')
      .limit(limit)
      .getMany();
  }

  /**
   * 인사이트 읽음 처리
   */
  async markInsightAsRead(userId: string, insightId: string): Promise<void> {
    await this.insightRepo.update(
      { id: insightId, userId },
      { isRead: true },
    );
  }

  /**
   * 만료된 인사이트 삭제
   */
  async deleteExpiredInsights(): Promise<number> {
    const result = await this.insightRepo
      .createQueryBuilder()
      .delete()
      .where('validUntil < :today', { today: new Date() })
      .execute();

    return result.affected || 0;
  }
}
