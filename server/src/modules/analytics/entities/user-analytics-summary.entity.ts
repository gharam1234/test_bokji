/**
 * 사용자 분석 요약 엔티티
 * 일별/주별/월별 집계 데이터를 저장
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Unique,
} from 'typeorm';

// 기간 유형 Enum
export enum PeriodType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

// 카테고리별 카운트 인터페이스
export interface CategoryCount {
  category: string;
  count: number;
  percentage: number;
}

// 프로그램별 카운트 인터페이스
export interface ProgramCount {
  programId: string;
  programName: string;
  category: string;
  viewCount: number;
}

// 전환율 메트릭 인터페이스
export interface ConversionMetrics {
  recommendationToView: number;
  viewToBookmark: number;
  recommendationToBookmark: number;
}

@Entity('user_analytics_summary')
@Unique(['userId', 'periodType', 'periodStart'])
@Index(['userId', 'periodType', 'periodStart'])
export class UserAnalyticsSummary {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({
    name: 'period_type',
    type: 'varchar',
    length: 20,
    enum: PeriodType,
  })
  periodType: PeriodType;

  @Column({ name: 'period_start', type: 'date' })
  @Index()
  periodStart: Date;

  @Column({ name: 'period_end', type: 'date' })
  periodEnd: Date;

  @Column({ name: 'total_searches', type: 'integer', default: 0 })
  totalSearches: number;

  @Column({ name: 'total_views', type: 'integer', default: 0 })
  totalViews: number;

  @Column({ name: 'total_bookmarks', type: 'integer', default: 0 })
  totalBookmarks: number;

  @Column({ name: 'recommendation_clicks', type: 'integer', default: 0 })
  recommendationClicks: number;

  @Column({ name: 'recommendation_views', type: 'integer', default: 0 })
  recommendationViews: number;

  @Column({ name: 'top_categories', type: 'jsonb', default: [] })
  topCategories: CategoryCount[];

  @Column({ name: 'top_programs', type: 'jsonb', default: [] })
  topPrograms: ProgramCount[];

  @Column({ name: 'conversion_rate', type: 'jsonb', default: {} })
  conversionRate: ConversionMetrics;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
