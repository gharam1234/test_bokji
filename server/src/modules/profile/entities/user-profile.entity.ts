/**
 * 사용자 프로필 엔티티
 * 사용자의 기본 정보, 소득, 주소, 가구 정보 관리
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { HouseholdMember } from './household-member.entity';

// ==================== Enums ====================

/** 성별 */
export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

/** 소득 유형 */
export enum IncomeType {
  EMPLOYMENT = 'employment',     // 근로소득
  BUSINESS = 'business',         // 사업소득
  PROPERTY = 'property',         // 재산소득
  PENSION = 'pension',           // 연금소득
  OTHER = 'other',               // 기타소득
  NONE = 'none',                 // 소득 없음
}

/** 소득 구간 (기준 중위소득 대비) */
export enum IncomeBracket {
  BELOW_50 = 'below_50',         // 50% 이하
  BELOW_75 = 'below_75',         // 50% ~ 75%
  BELOW_100 = 'below_100',       // 75% ~ 100%
  BELOW_150 = 'below_150',       // 100% ~ 150%
  ABOVE_150 = 'above_150',       // 150% 초과
}

/** 프로필 완성 단계 */
export enum ProfileStep {
  BASIC_INFO = 'basic_info',
  INCOME = 'income',
  ADDRESS = 'address',
  HOUSEHOLD = 'household',
  COMPLETE = 'complete',
}

// ==================== Entity ====================

@Entity('user_profile')
@Index(['userId'])
@Index(['sido', 'sigungu'])
@Index(['incomeBracket'])
@Index(['isComplete'])
export class UserProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId: string;

  // ==================== 기본 정보 ====================

  /** 암호화된 이름 */
  @Column({ name: 'name_encrypted', type: 'bytea' })
  nameEncrypted: Buffer;

  /** 이름 검색용 해시 */
  @Column({ name: 'name_hash', type: 'varchar', length: 64 })
  @Index()
  nameHash: string;

  /** 생년월일 */
  @Column({ name: 'birth_date', type: 'date' })
  birthDate: Date;

  /** 성별 */
  @Column({ type: 'varchar', length: 10, enum: Gender })
  gender: Gender;

  /** 암호화된 전화번호 */
  @Column({ name: 'phone_encrypted', type: 'bytea' })
  phoneEncrypted: Buffer;

  /** 전화번호 검색용 해시 */
  @Column({ name: 'phone_hash', type: 'varchar', length: 64 })
  @Index()
  phoneHash: string;

  /** 이메일 (선택) */
  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string | null;

  // ==================== 주소 정보 ====================

  /** 우편번호 */
  @Column({ name: 'zip_code', type: 'varchar', length: 10 })
  zipCode: string;

  /** 시/도 */
  @Column({ type: 'varchar', length: 20 })
  sido: string;

  /** 시/군/구 */
  @Column({ type: 'varchar', length: 50 })
  sigungu: string;

  /** 도로명 주소 */
  @Column({ name: 'road_address', type: 'varchar', length: 200 })
  roadAddress: string;

  /** 지번 주소 */
  @Column({ name: 'jibun_address', type: 'varchar', length: 200, nullable: true })
  jibunAddress: string | null;

  /** 암호화된 상세 주소 */
  @Column({ name: 'detail_encrypted', type: 'bytea' })
  detailEncrypted: Buffer;

  /** 건물명 */
  @Column({ name: 'building_name', type: 'varchar', length: 100, nullable: true })
  buildingName: string | null;

  // ==================== 소득 정보 ====================

  /** 소득 유형 */
  @Column({ name: 'income_type', type: 'varchar', length: 20, enum: IncomeType })
  incomeType: IncomeType;

  /** 암호화된 연간 소득 */
  @Column({ name: 'annual_amount_encrypted', type: 'bytea' })
  annualAmountEncrypted: Buffer;

  /** 소득 구간 */
  @Column({ name: 'income_bracket', type: 'varchar', length: 20, enum: IncomeBracket })
  incomeBracket: IncomeBracket;

  /** 소득 증빙 여부 */
  @Column({ name: 'has_income_verification', type: 'boolean', default: false })
  hasIncomeVerification: boolean;

  // ==================== 가구 정보 ====================

  /** 가구원 수 */
  @Column({ name: 'household_size', type: 'integer', default: 1 })
  householdSize: number;

  /** 가구원 목록 (1:N 관계) */
  @OneToMany(() => HouseholdMember, (member) => member.profile, {
    cascade: true,
    eager: false,
  })
  householdMembers: HouseholdMember[];

  // ==================== 메타 정보 ====================

  /** 프로필 완성도 (0-100) */
  @Column({ name: 'completion_rate', type: 'integer', default: 0 })
  completionRate: number;

  /** 현재 입력 단계 */
  @Column({
    name: 'current_step',
    type: 'varchar',
    length: 20,
    enum: ProfileStep,
    default: ProfileStep.BASIC_INFO,
  })
  currentStep: ProfileStep;

  /** 완료 여부 */
  @Column({ name: 'is_complete', type: 'boolean', default: false })
  isComplete: boolean;

  // ==================== 타임스탬프 ====================

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
