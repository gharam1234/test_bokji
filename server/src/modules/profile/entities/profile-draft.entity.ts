/**
 * 프로필 임시 저장 엔티티
 * 프로필 입력 중 임시 저장 데이터 관리
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { ProfileStep } from './user-profile.entity';

// ==================== Entity ====================

@Entity('profile_draft')
@Index(['userId'])
export class ProfileDraft {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId: string;

  /** 현재 입력 단계 */
  @Column({
    name: 'current_step',
    type: 'varchar',
    length: 20,
    enum: ProfileStep,
  })
  currentStep: ProfileStep;

  /** 임시 저장된 폼 데이터 (JSON) */
  @Column({ name: 'form_data', type: 'jsonb' })
  formData: Record<string, any>;

  /** 저장 시간 */
  @CreateDateColumn({ name: 'saved_at', type: 'timestamptz' })
  savedAt: Date;
}
