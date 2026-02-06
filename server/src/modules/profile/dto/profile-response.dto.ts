/**
 * 프로필 응답 DTO
 * API 응답 데이터 형식 정의
 */

import { 
  Gender, 
  IncomeType, 
  IncomeBracket, 
  ProfileStep 
} from '../entities/user-profile.entity';
import { FamilyRelation, RELATION_LABELS } from '../entities/household-member.entity';

// ==================== 소득 구간 라벨 ====================

export const INCOME_BRACKET_LABELS: Record<IncomeBracket, string> = {
  [IncomeBracket.BELOW_50]: '중위소득 50% 이하',
  [IncomeBracket.BELOW_75]: '중위소득 50~75%',
  [IncomeBracket.BELOW_100]: '중위소득 75~100%',
  [IncomeBracket.BELOW_150]: '중위소득 100~150%',
  [IncomeBracket.ABOVE_150]: '중위소득 150% 초과',
};

// ==================== 응답 DTO 클래스 ====================

/** 기본 정보 응답 */
export class BasicInfoResponseDto {
  /** 마스킹 처리된 이름 (예: 홍*동) */
  name: string;
  
  /** 전체 이름 (본인 조회 시) */
  nameFull?: string;
  
  /** 생년월일 (ISO 형식) */
  birthDate: string;
  
  /** 계산된 나이 */
  age: number;
  
  /** 성별 */
  gender: Gender;
  
  /** 마스킹 처리된 전화번호 (예: 010-****-1234) */
  phone: string;
  
  /** 전체 전화번호 (본인 조회 시) */
  phoneFull?: string;
  
  /** 이메일 */
  email?: string;
}

/** 소득 정보 응답 */
export class IncomeResponseDto {
  /** 소득 유형 */
  type: IncomeType;
  
  /** 소득 구간 */
  bracket: IncomeBracket;
  
  /** 소득 구간 라벨 (예: "중위소득 50% 이하") */
  bracketLabel: string;
}

/** 주소 정보 응답 */
export class AddressResponseDto {
  /** 우편번호 */
  zipCode: string;
  
  /** 시/도 */
  sido: string;
  
  /** 시/군/구 */
  sigungu: string;
  
  /** 도로명 주소 */
  roadAddress: string;
  
  /** 상세 주소 (본인 조회 시만 포함) */
  detail?: string;
  
  /** 건물명 */
  buildingName?: string;
}

/** 가구원 응답 */
export class HouseholdMemberResponseDto {
  /** 가구원 ID */
  id: string;
  
  /** 관계 */
  relation: FamilyRelation;
  
  /** 관계 라벨 (예: "배우자", "자녀") */
  relationLabel: string;
  
  /** 마스킹 처리된 이름 */
  name: string;
  
  /** 나이 */
  age: number;
  
  /** 성별 */
  gender: Gender;
  
  /** 장애 여부 */
  hasDisability: boolean;
  
  /** 소득 유무 */
  hasIncome: boolean;
}

/** 가구 정보 응답 */
export class HouseholdResponseDto {
  /** 가구원 수 */
  size: number;
  
  /** 가구원 목록 */
  members: HouseholdMemberResponseDto[];
}

/** 메타 정보 응답 */
export class ProfileMetaResponseDto {
  /** 프로필 완성도 (0-100) */
  completionRate: number;
  
  /** 현재 입력 단계 */
  currentStep: ProfileStep;
  
  /** 완료 여부 */
  isComplete: boolean;
  
  /** 생성일 */
  createdAt: string;
  
  /** 수정일 */
  updatedAt: string;
}

/** 전체 프로필 응답 */
export class ProfileResponseDto {
  /** 프로필 ID */
  id: string;
  
  /** 기본 정보 */
  basicInfo: BasicInfoResponseDto;
  
  /** 소득 정보 */
  income: IncomeResponseDto;
  
  /** 주소 정보 */
  address: AddressResponseDto;
  
  /** 가구 정보 */
  household: HouseholdResponseDto;
  
  /** 메타 정보 */
  meta: ProfileMetaResponseDto;
}

// ==================== 완성도 응답 DTO ====================

/** 단계별 완성도 */
export class StepCompletionDto {
  /** 단계 */
  step: ProfileStep;
  
  /** 단계 라벨 */
  label: string;
  
  /** 완료 여부 */
  isComplete: boolean;
  
  /** 완성도 (0-100) */
  completionRate: number;
  
  /** 누락 필드 목록 */
  missingFields: string[];
}

/** 프로필 완성도 응답 */
export class ProfileCompletionResponseDto {
  /** 전체 완성도 (0-100) */
  overall: number;
  
  /** 단계별 완성도 */
  steps: StepCompletionDto[];
}

// ==================== 성공 응답 DTO ====================

export class ProfileSuccessResponseDto {
  success: boolean;
  nextStep?: ProfileStep;
  bracket?: IncomeBracket;
  isComplete?: boolean;
  savedAt?: string;
}
