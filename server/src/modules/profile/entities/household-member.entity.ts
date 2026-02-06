/**
 * 가구원 엔티티
 * 사용자 프로필에 연결된 가구원 정보
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { UserProfile, Gender } from './user-profile.entity';

// ==================== Enums ====================

/** 가구원 관계 */
export enum FamilyRelation {
  SELF = 'self',                 // 본인
  SPOUSE = 'spouse',             // 배우자
  CHILD = 'child',               // 자녀
  PARENT = 'parent',             // 부모
  GRANDPARENT = 'grandparent',   // 조부모
  SIBLING = 'sibling',           // 형제자매
  OTHER = 'other',               // 기타
}

/** 관계 라벨 매핑 */
export const RELATION_LABELS: Record<FamilyRelation, string> = {
  [FamilyRelation.SELF]: '본인',
  [FamilyRelation.SPOUSE]: '배우자',
  [FamilyRelation.CHILD]: '자녀',
  [FamilyRelation.PARENT]: '부모',
  [FamilyRelation.GRANDPARENT]: '조부모',
  [FamilyRelation.SIBLING]: '형제자매',
  [FamilyRelation.OTHER]: '기타',
};

// ==================== Entity ====================

@Entity('household_member')
@Index(['profileId'])
@Index(['profileId', 'displayOrder'])
export class HouseholdMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'profile_id', type: 'uuid' })
  profileId: string;

  /** 프로필 (N:1 관계) */
  @ManyToOne(() => UserProfile, (profile) => profile.householdMembers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'profile_id' })
  profile: UserProfile;

  /** 가구주와의 관계 */
  @Column({ type: 'varchar', length: 20, enum: FamilyRelation })
  @Index()
  relation: FamilyRelation;

  /** 암호화된 이름 */
  @Column({ name: 'name_encrypted', type: 'bytea' })
  nameEncrypted: Buffer;

  /** 생년월일 */
  @Column({ name: 'birth_date', type: 'date' })
  birthDate: Date;

  /** 성별 */
  @Column({ type: 'varchar', length: 10, enum: Gender })
  gender: Gender;

  /** 장애 여부 */
  @Column({ name: 'has_disability', type: 'boolean', default: false })
  hasDisability: boolean;

  /** 소득 유무 */
  @Column({ name: 'has_income', type: 'boolean', default: false })
  hasIncome: boolean;

  /** 표시 순서 */
  @Column({ name: 'display_order', type: 'integer', default: 0 })
  displayOrder: number;

  // ==================== 타임스탬프 ====================

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
