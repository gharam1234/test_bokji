/**
 * useBookmark 훅
 * 북마크 상태 관리
 */

import { useState, useCallback } from 'react';
import { recommendationApi } from '../api';

/** useBookmark 반환 타입 */
export interface UseBookmarkReturn {
  /** 북마크 여부 */
  isBookmarked: boolean;
  /** 로딩 상태 */
  isLoading: boolean;
  /** 토글 함수 */
  toggle: () => Promise<void>;
}

/**
 * 북마크 상태를 관리하는 커스텀 훅
 *
 * @example
 * ```tsx
 * const { isBookmarked, isLoading, toggle } = useBookmark('program-id', false);
 * ```
 */
export function useBookmark(
  programId: string,
  initialState = false,
): UseBookmarkReturn {
  const [isBookmarked, setIsBookmarked] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * 북마크 토글
   */
  const toggle = useCallback(async () => {
    setIsLoading(true);

    try {
      const result = await recommendationApi.toggleBookmark(programId);
      setIsBookmarked(result.isBookmarked);
    } catch (err) {
      console.error('Toggle bookmark error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [programId]);

  return {
    isBookmarked,
    isLoading,
    toggle,
  };
}
