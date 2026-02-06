/**
 * 검색 기능 타입 정의
 */

// ============================================
// 검색 핵심 타입
// ============================================

/**
 * 복지 카테고리
 */
export type WelfareCategory =
  | 'employment'   // 취업·창업
  | 'housing'      // 주거·금융
  | 'education'    // 교육
  | 'healthcare'   // 건강·의료
  | 'childcare'    // 임신·육아
  | 'culture'      // 문화·생활
  | 'safety'       // 안전·환경
  | 'other';       // 기타

/**
 * 정렬 옵션
 */
export type SearchSortOption =
  | 'relevance'    // 관련도순 (기본)
  | 'deadline'     // 마감일순
  | 'latest'       // 최신순
  | 'popular';     // 인기순 (조회수)

/**
 * 자격 조건 정보
 */
export interface EligibilityInfo {
  ageRange?: { min?: number; max?: number };
  incomeLevel?: string;
  targetGroups?: string[];
  region?: string[];
  conditions?: string[];
}

/**
 * 복지 프로그램 검색 결과 아이템
 */
export interface WelfareProgram {
  id: string;
  name: string;
  summary: string;
  description: string;
  category: WelfareCategory;
  categoryLabel: string;
  organization: string;
  regionCode: string;
  regionName: string;
  eligibility: EligibilityInfo;
  benefits: string;
  benefitAmount?: string;
  deadline: string | null;
  dDay: number | null;
  applicationUrl: string | null;
  viewCount: number;
  createdAt: string;
  isBookmarked: boolean;
  relevanceScore: number;
}

// ============================================
// API 요청/응답 타입
// ============================================

/**
 * 검색 파라미터
 */
export interface SearchParams {
  keyword?: string;
  category?: WelfareCategory;
  region?: string;
  sortBy?: SearchSortOption;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

/**
 * 페이지네이션 정보
 */
export interface PaginationInfo {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * 지역 정보
 */
export interface RegionInfo {
  code: string;
  name: string;
  type: 'sido' | 'sigungu' | 'all';
}

/**
 * 적용된 필터
 */
export interface AppliedFilters {
  category?: WelfareCategory;
  categoryLabel?: string;
  region?: RegionInfo;
  sortBy: SearchSortOption;
  sortOrder: 'asc' | 'desc';
}

/**
 * 검색 메타 정보
 */
export interface SearchMeta {
  keyword: string;
  appliedFilters: AppliedFilters;
  searchTime: number;
}

/**
 * 검색 결과 응답
 */
export interface SearchResponse {
  results: WelfareProgram[];
  pagination: PaginationInfo;
  meta: SearchMeta;
}

// ============================================
// 필터 옵션 타입
// ============================================

/**
 * 카테고리 옵션
 */
export interface CategoryOption {
  value: WelfareCategory;
  label: string;
  count: number;
}

/**
 * 지역 옵션
 */
export interface RegionOption {
  code: string;
  name: string;
  type: 'sido' | 'sigungu';
  parentCode?: string;
}

/**
 * 필터 옵션 응답
 */
export interface FilterOptionsResponse {
  categories: CategoryOption[];
  regions: RegionOption[];
}

// ============================================
// 자동완성 타입
// ============================================

/**
 * 자동완성 항목
 */
export interface Suggestion {
  text: string;
  type: 'program' | 'category' | 'organization';
  highlightRanges?: [number, number][];
}

/**
 * 자동완성 응답
 */
export interface SuggestionsResponse {
  suggestions: Suggestion[];
}

// ============================================
// UI 상태 타입
// ============================================

/**
 * 검색 필터 상태
 */
export interface SearchFilters {
  category: WelfareCategory | 'all';
  region: string;  // 'all' 또는 지역 코드
  sortBy: SearchSortOption;
  sortOrder: 'asc' | 'desc';
}

/**
 * 검색 페이지 상태
 */
export interface SearchPageState {
  keyword: string;
  filters: SearchFilters;
  isFilterOpen: boolean;
  viewMode: 'list' | 'grid';
}

/**
 * 검색 히스토리 항목
 */
export interface SearchHistoryItem {
  keyword: string;
  timestamp: number;
}

// ============================================
// 기본값
// ============================================

export const DEFAULT_SEARCH_FILTERS: SearchFilters = {
  category: 'all',
  region: 'all',
  sortBy: 'relevance',
  sortOrder: 'desc',
};

export const DEFAULT_SEARCH_PARAMS: SearchParams = {
  page: 1,
  limit: 20,
  sortBy: 'relevance',
  sortOrder: 'desc',
};
