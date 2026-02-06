/**
 * 프로그램 조회 쿼리 DTO
 * 목록 조회 시 필터, 정렬, 페이지네이션 파라미터
 */

import { ProgramCategory, TargetGroup, VALID_CATEGORIES, VALID_TARGET_GROUPS } from './create-program.dto';

/** 정렬 기준 */
export type ProgramSortBy = 'name' | 'createdAt' | 'updatedAt' | 'viewCount';

/** 정렬 순서 */
export type SortOrder = 'asc' | 'desc';

/** 프로그램 조회 쿼리 DTO */
export interface ProgramQueryDto {
  /** 페이지 번호 (1부터 시작) */
  page: number;

  /** 페이지당 항목 수 */
  limit: number;

  /** 검색어 (프로그램명, 설명 검색) */
  search?: string;

  /** 카테고리 필터 */
  category?: ProgramCategory;

  /** 대상 그룹 필터 */
  targetGroup?: TargetGroup;

  /** 활성 상태 필터 */
  isActive?: boolean;

  /** 삭제된 항목 포함 여부 */
  includeDeleted?: boolean;

  /** 정렬 기준 */
  sortBy: ProgramSortBy;

  /** 정렬 순서 */
  sortOrder: SortOrder;
}

/** 기본 쿼리 값 */
export const DEFAULT_PROGRAM_QUERY: ProgramQueryDto = {
  page: 1,
  limit: 20,
  sortBy: 'createdAt',
  sortOrder: 'desc',
  includeDeleted: false,
};

/** 프로그램 조회 쿼리 DTO 파싱 */
export function parseProgramQueryDto(query: Record<string, unknown>): ProgramQueryDto {
  const result: ProgramQueryDto = { ...DEFAULT_PROGRAM_QUERY };

  // 페이지 번호
  if (query.page !== undefined) {
    const page = parseInt(query.page as string, 10);
    if (!isNaN(page) && page >= 1) {
      result.page = page;
    }
  }

  // 페이지당 항목 수 (최소 1, 최대 100)
  if (query.limit !== undefined) {
    const limit = parseInt(query.limit as string, 10);
    if (!isNaN(limit) && limit >= 1 && limit <= 100) {
      result.limit = limit;
    }
  }

  // 검색어
  if (query.search && typeof query.search === 'string' && query.search.trim()) {
    result.search = query.search.trim();
  }

  // 카테고리 필터
  if (query.category && VALID_CATEGORIES.includes(query.category as ProgramCategory)) {
    result.category = query.category as ProgramCategory;
  }

  // 대상 그룹 필터
  if (query.targetGroup && VALID_TARGET_GROUPS.includes(query.targetGroup as TargetGroup)) {
    result.targetGroup = query.targetGroup as TargetGroup;
  }

  // 활성 상태 필터
  if (query.isActive !== undefined) {
    result.isActive = query.isActive === 'true' || query.isActive === true;
  }

  // 삭제된 항목 포함 여부
  if (query.includeDeleted !== undefined) {
    result.includeDeleted = query.includeDeleted === 'true' || query.includeDeleted === true;
  }

  // 정렬 기준
  const validSortBy: ProgramSortBy[] = ['name', 'createdAt', 'updatedAt', 'viewCount'];
  if (query.sortBy && validSortBy.includes(query.sortBy as ProgramSortBy)) {
    result.sortBy = query.sortBy as ProgramSortBy;
  }

  // 정렬 순서
  if (query.sortOrder === 'asc' || query.sortOrder === 'desc') {
    result.sortOrder = query.sortOrder;
  }

  return result;
}

/** 정렬 기준 → DB 컬럼명 변환 */
export function getSortColumn(sortBy: ProgramSortBy): string {
  const mapping: Record<ProgramSortBy, string> = {
    name: 'name',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    viewCount: 'view_count',
  };
  return mapping[sortBy] || 'created_at';
}
