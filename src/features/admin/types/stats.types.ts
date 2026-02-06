/**
 * 대시보드 통계 관련 타입 정의
 */

import type { AuditLog } from './audit.types';

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
  recentChanges: AuditLog[];
}

/** 카테고리별 통계 */
export interface CategoryStat {
  category: string;
  count: number;
  percentage: number;
}

/** 대상 그룹별 통계 */
export interface TargetGroupStat {
  targetGroup: string;
  count: number;
}

/** 조회수/북마크 상위 프로그램 */
export interface TopProgram {
  id: string;
  name: string;
  viewCount?: number;
  bookmarkCount?: number;
}

/** 곧 마감되는 프로그램 */
export interface ExpiringProgram {
  id: string;
  name: string;
  applicationEndDate: string;
}

/** 프로그램 상세 통계 */
export interface ProgramStats {
  byCategory: CategoryStat[];
  byTargetGroup: TargetGroupStat[];
  topViewed: TopProgram[];
  topBookmarked: TopProgram[];
  expiringSoon: ExpiringProgram[];
}
