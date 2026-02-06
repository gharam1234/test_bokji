/**
 * 프로필 타입 정의
 * 프로필 관련 TypeScript 타입
 */

// ==================== Enums ====================

/** 성별 */
export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

/** 성별 라벨 */
export const GENDER_LABELS: Record<Gender, string> = {
  [Gender.MALE]: '남성',
  [Gender.FEMALE]: '여성',
  [Gender.OTHER]: '기타',
};

/** 소득 유형 */
export enum IncomeType {
  EMPLOYMENT = 'employment',     // 근로소득
  BUSINESS = 'business',         // 사업소득
  PROPERTY = 'property',         // 재산소득
  PENSION = 'pension',           // 연금소득
  OTHER = 'other',               // 기타소득
  NONE = 'none',                 // 소득 없음
}

/** 소득 유형 라벨 */
export const INCOME_TYPE_LABELS: Record<IncomeType, string> = {
  [IncomeType.EMPLOYMENT]: '근로소득',
  [IncomeType.BUSINESS]: '사업소득',
  [IncomeType.PROPERTY]: '재산소득',
  [IncomeType.PENSION]: '연금소득',
  [IncomeType.OTHER]: '기타소득',
  [IncomeType.NONE]: '소득 없음',
};

/** 소득 구간 (기준 중위소득 대비) */
export enum IncomeBracket {
  BELOW_50 = 'below_50',         // 50% 이하
  BELOW_75 = 'below_75',         // 50% ~ 75%
  BELOW_100 = 'below_100',       // 75% ~ 100%
  BELOW_150 = 'below_150',       // 100% ~ 150%
  ABOVE_150 = 'above_150',       // 150% 초과
}

/** 소득 구간 라벨 */
export const INCOME_BRACKET_LABELS: Record<IncomeBracket, string> = {
  [IncomeBracket.BELOW_50]: '중위소득 50% 이하',
  [IncomeBracket.BELOW_75]: '중위소득 50~75%',
  [IncomeBracket.BELOW_100]: '중위소득 75~100%',
  [IncomeBracket.BELOW_150]: '중위소득 100~150%',
  [IncomeBracket.ABOVE_150]: '중위소득 150% 초과',
};

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

/** 관계 라벨 */
export const RELATION_LABELS: Record<FamilyRelation, string> = {
  [FamilyRelation.SELF]: '본인',
  [FamilyRelation.SPOUSE]: '배우자',
  [FamilyRelation.CHILD]: '자녀',
  [FamilyRelation.PARENT]: '부모',
  [FamilyRelation.GRANDPARENT]: '조부모',
  [FamilyRelation.SIBLING]: '형제자매',
  [FamilyRelation.OTHER]: '기타',
};

/** 프로필 완성 단계 */
export enum ProfileStep {
  BASIC_INFO = 'basic_info',
  INCOME = 'income',
  ADDRESS = 'address',
  HOUSEHOLD = 'household',
  COMPLETE = 'complete',
}

/** 단계 라벨 */
export const STEP_LABELS: Record<ProfileStep, string> = {
  [ProfileStep.BASIC_INFO]: '기본 정보',
  [ProfileStep.INCOME]: '소득 정보',
  [ProfileStep.ADDRESS]: '주소 정보',
  [ProfileStep.HOUSEHOLD]: '가구원 정보',
  [ProfileStep.COMPLETE]: '완료',
};

// ==================== 응답 타입 ====================

/** 기본 정보 응답 */
export interface BasicInfoResponse {
  name: string;
  nameFull?: string;
  birthDate: string;
  age: number;
  gender: Gender;
  phone: string;
  phoneFull?: string;
  email?: string;
}

/** 소득 정보 응답 */
export interface IncomeResponse {
  type: IncomeType;
  bracket: IncomeBracket;
  bracketLabel: string;
}

/** 주소 정보 응답 */
export interface AddressResponse {
  zipCode: string;
  sido: string;
  sigungu: string;
  roadAddress: string;
  detail?: string;
  buildingName?: string;
}

/** 가구원 응답 */
export interface HouseholdMemberResponse {
  id: string;
  relation: FamilyRelation;
  relationLabel: string;
  name: string;
  age: number;
  gender: Gender;
  hasDisability: boolean;
  hasIncome: boolean;
}

/** 가구 정보 응답 */
export interface HouseholdResponse {
  size: number;
  members: HouseholdMemberResponse[];
}

/** 메타 정보 응답 */
export interface ProfileMetaResponse {
  completionRate: number;
  currentStep: ProfileStep;
  isComplete: boolean;
  createdAt: string;
  updatedAt: string;
}

/** 전체 프로필 응답 */
export interface ProfileResponse {
  id: string;
  basicInfo: BasicInfoResponse;
  income: IncomeResponse;
  address: AddressResponse;
  household: HouseholdResponse;
  meta: ProfileMetaResponse;
}

// ==================== 완성도 응답 ====================

/** 단계별 완성도 */
export interface StepCompletion {
  step: ProfileStep;
  label: string;
  isComplete: boolean;
  completionRate: number;
  missingFields: string[];
}

/** 프로필 완성도 응답 */
export interface ProfileCompletionResponse {
  overall: number;
  steps: StepCompletion[];
}

// ==================== 성공 응답 ====================

export interface ProfileSuccessResponse {
  success: boolean;
  nextStep?: ProfileStep;
  bracket?: IncomeBracket;
  isComplete?: boolean;
  savedAt?: string;
}

// ==================== 임시 저장 응답 ====================

export interface ProfileDraftResponse {
  currentStep: ProfileStep;
  formData: Partial<ProfileFormData>;
  savedAt: string;
}

// ==================== 폼 데이터 타입 ====================

/** 기본 정보 입력 */
export interface BasicInfoFormData {
  name: string;
  birthDate: string;
  gender: Gender;
  phone: string;
  email?: string;
}

/** 소득 정보 입력 */
export interface IncomeFormData {
  type: IncomeType;
  annualAmount: number;
}

/** 주소 정보 입력 */
export interface AddressFormData {
  zipCode: string;
  sido: string;
  sigungu: string;
  roadAddress: string;
  jibunAddress?: string;
  detail: string;
  buildingName?: string;
}

/** 가구원 입력 */
export interface HouseholdMemberInput {
  relation: FamilyRelation;
  name: string;
  birthDate: string;
  gender: Gender;
  hasDisability: boolean;
  hasIncome: boolean;
}

/** 가구 정보 입력 */
export interface HouseholdFormData {
  size: number;
  members: HouseholdMemberInput[];
}

/** 전체 프로필 폼 데이터 */
export interface ProfileFormData {
  basicInfo: BasicInfoFormData;
  income: IncomeFormData;
  address: AddressFormData;
  household: HouseholdFormData;
}

// ==================== 주소 검색 타입 ====================

/** 주소 검색 결과 */
export interface AddressSearchResult {
  zipCode: string;
  sido: string;
  sigungu: string;
  roadAddress: string;
  jibunAddress: string;
  buildingName?: string;
}
