/**
 * 추천 API 클라이언트
 * 추천 API와 통신하는 클라이언트 함수들
 */

import {
  GetRecommendationsRequest,
  GetRecommendationsResponse,
  RefreshRecommendationsResponse,
  ViewRecordResponse,
  BookmarkToggleResponse,
  WelfareDetailResponse,
} from './recommendationApi.types';
import { CATEGORY_LABELS, WelfareCategory } from '../types';
import type {
  WelfareProgram,
  LegacyApplicationMethodItem,
  RequiredDocument,
  ContactInfo,
  RelatedProgram,
} from '../types';

// API 기본 URL
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * API 요청 헬퍼 함수
 */
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `API Error: ${response.status}`);
  }

  return response.json();
}

/**
 * 쿼리 스트링 생성 헬퍼
 */
function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

// ==================== API 함수들 ====================

/**
 * 추천 목록 조회
 * GET /api/recommendations
 */
export async function getRecommendations(
  params: GetRecommendationsRequest = {},
): Promise<GetRecommendationsResponse> {
  const queryString = buildQueryString(params);
  return fetchApi<GetRecommendationsResponse>(`/recommendations${queryString}`);
}

/**
 * 추천 결과 새로고침
 * POST /api/recommendations/refresh
 */
export async function refreshRecommendations(): Promise<RefreshRecommendationsResponse> {
  return fetchApi<RefreshRecommendationsResponse>('/recommendations/refresh', {
    method: 'POST',
  });
}

/**
 * 추천 조회 기록
 * POST /api/recommendations/:id/view
 */
export async function recordView(
  recommendationId: string,
): Promise<ViewRecordResponse> {
  return fetchApi<ViewRecordResponse>(`/recommendations/${recommendationId}/view`, {
    method: 'POST',
  });
}

/**
 * 북마크 토글
 * POST /api/recommendations/:programId/bookmark
 */
export async function toggleBookmark(
  programId: string,
): Promise<BookmarkToggleResponse> {
  return fetchApi<BookmarkToggleResponse>(`/recommendations/${programId}/bookmark`, {
    method: 'POST',
  });
}

/**
 * 복지 프로그램 상세 조회
 * GET /api/welfare-programs/:id
 */
export async function getWelfareDetail(
  programId: string,
): Promise<WelfareDetailResponse> {
  try {
    const primary = await fetchApi<WelfareDetailResponse>(`/welfare-programs/${programId}`);
    if (isMockWelfareDetail(primary)) {
      const fallback = await fetchApi<PublicWelfareDetailResponse>(`/public-welfare/${programId}`);
      return mapPublicWelfareDetail(fallback);
    }
    return primary;
  } catch (error) {
    const fallback = await fetchApi<PublicWelfareDetailResponse>(`/public-welfare/${programId}`);
    return mapPublicWelfareDetail(fallback);
  }
}

// ==================== 통합 내보내기 ====================

export const recommendationApi = {
  getRecommendations,
  refreshRecommendations,
  recordView,
  toggleBookmark,
  getWelfareDetail,
};

// ==================== Public Welfare Fallback ====================

type PublicWelfareDetailProgram = {
  id: string;
  name?: string;
  summary?: string;
  description?: string;
  category?: WelfareCategory;
  categoryLabel?: string;
  organization?: string;
  organizationName?: string;
  eligibility?: {
    targetGroups?: string[];
    conditions?: string[];
    incomeLevel?: string | number;
    ageRange?: { min?: number; max?: number };
    region?: string[];
  };
  benefits?: string;
  benefitAmount?: string | null;
  applicationMethods?: LegacyApplicationMethodItem[];
  requiredDocuments?: Array<string | RequiredDocument>;
  contactInfo?: ContactInfo | null;
  deadline?: string | null;
  applicationUrl?: string | null;
};

type PublicWelfareDetailResponse = {
  program: PublicWelfareDetailProgram | null;
  relatedPrograms?: RelatedProgram[];
  isBookmarked?: boolean;
};

function mapPublicWelfareDetail(
  response: PublicWelfareDetailResponse,
): WelfareDetailResponse {
  if (!response.program) {
    throw new Error('복지 서비스를 찾을 수 없습니다.');
  }

  const program = response.program;
  const contactInfo = program.contactInfo || null;
  const targetGroups = program.eligibility?.targetGroups || [];
  const normalizedCategory = mapPublicCategory(program.category);
  const requiredDocuments = (program.requiredDocuments || []).map((doc) =>
    typeof doc === 'string'
      ? { name: doc, isRequired: false }
      : { isRequired: Boolean(doc.isRequired), ...doc },
  );
  const applicationMethods =
    program.applicationMethods && program.applicationMethods.length > 0
      ? program.applicationMethods
      : program.applicationUrl
        ? [
            {
              type: 'online',
              name: '온라인 신청',
              url: program.applicationUrl,
            },
          ]
        : [];

  const normalizedProgram: WelfareProgram = {
    id: program.id,
    name: program.name || '',
    description: program.description || program.summary || '',
    summary: program.summary || program.description || '',
    category: normalizedCategory,
    categoryLabel:
      program.categoryLabel ||
      CATEGORY_LABELS[normalizedCategory] ||
      '기타',
    targetGroups,
    eligibilityCriteria: undefined,
    applicationMethod: {},
    requiredDocuments,
    contactInfo,
    benefits: program.benefits || program.summary || '',
    benefitAmount: program.benefitAmount ?? null,
    applicationStartDate: null,
    applicationEndDate: program.deadline ?? null,
    isAlwaysOpen: !program.deadline,
    managingOrganization: program.organizationName || program.organization || '',
    sourceUrl: program.applicationUrl || contactInfo?.website || null,
    tags: [],
    categories: normalizedCategory ? [normalizedCategory] : undefined,
    organizationName: program.organizationName,
    organization: program.organization,
    applicationDeadline: program.deadline ?? null,
    deadline: program.deadline ?? null,
    applicationMethods,
    eligibility: program.eligibility,
  };

  return {
    program: normalizedProgram,
    matchScore: 0,
    matchReasons: [],
    isBookmarked: response.isBookmarked ?? false,
    relatedPrograms: response.relatedPrograms || [],
  };
}

function isMockWelfareDetail(response: WelfareDetailResponse): boolean {
  const program = response.program;
  if (!program) {
    return true;
  }

  const summaryText = program.summary?.trim();
  const descriptionText = program.description?.trim();
  const organizationText =
    program.organizationName ||
    program.organization ||
    program.managingOrganization ||
    '';

  const hasGenericSummary =
    summaryText === '복지 프로그램 상세 정보입니다.' ||
    descriptionText === '이 복지 프로그램에 대한 상세 설명입니다.';
  const hasGenericName = program.name?.trim() === '복지 프로그램';
  const hasGenericOrganization = organizationText === '정부기관';
  const hasNoContact =
    !program.contactInfo?.phone &&
    !program.contactInfo?.website &&
    !program.contactInfo?.email;
  const hasNoApplication =
    !program.applicationMethods?.length &&
    !program.applicationMethod?.online &&
    !program.applicationMethod?.offline &&
    !program.applicationMethod?.phone;
  const hasNoDocuments = !program.requiredDocuments?.length;

  return (
    (hasGenericName && hasGenericSummary) ||
    (hasGenericOrganization && hasNoContact && hasNoApplication && hasNoDocuments)
  );
}

function mapPublicCategory(category?: WelfareCategory | string): WelfareCategory {
  if (!category) {
    return WelfareCategory.OTHER;
  }

  if (Object.values(WelfareCategory).includes(category as WelfareCategory)) {
    return category as WelfareCategory;
  }

  switch (category) {
    case 'employment':
      return WelfareCategory.EMPLOYMENT;
    case 'housing':
      return WelfareCategory.HOUSING;
    case 'education':
      return WelfareCategory.EDUCATION;
    case 'healthcare':
      return WelfareCategory.MEDICAL;
    case 'childcare':
      return WelfareCategory.CHILDCARE;
    default:
      return WelfareCategory.OTHER;
  }
}
