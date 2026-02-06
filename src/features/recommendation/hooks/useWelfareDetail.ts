/**
 * useWelfareDetail 훅
 * 복지 프로그램 상세 정보 조회
 */

import { useState, useEffect, useCallback } from 'react';
import { recommendationApi } from '../api';
import {
  WelfareProgram,
  RelatedProgram,
  MatchReason,
} from '../types';

/** useWelfareDetail 반환 타입 */
export interface UseWelfareDetailReturn {
  /** 복지 프로그램 정보 */
  program: WelfareProgram | null;
  /** 매칭 점수 */
  matchScore: number;
  /** 매칭 이유 */
  matchReasons: MatchReason[];
  /** 북마크 여부 */
  isBookmarked: boolean;
  /** 관련 프로그램 */
  relatedPrograms: RelatedProgram[];
  /** 로딩 상태 */
  isLoading: boolean;
  /** 에러 객체 */
  error: Error | null;
  
  // 액션
  /** 북마크 토글 */
  toggleBookmark: () => Promise<void>;
  /** 다시 가져오기 */
  refetch: () => void;
}

/**
 * 복지 프로그램 상세 정보를 조회하는 커스텀 훅
 *
 * @example
 * ```tsx
 * const {
 *   program,
 *   matchScore,
 *   isLoading,
 *   toggleBookmark,
 * } = useWelfareDetail('program-id');
 * ```
 */
export function useWelfareDetail(programId: string): UseWelfareDetailReturn {
  // 상태
  const [program, setProgram] = useState<WelfareProgram | null>(null);
  const [matchScore, setMatchScore] = useState(0);
  const [matchReasons, setMatchReasons] = useState<MatchReason[]>([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [relatedPrograms, setRelatedPrograms] = useState<RelatedProgram[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * 데이터 가져오기
   */
  const fetchData = useCallback(async () => {
    if (!programId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await recommendationApi.getWelfareDetail(programId);
      
      setProgram(response.program);
      setMatchScore(response.matchScore);
      setMatchReasons(response.matchReasons);
      setIsBookmarked(response.isBookmarked);
      setRelatedPrograms(response.relatedPrograms);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('데이터 로드 실패'));
      console.error('Welfare detail fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [programId]);

  /**
   * 북마크 토글
   */
  const toggleBookmark = useCallback(async () => {
    try {
      const result = await recommendationApi.toggleBookmark(programId);
      setIsBookmarked(result.isBookmarked);
    } catch (err) {
      console.error('Toggle bookmark error:', err);
      throw err;
    }
  }, [programId]);

  /**
   * 다시 가져오기
   */
  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // 초기 로드
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    program,
    matchScore,
    matchReasons,
    isBookmarked,
    relatedPrograms,
    isLoading,
    error,
    toggleBookmark,
    refetch,
  };
}
