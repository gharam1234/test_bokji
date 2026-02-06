/**
 * 사용자 활동 로그 엔티티
 * 사용자의 복지 서비스 이용 활동을 기록
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';

// 활동 유형 Enum
export enum ActivityType {
  SEARCH = 'search',
  VIEW = 'view',
  BOOKMARK = 'bookmark',
  UNBOOKMARK = 'unbookmark',
  RECOMMENDATION_CLICK = 'recommendation_click',
  RECOMMENDATION_VIEW = 'recommendation_view',
}

// 활동 메타데이터 인터페이스
export interface ActivityMetadata {
  searchQuery?: string;
  filters?: Record<string, string>;
  source?: 'search' | 'recommendation' | 'direct';
  sessionId?: string;
}

@Entity('user_activity_log')
@Index(['userId', 'createdAt'])
@Index(['userId', 'activityType', 'createdAt'])
export class UserActivityLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  @Index()
  userId: string;

  @Column({
    name: 'activity_type',
    type: 'varchar',
    length: 50,
    enum: ActivityType,
  })
  @Index()
  activityType: ActivityType;

  @Column({ name: 'target_id', type: 'uuid', nullable: true })
  targetId: string | null;

  @Column({ name: 'target_category', type: 'varchar', length: 100, nullable: true })
  @Index()
  targetCategory: string | null;

  @Column({ type: 'jsonb', default: {} })
  metadata: ActivityMetadata;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  @Index()
  createdAt: Date;
}
