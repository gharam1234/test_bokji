/**
 * 즐겨찾기 타입 정의
 * 즐겨찾기 관련 TypeScript 타입
 */

// ============================================
// 즐겨찾기 핵심 타입
// ============================================

/**
 * 즐겨찾기 카테고리
 */
export type FavoriteCategory =
  | 'employment' // 취업·창업
  | 'housing' // 주거·금융
  | 'education' // 교육
  | 'healthcare' // 건강·의료
  | 'childcare' // 임신·육아
  | 'culture' // 문화·생활
  | 'safety' // 안전·환경
  | 'other'; // 기타

/**
 * 매칭 영향도
 */
export type MatchImpact = 'high' | 'medium' | 'low';

/**
 * 매칭 사유
 */
export interface MatchReason {
  /** 필드명 */
  field: string;
  /** 설명 */
  description: string;
  /** 영향도 */
  impact: MatchImpact;
}

/**
 * 즐겨찾기 아이템 (조회용)
 */
export interface Favorite {
  /** 추천 ID (즐겨찾기 ID) */
  id: string;
  /** 복지 프로그램 ID */
  programId: string;
  /** 프로그램명 */
  programName: string;
  /** 프로그램 요약 */
  programSummary: string;
  /** 카테고리 */
  category: FavoriteCategory;
  /** 매칭 점수 (0-100) */
  matchScore: number;
  /** 매칭 사유 목록 */
  matchReasons: MatchReason[];
  /** 신청 마감일 (ISO 날짜 문자열) */
  deadline: string | null;
  /** 즐겨찾기 추가 시간 (ISO 문자열) */
  bookmarkedAt: string;
  /** 마감일까지 남은 일수 (null: 마감일 없음) */
  daysUntilDeadline: number | null;
  /** 마감 임박 여부 (7일 이내) */
  isDeadlineNear: boolean;
}

// ============================================
// API 요청/응답 타입
// ============================================

/**
 * 정렬 옵션
 */
export type FavoriteSortOption =
  | 'bookmarkedAt' // 저장일순 (기본)
  | 'deadline' // 마감일순
  | 'matchScore' // 매칭률순
  | 'programName'; // 이름순

/**
 * 정렬 순서
 */
export type SortOrder = 'asc' | 'desc';

/**
 * 즐겨찾기 목록 조회 파라미터
 */
export interface GetFavoritesParams {
  /** 카테고리 필터 */
  category?: FavoriteCategory;
  /** 정렬 기준 */
  sortBy?: FavoriteSortOption;
  /** 정렬 순서 */
  sortOrder?: SortOrder;
  /** 검색어 */
  search?: string;
  /** 페이지 번호 */
  page?: number;
  /** 페이지 크기 */
  limit?: number;
  /** N일 이내 마감 필터 */
  deadlineWithin?: number;
}

/**
 * 페이지네이션 정보
 */
export interface PaginationInfo {
  /** 현재 페이지 */
  page: number;
  /** 페이지 크기 */
  limit: number;
  /** 총 아이템 수 */
  totalCount: number;
  /** 총 페이지 수 */
  totalPages: number;
  /** 다음 페이지 존재 여부 */
  hasNext: boolean;
  /** 이전 페이지 존재 여부 */
  hasPrev: boolean;
}

/**
 * 카테고리별 개수
 */
export interface CategoryCount {
  /** 카테고리 코드 */
  category: FavoriteCategory;
  /** 개수 */
  count: number;
  /** 카테고리 라벨 */
  label: string;
}

/**
 * 즐겨찾기 목록 메타 정보
 */
export interface FavoritesMeta {
  /** 카테고리별 개수 */
  categories: CategoryCount[];
  /** 7일 이내 마감 수 */
  upcomingDeadlines: number;
}

/**
 * 즐겨찾기 목록 응답
 */
export interface GetFavoritesResponse {
  /** 즐겨찾기 목록 */
  favorites: Favorite[];
  /** 페이지네이션 정보 */
  pagination: PaginationInfo;
  /** 메타 정보 */
  meta: FavoritesMeta;
}

/**
 * 일괄 삭제 요청
 */
export interface BulkDeleteRequest {
  /** 삭제할 ID 배열 */
  ids: string[];
}

/**
 * 일괄 삭제 결과
 */
export interface BulkDeleteResult {
  /** 삭제된 개수 */
  deletedCount: number;
  /** 삭제 실패한 ID 목록 */
  failedIds: string[];
}

/**
 * 즐겨찾기 통계 응답
 */
export interface FavoritesStatsResponse {
  /** 총 즐겨찾기 수 */
  total: number;
  /** 카테고리별 개수 */
  byCategory: CategoryCount[];
  /** 마감 임박 통계 */
  upcomingDeadlines: {
    /** 7일 이내 마감 */
    within7Days: number;
    /** 30일 이내 마감 */
    within30Days: number;
  };
  /** 평균 매칭 점수 */
  averageMatchScore: number;
}

// ============================================
// UI 상태 타입
// ============================================

/**
 * 즐겨찾기 페이지 상태
 */
export interface FavoritesPageState {
  /** 선택된 ID Set */
  selectedIds: Set<string>;
  /** 선택 모드 활성화 여부 */
  isSelectionMode: boolean;
  /** 활성 필터 */
  activeFilters: GetFavoritesParams;
  /** 뷰 모드 */
  viewMode: 'grid' | 'list';
}

/**
 * 필터 UI 상태
 */
export interface FilterState {
  /** 선택된 카테고리 */
  category: FavoriteCategory | 'all';
  /** 정렬 기준 */
  sortBy: FavoriteSortOption;
  /** 정렬 순서 */
  sortOrder: SortOrder;
  /** 검색어 */
  search: string;
  /** 마감 임박만 표시 */
  showDeadlineOnly: boolean;
}
