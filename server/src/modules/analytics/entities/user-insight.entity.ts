/**
 * 사용자 인사이트 엔티티
 * 개인화된 인사이트/팁을 저장
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

// 인사이트 유형 Enum
export enum InsightType {
  TOP_CATEGORY = 'top_category',
  ACTIVITY_INCREASE = 'activity_increase',
  NEW_RECOMMENDATION = 'new_recommendation',
  BOOKMARK_REMINDER = 'bookmark_reminder',
  UNUSED_BENEFIT = 'unused_benefit',
}

// 인사이트 관련 데이터 인터페이스
export interface InsightRelatedData {
  categoryName?: string;
  programIds?: string[];
  percentageChange?: number;
  comparisonPeriod?: string;
}

@Entity('user_insight')
@Index(['userId', 'validUntil'])
@Index(['userId', 'priority', 'createdAt'])
export class UserInsight {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({
    name: 'insight_type',
    type: 'varchar',
    length: 50,
    enum: InsightType,
  })
  @Index()
  insightType: InsightType;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'related_data', type: 'jsonb', default: {} })
  relatedData: InsightRelatedData;

  @Column({ type: 'integer', default: 5 })
  priority: number;

  @Column({ name: 'is_read', type: 'boolean', default: false })
  isRead: boolean;

  @Column({ name: 'valid_until', type: 'date', nullable: true })
  @Index()
  validUntil: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
