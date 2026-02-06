/**
 * 복지 프로그램 타입 정의
 */

import { WelfareCategory, MatchReason } from './recommendation.types';

// ==================== 복지 프로그램 상세 ====================

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

/** 레거시 신청 방법 (목록형 Mock 응답) */
export interface LegacyApplicationMethodItem {
  type: 'online' | 'visit' | 'phone' | 'mail' | string;
  name?: string;
  description?: string;
  url?: string;
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

/** 지역 코드 */
export interface RegionCode {
  sido: string;
  sigungu?: string;
}

/** 특수 조건 */
export interface SpecialCondition {
  key: string;
  label: string;
  value: boolean | string | number;
  isRequired: boolean;
  bonusScore?: number;
}

/** 자격 조건 */
export interface EligibilityCriteria {
  ageMin?: number | null;
  ageMax?: number | null;
  incomeLevels?: Array<number | string>;
  regions?: RegionCode[];
  householdTypes?: string[];
  specialConditions?: SpecialCondition[];
}

/** 레거시 자격 조건 (Mock 응답) */
export interface LegacyEligibility {
  ageRange?: { min?: number; max?: number };
  incomeLevel?: string | number;
  targetGroups?: string[];
  region?: string[];
  conditions?: string[];
}

/** 복지 프로그램 상세 */
export interface WelfareProgram {
  id: string;
  name: string;
  description: string;
  summary: string;
  category: WelfareCategory;
  categoryLabel: string;
  targetGroups: string[];
  eligibilityCriteria?: EligibilityCriteria;
  applicationMethod: ApplicationMethod;
  requiredDocuments: RequiredDocument[];
  contactInfo: ContactInfo | null;
  benefits: string;
  benefitAmount?: string | null;
  applicationStartDate?: string | null;
  applicationEndDate?: string | null;
  isAlwaysOpen: boolean;
  managingOrganization: string;
  sourceUrl?: string | null;
  tags: string[];
  // ==================== 레거시/Mock 호환 필드 ====================
  categories?: WelfareCategory[];
  organizationName?: string;
  organization?: string;
  applicationDeadline?: string | null;
  deadline?: string | null;
  applicationMethods?: LegacyApplicationMethodItem[];
  eligibility?: LegacyEligibility;
}

/** 관련 복지 프로그램 */
export interface RelatedProgram {
  id: string;
  name: string;
  category: WelfareCategory;
  categoryLabel: string;
  matchScore: number;
}

/** 복지 상세 응답 */
export interface WelfareDetailResponse {
  program: WelfareProgram;
  matchScore: number;
  matchReasons: MatchReason[];
  isBookmarked: boolean;
  relatedPrograms: RelatedProgram[];
}
