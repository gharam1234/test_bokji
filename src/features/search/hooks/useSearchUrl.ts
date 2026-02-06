/**
 * useSearchUrl Hook
 * URL 상태 동기화 관리
 */

import { useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import type { SearchParams } from '../types';
import { DEFAULT_SEARCH_PARAMS } from '../types';
import {
  parseSearchParamsFromUrl,
  buildSearchQueryString,
  createShareUrl,
} from '../utils/urlHelpers';

/**
 * useSearchUrl 반환 타입
 */
export interface UseSearchUrlReturn {
  // URL 파라미터
  urlParams: SearchParams;
  
  // URL 업데이트
  setUrlParams: (params: SearchParams) => void;
  updateUrlParams: (params: Partial<SearchParams>) => void;
  resetUrlParams: () => void;
  
  // 유틸리티
  getShareUrl: () => string;
  copyShareUrl: () => Promise<boolean>;
}

/**
 * useSearchUrl Hook
 */
export function useSearchUrl(): UseSearchUrlReturn {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  // URL에서 파라미터 파싱
  const urlParams = useMemo(() => {
    return parseSearchParamsFromUrl(searchParams);
  }, [searchParams]);

  // URL 파라미터 설정
  const setUrlParams = useCallback(
    (params: SearchParams) => {
      const queryString = buildSearchQueryString(params);
      navigate(`/search${queryString}`, { replace: true });
    },
    [navigate],
  );

  // URL 파라미터 부분 업데이트
  const updateUrlParams = useCallback(
    (params: Partial<SearchParams>) => {
      const newParams = { ...urlParams, ...params };
      setUrlParams(newParams);
    },
    [urlParams, setUrlParams],
  );

  // URL 파라미터 초기화
  const resetUrlParams = useCallback(() => {
    setUrlParams(DEFAULT_SEARCH_PARAMS);
  }, [setUrlParams]);

  // 공유 URL 생성
  const getShareUrl = useCallback(() => {
    return createShareUrl(urlParams);
  }, [urlParams]);

  // 공유 URL 클립보드 복사
  const copyShareUrl = useCallback(async (): Promise<boolean> => {
    try {
      const url = getShareUrl();
      await navigator.clipboard.writeText(url);
      return true;
    } catch (error) {
      console.error('Failed to copy URL:', error);
      return false;
    }
  }, [getShareUrl]);

  return {
    urlParams,
    setUrlParams,
    updateUrlParams,
    resetUrlParams,
    getShareUrl,
    copyShareUrl,
  };
}
