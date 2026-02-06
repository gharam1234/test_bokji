/**
 * 검색 헬퍼 유틸리티
 */

import type { WelfareProgram, SearchParams, SearchFilters } from '../types';

/**
 * D-Day 텍스트 포맷팅
 */
export function formatDDay(dDay: number | null): string {
  if (dDay === null) return '상시';
  if (dDay < 0) return '마감';
  if (dDay === 0) return 'D-Day';
  return `D-${dDay}`;
}

/**
 * D-Day CSS 클래스
 */
export function getDDayClassName(dDay: number | null): string {
  if (dDay === null) return 'text-gray-500';
  if (dDay < 0) return 'text-gray-400';
  if (dDay <= 7) return 'text-red-500 font-semibold';
  if (dDay <= 14) return 'text-orange-500';
  return 'text-green-500';
}

/**
 * 검색어 하이라이트
 */
export function highlightKeyword(text: string, keyword: string): string {
  if (!keyword) return text;
  
  const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedKeyword})`, 'gi');
  return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
}

/**
 * 조회수 포맷팅
 */
export function formatViewCount(count: number): string {
  if (count >= 10000) {
    return `${(count / 10000).toFixed(1)}만`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}천`;
  }
  return count.toLocaleString();
}

/**
 * 검색 파라미터 유효성 검사
 */
export function isValidSearchParams(params: Partial<SearchParams>): boolean {
  if (params.page !== undefined && (params.page < 1 || !Number.isInteger(params.page))) {
    return false;
  }
  if (params.limit !== undefined && (params.limit < 1 || params.limit > 100)) {
    return false;
  }
  return true;
}

/**
 * 검색 결과 요약 텍스트
 */
export function getSearchResultSummary(
  totalCount: number,
  keyword: string,
  filters: SearchFilters,
): string {
  let summary = `총 ${totalCount.toLocaleString()}건`;
  
  if (keyword) {
    summary += ` (검색어: ${keyword})`;
  }
  
  return summary;
}

/**
 * 빈 검색 결과 메시지
 */
export function getEmptyResultMessage(keyword: string): string {
  if (keyword) {
    return `'${keyword}'에 대한 검색 결과가 없습니다.`;
  }
  return '검색 결과가 없습니다.';
}

/**
 * 적용된 필터 개수
 */
export function countAppliedFilters(filters: SearchFilters): number {
  let count = 0;
  if (filters.category !== 'all') count++;
  if (filters.region !== 'all') count++;
  return count;
}

/**
 * 복지 프로그램 정렬
 */
export function sortPrograms(
  programs: WelfareProgram[],
  sortBy: string,
  sortOrder: 'asc' | 'desc',
): WelfareProgram[] {
  const multiplier = sortOrder === 'asc' ? 1 : -1;

  return [...programs].sort((a, b) => {
    switch (sortBy) {
      case 'relevance':
        return (b.relevanceScore - a.relevanceScore) * multiplier;
      
      case 'deadline':
        if (a.dDay === null && b.dDay === null) return 0;
        if (a.dDay === null) return 1;
        if (b.dDay === null) return -1;
        return (a.dDay - b.dDay) * multiplier;
      
      case 'latest':
        return (
          (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) *
          multiplier
        );
      
      case 'popular':
        return (b.viewCount - a.viewCount) * multiplier;
      
      default:
        return 0;
    }
  });
}
