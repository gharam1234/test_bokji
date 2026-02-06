/**
 * 복지 프로그램 관련 타입 정의
 */

/** 복지 프로그램 카테고리 */
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

/** 복지 프로그램 */
export interface WelfareProgram {
  id: string;
  name: string;
  description: string;
  summary: string;
  category: ProgramCategory;
  targetGroups: TargetGroup[];
  eligibilityCriteria: EligibilityCriteria;
  applicationMethod: ApplicationMethod;
  requiredDocuments: string[];
  contactInfo: ContactInfo | null;
  managingOrganization: string;
  benefits: string;
  benefitAmount: string | null;
  applicationStartDate: string | null;
  applicationEndDate: string | null;
  isAlwaysOpen: boolean;
  sourceUrl: string | null;
  tags: string[];
  viewCount: number;
  bookmarkCount: number;
  isActive: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
  deletedAt: string | null;
}

/** 프로그램 생성 요청 */
export interface CreateProgramRequest {
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

/** 프로그램 수정 요청 */
export interface UpdateProgramRequest extends Partial<CreateProgramRequest> {
  version: number;
}

/** 프로그램 목록 조회 파라미터 */
export interface ProgramListParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: ProgramCategory;
  targetGroup?: TargetGroup;
  isActive?: boolean;
  includeDeleted?: boolean;
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'viewCount';
  sortOrder?: 'asc' | 'desc';
}

/** 페이지네이션 메타 정보 */
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/** 페이지네이션 응답 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}
