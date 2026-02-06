/**
 * 프로그램 생성 DTO
 * 복지 프로그램 생성 요청 데이터 검증
 */

/** 프로그램 카테고리 */
export type ProgramCategory =
  | 'employment'
  | 'housing'
  | 'education'
  | 'healthcare'
  | 'childcare'
  | 'welfare'
  | 'culture'
  | 'other';

/** 대상 그룹 */
export type TargetGroup =
  | 'youth'
  | 'elderly'
  | 'disabled'
  | 'low_income'
  | 'single_parent'
  | 'veteran'
  | 'multicultural'
  | 'all';

/** 유효한 카테고리 목록 */
export const VALID_CATEGORIES: ProgramCategory[] = [
  'employment',
  'housing',
  'education',
  'healthcare',
  'childcare',
  'welfare',
  'culture',
  'other',
];

/** 유효한 대상 그룹 목록 */
export const VALID_TARGET_GROUPS: TargetGroup[] = [
  'youth',
  'elderly',
  'disabled',
  'low_income',
  'single_parent',
  'veteran',
  'multicultural',
  'all',
];

/** 자격 조건 */
export interface EligibilityCriteria {
  minAge?: number;
  maxAge?: number;
  incomeLevel?: 'low' | 'medium' | 'all';
  maxIncomePercentile?: number;
  residenceRequirement?: string;
  employmentStatus?: string[];
  additionalConditions?: string[];
}

/** 신청 방법 */
export interface ApplicationMethod {
  online?: {
    url: string;
    description?: string;
  };
  offline?: {
    address: string;
    hours?: string;
  };
  phone?: {
    number: string;
    hours?: string;
  };
  documents?: string[];
}

/** 연락처 정보 */
export interface ContactInfo {
  phone?: string;
  email?: string;
  website?: string;
}

/** 프로그램 생성 DTO */
export interface CreateProgramDto {
  name: string;
  description: string;
  summary: string;
  category: ProgramCategory;
  targetGroups: TargetGroup[];
  eligibilityCriteria: EligibilityCriteria;
  applicationMethod: ApplicationMethod;
  requiredDocuments?: string[];
  contactInfo?: ContactInfo | null;
  managingOrganization: string;
  benefits: string;
  benefitAmount?: string | null;
  applicationStartDate?: string | null;
  applicationEndDate?: string | null;
  isAlwaysOpen?: boolean;
  sourceUrl?: string | null;
  tags?: string[];
  isActive?: boolean;
}

/** 프로그램 생성 DTO 유효성 검사 */
export function validateCreateProgramDto(data: unknown): CreateProgramDto {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid request body');
  }

  const dto = data as Record<string, unknown>;

  // 필수 필드 검증
  if (!dto.name || typeof dto.name !== 'string' || dto.name.trim().length < 2) {
    throw new Error('프로그램명은 최소 2자 이상이어야 합니다.');
  }

  if (!dto.description || typeof dto.description !== 'string' || dto.description.trim().length < 10) {
    throw new Error('상세 설명은 최소 10자 이상이어야 합니다.');
  }

  if (!dto.summary || typeof dto.summary !== 'string' || dto.summary.trim().length < 5) {
    throw new Error('요약 설명은 최소 5자 이상이어야 합니다.');
  }

  // 카테고리 검증
  if (!dto.category || !VALID_CATEGORIES.includes(dto.category as ProgramCategory)) {
    throw new Error(`유효하지 않은 카테고리입니다. 유효한 값: ${VALID_CATEGORIES.join(', ')}`);
  }

  // 대상 그룹 검증
  if (!dto.targetGroups || !Array.isArray(dto.targetGroups) || dto.targetGroups.length === 0) {
    throw new Error('최소 하나의 대상 그룹을 선택해야 합니다.');
  }
  for (const group of dto.targetGroups) {
    if (!VALID_TARGET_GROUPS.includes(group as TargetGroup)) {
      throw new Error(`유효하지 않은 대상 그룹입니다: ${group}`);
    }
  }

  // 자격 조건 검증
  if (!dto.eligibilityCriteria || typeof dto.eligibilityCriteria !== 'object') {
    throw new Error('자격 조건 정보가 필요합니다.');
  }

  // 신청 방법 검증
  if (!dto.applicationMethod || typeof dto.applicationMethod !== 'object') {
    throw new Error('신청 방법 정보가 필요합니다.');
  }

  // 관리 기관 검증
  if (!dto.managingOrganization || typeof dto.managingOrganization !== 'string') {
    throw new Error('관리 기관 정보가 필요합니다.');
  }

  // 혜택 검증
  if (!dto.benefits || typeof dto.benefits !== 'string') {
    throw new Error('혜택 정보가 필요합니다.');
  }

  return {
    name: (dto.name as string).trim(),
    description: (dto.description as string).trim(),
    summary: (dto.summary as string).trim(),
    category: dto.category as ProgramCategory,
    targetGroups: dto.targetGroups as TargetGroup[],
    eligibilityCriteria: dto.eligibilityCriteria as EligibilityCriteria,
    applicationMethod: dto.applicationMethod as ApplicationMethod,
    requiredDocuments: (dto.requiredDocuments as string[]) ?? [],
    contactInfo: (dto.contactInfo as ContactInfo) ?? null,
    managingOrganization: (dto.managingOrganization as string).trim(),
    benefits: (dto.benefits as string).trim(),
    benefitAmount: (dto.benefitAmount as string) ?? null,
    applicationStartDate: (dto.applicationStartDate as string) ?? null,
    applicationEndDate: (dto.applicationEndDate as string) ?? null,
    isAlwaysOpen: (dto.isAlwaysOpen as boolean) ?? false,
    sourceUrl: (dto.sourceUrl as string) ?? null,
    tags: (dto.tags as string[]) ?? [],
    isActive: (dto.isActive as boolean) ?? true,
  };
}
