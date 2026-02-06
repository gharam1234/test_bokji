/**
 * useRecommendations 훅
 * 추천 목록 조회 및 상태 관리
 */

import { useState, useEffect, useCallback } from 'react';
import { recommendationApi } from '../api';
import {
  RecommendationItem,
  CategoryCount,
  WelfareCategory,
  SortOption,
} from '../types';

/** useRecommendations 옵션 */
export interface UseRecommendationsOptions {
  /** 카테고리 필터 */
  category?: WelfareCategory;
  /** 정렬 기준 (기본: match_score) */
  sortBy?: SortOption;
  /** 초기 페이지 */
  initialPage?: number;
  /** 페이지당 개수 */
  limit?: number;
  /** 컴포넌트 마운트 시 자동 fetch */
  fetchOnMount?: boolean;
}

/** useRecommendations 반환 타입 */
export interface UseRecommendationsReturn {
  /** 추천 목록 */
  recommendations: RecommendationItem[];
  /** 카테고리별 개수 */
  categories: CategoryCount[];
  /** 전체 개수 */
  totalCount: number;
  /** 로딩 상태 */
  isLoading: boolean;
  /** 에러 객체 */
  error: Error | null;
  /** 더 불러올 데이터 있음 */
  hasMore: boolean;
  /** 현재 페이지 */
  page: number;
  
  // 액션
  /** 더 불러오기 */
  loadMore: () => void;
  /** 새로고침 */
  refresh: () => Promise<void>;
  /** 카테고리 변경 */
  setCategory: (category: WelfareCategory | undefined) => void;
  /** 정렬 변경 */
  setSortBy: (sortBy: SortOption) => void;
  /** 북마크 토글 */
  toggleBookmark: (programId: string) => Promise<void>;
}

/**
 * 추천 목록을 조회하고 관리하는 커스텀 훅
 *
 * @example
 * ```tsx
 * const {
 *   recommendations,
 *   isLoading,
 *   error,
 *   setCategory,
 *   setSortBy,
 *   loadMore,
 * } = useRecommendations({
 *   sortBy: SortOption.MATCH_SCORE,
 *   limit: 20,
 * });
 * ```
 */
export function useRecommendations(
  options: UseRecommendationsOptions = {},
): UseRecommendationsReturn {
  const {
    category: initialCategory,
    sortBy: initialSortBy = SortOption.MATCH_SCORE,
    initialPage = 1,
    limit = 20,
    fetchOnMount = true,
  } = options;

  // 상태
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [categories, setCategories] = useState<CategoryCount[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(initialPage);
  const [category, setCategory] = useState<WelfareCategory | undefined>(initialCategory);
  const [sortBy, setSortBy] = useState<SortOption>(initialSortBy);

  /**
   * 데이터 가져오기
   */
  const fetchData = useCallback(async (pageNum: number, append = false) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await recommendationApi.getRecommendations({
        category,
        sortBy,
        page: pageNum,
        limit,
      });

      if (append) {
        setRecommendations(prev => [...prev, ...response.recommendations]);
      } else {
        setRecommendations(response.recommendations);
      }

      setCategories(response.categories);
      setTotalCount(response.totalCount);
      setHasMore(response.hasMore);
      setPage(pageNum);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('데이터 로드 실패'));
      console.error('Recommendations fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [category, sortBy, limit]);

  /**
   * 더 불러오기
   */
  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      fetchData(page + 1, true);
    }
  }, [isLoading, hasMore, page, fetchData]);

  /**
   * 새로고침 (추천 재계산)
   */
  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await recommendationApi.refreshRecommendations();
      await fetchData(1, false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('새로고침 실패'));
      console.error('Recommendations refresh error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchData]);

  /**
   * 북마크 토글
   */
  const toggleBookmark = useCallback(async (programId: string) => {
    try {
      const result = await recommendationApi.toggleBookmark(programId);
      
      // 로컬 상태 업데이트
      setRecommendations(prev =>
        prev.map(rec =>
          rec.programId === programId
            ? { ...rec, isBookmarked: result.isBookmarked }
            : rec
        ),
      );
    } catch (err) {
      console.error('Toggle bookmark error:', err);
      throw err;
    }
  }, []);

  /**
   * 카테고리 변경 핸들러
   */
  const handleSetCategory = useCallback((newCategory: WelfareCategory | undefined) => {
    setCategory(newCategory);
    setPage(1);
  }, []);

  /**
   * 정렬 변경 핸들러
   */
  const handleSetSortBy = useCallback((newSortBy: SortOption) => {
    setSortBy(newSortBy);
    setPage(1);
  }, []);

  // 카테고리/정렬 변경 시 데이터 다시 가져오기
  useEffect(() => {
    if (fetchOnMount) {
      fetchData(1, false);
    }
  }, [category, sortBy]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    recommendations,
    categories,
    totalCount,
    isLoading,
    error,
    hasMore,
    page,
    loadMore,
    refresh,
    setCategory: handleSetCategory,
    setSortBy: handleSetSortBy,
    toggleBookmark,
  };
}
