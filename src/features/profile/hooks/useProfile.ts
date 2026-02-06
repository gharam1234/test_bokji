/**
 * useProfile 훅
 * 프로필 데이터 조회 및 관리
 */

import { useState, useEffect, useCallback } from 'react';
import { profileApi } from '../api';
import { ProfileResponse, ProfileCompletionResponse } from '../types';

/** useProfile 옵션 */
export interface UseProfileOptions {
  /** 컴포넌트 마운트시 자동 fetch */
  fetchOnMount?: boolean;
  /** 특정 사용자 ID (관리자용) */
  userId?: string;
}

/** useProfile 반환 타입 */
export interface UseProfileReturn {
  /** 프로필 데이터 */
  profile: ProfileResponse | null;
  /** 완성도 데이터 */
  completion: ProfileCompletionResponse | null;
  /** 로딩 상태 */
  isLoading: boolean;
  /** 에러 */
  error: Error | null;
  /** 프로필 다시 가져오기 */
  refetch: () => Promise<void>;
  /** 완성도 다시 가져오기 */
  refetchCompletion: () => Promise<void>;
  /** 프로필 삭제 */
  deleteProfile: () => Promise<boolean>;
  /** 프로필 존재 여부 */
  hasProfile: boolean;
}

/**
 * 프로필 데이터를 조회하고 관리하는 커스텀 훅
 */
export function useProfile(options: UseProfileOptions = {}): UseProfileReturn {
  const { fetchOnMount = true, userId } = options;

  // 상태
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [completion, setCompletion] = useState<ProfileCompletionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * 프로필 조회
   */
  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = userId
        ? await profileApi.getProfileByUserId(userId)
        : await profileApi.getMyProfile();
      setProfile(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('프로필 조회 실패');
      // 404는 프로필이 없는 것으로 처리
      if (error.message.includes('404')) {
        setProfile(null);
      } else {
        setError(error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  /**
   * 완성도 조회
   */
  const fetchCompletion = useCallback(async () => {
    try {
      const data = await profileApi.getCompletion();
      setCompletion(data);
    } catch (err) {
      console.error('완성도 조회 실패:', err);
    }
  }, []);

  /**
   * 프로필 삭제
   */
  const handleDeleteProfile = useCallback(async (): Promise<boolean> => {
    try {
      await profileApi.deleteProfile();
      setProfile(null);
      setCompletion(null);
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('프로필 삭제 실패');
      setError(error);
      return false;
    }
  }, []);

  // 마운트시 자동 조회
  useEffect(() => {
    if (fetchOnMount) {
      fetchProfile();
      fetchCompletion();
    }
  }, [fetchOnMount, fetchProfile, fetchCompletion]);

  return {
    profile,
    completion,
    isLoading,
    error,
    refetch: fetchProfile,
    refetchCompletion: fetchCompletion,
    deleteProfile: handleDeleteProfile,
    hasProfile: profile !== null,
  };
}
