/**
 * 복지 프로그램 엔티티
 * 복지 프로그램 데이터 구조 정의
 */

// ==================== Enums ====================

/** 복지 카테고리 */
export enum WelfareCategory {
  LIVING_SUPPORT = 'living_support',   // 생활지원
  HOUSING = 'housing',                  // 주거
  EDUCATION = 'education',              // 교육
  MEDICAL = 'medical',                  // 의료
  EMPLOYMENT = 'employment',            // 고용
  CHILDCARE = 'childcare',              // 보육/돌봄
  OTHER = 'other',                      // 기타
}

/** 카테고리 라벨 */
export const CATEGORY_LABELS: Record<WelfareCategory, string> = {
  [WelfareCategory.LIVING_SUPPORT]: '생활지원',
  [WelfareCategory.HOUSING]: '주거',
  [WelfareCategory.EDUCATION]: '교육',
  [WelfareCategory.MEDICAL]: '의료',
  [WelfareCategory.EMPLOYMENT]: '고용',
  [WelfareCategory.CHILDCARE]: '보육/돌봄',
  [WelfareCategory.OTHER]: '기타',
};

/** 대상 그룹 */
export enum TargetGroup {
  YOUTH = 'youth',                      // 청년 (19-34세)
  MIDDLE_AGED = 'middle_aged',          // 중장년 (35-64세)
  SENIOR = 'senior',                    // 노인 (65세 이상)
  CHILD = 'child',                      // 아동
  DISABLED = 'disabled',                // 장애인
  SINGLE_PARENT = 'single_parent',      // 한부모
  MULTICULTURAL = 'multicultural',      // 다문화가정
  VETERAN = 'veteran',                  // 보훈대상자
  LOW_INCOME = 'low_income',            // 저소득층
  PREGNANT = 'pregnant',                // 임산부
  GENERAL = 'general',                  // 일반
}

/** 대상 그룹 라벨 */
export const TARGET_GROUP_LABELS: Record<TargetGroup, string> = {
  [TargetGroup.YOUTH]: '청년',
  [TargetGroup.MIDDLE_AGED]: '중장년',
  [TargetGroup.SENIOR]: '노인',
  [TargetGroup.CHILD]: '아동',
  [TargetGroup.DISABLED]: '장애인',
  [TargetGroup.SINGLE_PARENT]: '한부모',
  [TargetGroup.MULTICULTURAL]: '다문화가정',
  [TargetGroup.VETERAN]: '보훈대상자',
  [TargetGroup.LOW_INCOME]: '저소득층',
  [TargetGroup.PREGNANT]: '임산부',
  [TargetGroup.GENERAL]: '일반',
};

/** 소득 분위 */
export enum IncomeLevel {
  LEVEL_1 = 1,   // 기초생활수급
  LEVEL_2 = 2,   // 차상위
  LEVEL_3 = 3,   // 중위소득 50% 이하
  LEVEL_4 = 4,   // 중위소득 75% 이하
  LEVEL_5 = 5,   // 중위소득 100% 이하
  LEVEL_6 = 6,   // 중위소득 150% 이하
  LEVEL_7 = 7,   // 중위소득 200% 이하
  LEVEL_8 = 8,   // 중위소득 200% 초과
}

/** 가구 유형 */
export enum HouseholdType {
  SINGLE = 'single',                    // 1인가구
  COUPLE = 'couple',                    // 부부
  NUCLEAR = 'nuclear',                  // 핵가족
  EXTENDED = 'extended',                // 대가족
  SINGLE_PARENT = 'single_parent',      // 한부모
  MULTI_CHILD = 'multi_child',          // 다자녀 (3명 이상)
  GRANDPARENT = 'grandparent',          // 조손가정
}

/** 가구 유형 라벨 */
export const HOUSEHOLD_TYPE_LABELS: Record<HouseholdType, string> = {
  [HouseholdType.SINGLE]: '1인가구',
  [HouseholdType.COUPLE]: '부부',
  [HouseholdType.NUCLEAR]: '핵가족',
  [HouseholdType.EXTENDED]: '대가족',
  [HouseholdType.SINGLE_PARENT]: '한부모',
  [HouseholdType.MULTI_CHILD]: '다자녀',
  [HouseholdType.GRANDPARENT]: '조손가정',
};

// ==================== Interfaces ====================

/** 특수 조건 */
export interface SpecialCondition {
  key: string;                          // 조건 키
  label: string;                        // 표시 라벨
  value: boolean | string | number;     // 조건 값
  isRequired: boolean;                  // 필수 여부
  bonusScore?: number;                  // 가점 (선택 조건인 경우)
}

/** 지역 코드 */
export interface RegionCode {
  sido: string;                         // 시/도 코드
  sigungu?: string;                     // 시/군/구 코드
}

/** 자격 조건 */
export interface EligibilityCriteria {
  ageMin?: number | null;               // 최소 나이
  ageMax?: number | null;               // 최대 나이
  incomeLevels: IncomeLevel[];          // 해당 소득 분위
  regions: RegionCode[];                // 지역 코드
  householdTypes: HouseholdType[];      // 가구 유형
  specialConditions: SpecialCondition[]; // 특수 조건
}

/** 온라인 신청 */
export interface OnlineApplication {
  url: string;
  siteName: string;
  instructions?: string;
}

/** 오프라인 신청 */
export interface OfflineApplication {
  location: string;
  address: string;
  instructions?: string;
}

/** 신청 방법 */
export interface ApplicationMethod {
  online?: OnlineApplication;
  offline?: OfflineApplication;
  phone?: string;
}

/** 필요 서류 */
export interface RequiredDocument {
  name: string;
  description?: string;
  isRequired: boolean;
  templateUrl?: string;
}

/** 연락처 정보 */
export interface ContactInfo {
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  operatingHours?: string;
}

// ==================== Entity ====================

/** 복지 프로그램 엔티티 */
export interface WelfareProgram {
  id: string;
  name: string;
  description: string;
  summary: string;
  category: WelfareCategory;
  targetGroups: TargetGroup[];
  eligibilityCriteria: EligibilityCriteria;
  applicationMethod: ApplicationMethod;
  requiredDocuments: RequiredDocument[];
  contactInfo: ContactInfo | null;
  benefits: string;
  benefitAmount?: string | null;
  applicationStartDate?: Date | null;
  applicationEndDate?: Date | null;
  isAlwaysOpen: boolean;
  managingOrganization: string;
  sourceUrl?: string | null;
  tags: string[];
  viewCount: number;
  bookmarkCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** DB 로우 타입 */
export interface WelfareProgramRow {
  id: string;
  name: string;
  description: string;
  summary: string;
  category: string;
  target_groups: string[];
  eligibility_criteria: EligibilityCriteria;
  application_method: ApplicationMethod;
  required_documents: RequiredDocument[];
  contact_info: ContactInfo | null;
  benefits: string;
  benefit_amount: string | null;
  application_start_date: Date | null;
  application_end_date: Date | null;
  is_always_open: boolean;
  managing_organization: string;
  source_url: string | null;
  tags: string[];
  view_count: number;
  bookmark_count: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * DB 로우를 엔티티로 변환
 */
export function toWelfareProgram(row: WelfareProgramRow): WelfareProgram {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    summary: row.summary,
    category: row.category as WelfareCategory,
    targetGroups: row.target_groups as TargetGroup[],
    eligibilityCriteria: row.eligibility_criteria,
    applicationMethod: row.application_method,
    requiredDocuments: row.required_documents,
    contactInfo: row.contact_info,
    benefits: row.benefits,
    benefitAmount: row.benefit_amount,
    applicationStartDate: row.application_start_date,
    applicationEndDate: row.application_end_date,
    isAlwaysOpen: row.is_always_open,
    managingOrganization: row.managing_organization,
    sourceUrl: row.source_url,
    tags: row.tags,
    viewCount: row.view_count,
    bookmarkCount: row.bookmark_count,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
