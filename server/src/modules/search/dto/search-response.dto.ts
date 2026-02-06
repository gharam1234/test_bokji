/**
 * 검색 응답 DTO
 * 검색 결과 응답 형식 정의
 */

import { WelfareCategory, SearchSortOption } from './search-query.dto';

// ============================================
// 복지 프로그램 응답 DTO
// ============================================

/**
 * 자격 조건 정보
 */
export interface EligibilityInfoDto {
  ageRange?: { min?: number; max?: number };
  incomeLevel?: string;
  targetGroups?: string[];
  region?: string[];
  conditions?: string[];
}

/**
 * 혜택 정보
 */
export interface BenefitInfoDto {
  type: 'cash' | 'service' | 'voucher' | 'mixed';
  amount?: string;
  description: string;
}

/**
 * 복지 프로그램 검색 결과 항목
 */
export interface WelfareProgramDto {
  id: string;
  name: string;
  summary: string;
  description: string;
  category: WelfareCategory;
  categoryLabel: string;
  organization: string;
  regionCode: string;
  regionName: string;
  eligibility: EligibilityInfoDto;
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
// 페이지네이션 DTO
// ============================================

/**
 * 페이지네이션 정보
 */
export interface PaginationDto {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ============================================
// 필터 정보 DTO
// ============================================

/**
 * 지역 정보
 */
export interface RegionInfoDto {
  code: string;
  name: string;
  type: 'sido' | 'sigungu' | 'all';
}

/**
 * 적용된 필터 정보
 */
export interface AppliedFiltersDto {
  category?: WelfareCategory;
  categoryLabel?: string;
  region?: RegionInfoDto;
  sortBy: SearchSortOption;
  sortOrder: 'asc' | 'desc';
}

// ============================================
// 메타 정보 DTO
// ============================================

/**
 * 검색 메타 정보
 */
export interface SearchMetaDto {
  keyword: string;
  appliedFilters: AppliedFiltersDto;
  searchTime: number; // ms
}

// ============================================
// 메인 응답 DTO
// ============================================

/**
 * 검색 결과 응답 DTO
 */
export interface SearchResponseDto {
  results: WelfareProgramDto[];
  pagination: PaginationDto;
  meta: SearchMetaDto;
}

// ============================================
// 필터 옵션 응답 DTO
// ============================================

/**
 * 카테고리 옵션
 */
export interface CategoryOptionDto {
  value: WelfareCategory;
  label: string;
  count: number;
}

/**
 * 지역 옵션
 */
export interface RegionOptionDto {
  code: string;
  name: string;
  type: 'sido' | 'sigungu';
  parentCode?: string;
}

/**
 * 필터 옵션 응답
 */
export interface FilterOptionsResponseDto {
  categories: CategoryOptionDto[];
  regions: RegionOptionDto[];
}

// ============================================
// 자동완성 응답 DTO
// ============================================

/**
 * 자동완성 항목
 */
export interface SuggestionDto {
  text: string;
  type: 'program' | 'category' | 'organization';
  highlightRanges?: [number, number][];
}

/**
 * 자동완성 응답
 */
export interface SuggestionsResponseDto {
  suggestions: SuggestionDto[];
}

// ============================================
// 헬퍼 함수
// ============================================

/**
 * 카테고리 라벨 맵
 */
export const CATEGORY_LABELS: Record<WelfareCategory, string> = {
  employment: '취업·창업',
  housing: '주거·금융',
  education: '교육',
  healthcare: '건강·의료',
  childcare: '임신·육아',
  culture: '문화·생활',
  safety: '안전·환경',
  other: '기타',
};

/**
 * 시도 코드 맵
 */
export const SIDO_NAMES: Record<string, string> = {
  '11': '서울특별시',
  '26': '부산광역시',
  '27': '대구광역시',
  '28': '인천광역시',
  '29': '광주광역시',
  '30': '대전광역시',
  '31': '울산광역시',
  '36': '세종특별자치시',
  '41': '경기도',
  '42': '강원도',
  '43': '충청북도',
  '44': '충청남도',
  '45': '전라북도',
  '46': '전라남도',
  '47': '경상북도',
  '48': '경상남도',
  '50': '제주특별자치도',
  '00': '전국',
};

/**
 * D-Day 계산
 */
export function calculateDDay(deadline: Date | string | null): number | null {
  if (!deadline) return null;
  
  const deadlineDate = typeof deadline === 'string' ? new Date(deadline) : deadline;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  deadlineDate.setHours(0, 0, 0, 0);
  
  const diffTime = deadlineDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * 지역 이름 조회
 */
export function getRegionName(code: string): string {
  if (!code) return '전국';
  
  const sido = code.substring(0, 2);
  return SIDO_NAMES[sido] || '전국';
}

/**
 * 페이지네이션 계산
 */
export function createPagination(
  page: number,
  limit: number,
  totalCount: number,
): PaginationDto {
  const totalPages = Math.ceil(totalCount / limit);
  return {
    page,
    limit,
    totalCount,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}
