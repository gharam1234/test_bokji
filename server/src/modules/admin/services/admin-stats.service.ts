/**
 * 관리자 통계 서비스
 * 대시보드 통계 데이터 조회
 */

import { Injectable, Logger } from '@nestjs/common';
import { Pool } from 'pg';
import { AdminAuditService } from './admin-audit.service';

/** 대시보드 통계 개요 */
export interface DashboardStats {
  programs: {
    total: number;
    active: number;
    inactive: number;
    addedThisMonth: number;
    updatedThisMonth: number;
  };
  users: {
    totalProfiles: number;
    activeToday: number;
    activeThisWeek: number;
    newThisMonth: number;
  };
  activity: {
    totalSearches: number;
    totalRecommendations: number;
    totalBookmarks: number;
    searchesToday: number;
  };
  recentChanges: unknown[];
}

/** 프로그램 통계 */
export interface ProgramStats {
  byCategory: {
    category: string;
    count: number;
    percentage: number;
  }[];
  byTargetGroup: {
    targetGroup: string;
    count: number;
  }[];
  topViewed: {
    id: string;
    name: string;
    viewCount: number;
  }[];
  topBookmarked: {
    id: string;
    name: string;
    bookmarkCount: number;
  }[];
  expiringSoon: {
    id: string;
    name: string;
    applicationEndDate: string;
  }[];
}

@Injectable()
export class AdminStatsService {
  private readonly logger = new Logger(AdminStatsService.name);

  constructor(
    private readonly pool: Pool,
    private readonly auditService: AdminAuditService
  ) {}

  /**
   * 대시보드 통계 개요 조회
   */
  async getOverview(): Promise<DashboardStats> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfDay = new Date(new Date().setHours(0, 0, 0, 0));

    // 프로그램 통계
    const programStats = await this.pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE deleted_at IS NULL) as total,
        COUNT(*) FILTER (WHERE deleted_at IS NULL AND is_active = true) as active,
        COUNT(*) FILTER (WHERE deleted_at IS NULL AND is_active = false) as inactive,
        COUNT(*) FILTER (WHERE deleted_at IS NULL AND created_at >= $1) as added_this_month,
        COUNT(*) FILTER (WHERE deleted_at IS NULL AND updated_at >= $1 AND created_at < $1) as updated_this_month
      FROM welfare_program
    `, [startOfMonth.toISOString()]);

    // 사용자 통계 (user_profile 테이블이 있다면)
    let userStats = { totalProfiles: 0, activeToday: 0, activeThisWeek: 0, newThisMonth: 0 };
    try {
      const userResult = await this.pool.query(`
        SELECT 
          COUNT(*) as total_profiles,
          COUNT(*) FILTER (WHERE updated_at >= $1) as active_today,
          COUNT(*) FILTER (WHERE updated_at >= $2) as active_this_week,
          COUNT(*) FILTER (WHERE created_at >= $3) as new_this_month
        FROM user_profile
      `, [startOfDay.toISOString(), startOfWeek.toISOString(), startOfMonth.toISOString()]);
      
      userStats = {
        totalProfiles: parseInt(userResult.rows[0].total_profiles || '0', 10),
        activeToday: parseInt(userResult.rows[0].active_today || '0', 10),
        activeThisWeek: parseInt(userResult.rows[0].active_this_week || '0', 10),
        newThisMonth: parseInt(userResult.rows[0].new_this_month || '0', 10),
      };
    } catch (e) {
      this.logger.warn('user_profile table not found, skipping user stats');
    }

    // 활동 통계 (user_activity_log 테이블이 있다면)
    let activityStats = { totalSearches: 0, totalRecommendations: 0, totalBookmarks: 0, searchesToday: 0 };
    try {
      const activityResult = await this.pool.query(`
        SELECT 
          COUNT(*) FILTER (WHERE activity_type = 'search') as total_searches,
          COUNT(*) FILTER (WHERE activity_type = 'recommendation') as total_recommendations,
          COUNT(*) FILTER (WHERE activity_type = 'bookmark') as total_bookmarks,
          COUNT(*) FILTER (WHERE activity_type = 'search' AND created_at >= $1) as searches_today
        FROM user_activity_log
      `, [startOfDay.toISOString()]);

      activityStats = {
        totalSearches: parseInt(activityResult.rows[0].total_searches || '0', 10),
        totalRecommendations: parseInt(activityResult.rows[0].total_recommendations || '0', 10),
        totalBookmarks: parseInt(activityResult.rows[0].total_bookmarks || '0', 10),
        searchesToday: parseInt(activityResult.rows[0].searches_today || '0', 10),
      };
    } catch (e) {
      this.logger.warn('user_activity_log table not found, skipping activity stats');
    }

    // 최근 변경 내역
    const recentChanges = await this.auditService.findRecent(10);

    return {
      programs: {
        total: parseInt(programStats.rows[0].total || '0', 10),
        active: parseInt(programStats.rows[0].active || '0', 10),
        inactive: parseInt(programStats.rows[0].inactive || '0', 10),
        addedThisMonth: parseInt(programStats.rows[0].added_this_month || '0', 10),
        updatedThisMonth: parseInt(programStats.rows[0].updated_this_month || '0', 10),
      },
      users: userStats,
      activity: activityStats,
      recentChanges,
    };
  }

  /**
   * 프로그램 상세 통계 조회
   */
  async getProgramStats(): Promise<ProgramStats> {
    // 카테고리별 통계
    const categoryResult = await this.pool.query(`
      SELECT 
        category,
        COUNT(*) as count
      FROM welfare_program
      WHERE deleted_at IS NULL
      GROUP BY category
      ORDER BY count DESC
    `);

    const total = categoryResult.rows.reduce((sum, row) => sum + parseInt(row.count, 10), 0);
    const byCategory = categoryResult.rows.map(row => ({
      category: row.category,
      count: parseInt(row.count, 10),
      percentage: total > 0 ? Math.round((parseInt(row.count, 10) / total) * 100) : 0,
    }));

    // 대상 그룹별 통계
    const targetGroupResult = await this.pool.query(`
      SELECT 
        unnest(target_groups) as target_group,
        COUNT(*) as count
      FROM welfare_program
      WHERE deleted_at IS NULL
      GROUP BY target_group
      ORDER BY count DESC
    `);

    const byTargetGroup = targetGroupResult.rows.map(row => ({
      targetGroup: row.target_group,
      count: parseInt(row.count, 10),
    }));

    // 조회수 상위 프로그램
    const topViewedResult = await this.pool.query(`
      SELECT id, name, view_count
      FROM welfare_program
      WHERE deleted_at IS NULL
      ORDER BY view_count DESC
      LIMIT 10
    `);

    const topViewed = topViewedResult.rows.map(row => ({
      id: row.id,
      name: row.name,
      viewCount: parseInt(row.view_count, 10),
    }));

    // 북마크 상위 프로그램
    const topBookmarkedResult = await this.pool.query(`
      SELECT id, name, bookmark_count
      FROM welfare_program
      WHERE deleted_at IS NULL
      ORDER BY bookmark_count DESC
      LIMIT 10
    `);

    const topBookmarked = topBookmarkedResult.rows.map(row => ({
      id: row.id,
      name: row.name,
      bookmarkCount: parseInt(row.bookmark_count, 10),
    }));

    // 곧 마감되는 프로그램
    const expiringSoonResult = await this.pool.query(`
      SELECT id, name, application_end_date
      FROM welfare_program
      WHERE deleted_at IS NULL
        AND application_end_date IS NOT NULL
        AND application_end_date >= CURRENT_DATE
        AND application_end_date <= CURRENT_DATE + INTERVAL '30 days'
      ORDER BY application_end_date ASC
      LIMIT 10
    `);

    const expiringSoon = expiringSoonResult.rows.map(row => ({
      id: row.id,
      name: row.name,
      applicationEndDate: new Date(row.application_end_date).toISOString().split('T')[0],
    }));

    return {
      byCategory,
      byTargetGroup,
      topViewed,
      topBookmarked,
      expiringSoon,
    };
  }
}
