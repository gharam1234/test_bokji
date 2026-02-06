/**
 * 알림 설정 훅
 * 알림 설정 조회 및 업데이트 기능
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { getSettings, updateSettings } from '../api/notificationApi';
import { NotificationSetting, UpdateSettingsRequest } from '../types/notification.types';

/**
 * 알림 설정 쿼리 키
 */
export const notificationSettingsQueryKey = ['notificationSettings'] as const;

/**
 * 알림 설정 훅 반환 타입
 */
export interface UseNotificationSettingsReturn {
  /** 알림 설정 */
  settings: NotificationSetting | null;
  /** 로딩 상태 */
  isLoading: boolean;
  /** 업데이트 중 여부 */
  isUpdating: boolean;
  /** 에러 */
  error: Error | null;
  /** 설정 업데이트 */
  updateSettings: (updates: UpdateSettingsRequest) => Promise<void>;
  /** 새로고침 */
  refresh: () => void;
}

/**
 * 알림 설정 훅
 */
export function useNotificationSettings(): UseNotificationSettingsReturn {
  const queryClient = useQueryClient();

  // 설정 조회 쿼리
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: notificationSettingsQueryKey,
    queryFn: async () => {
      const response = await getSettings();
      return response.settings;
    },
    staleTime: 5 * 60 * 1000, // 5분 동안 데이터 유지
  });

  // 설정 업데이트 뮤테이션
  const updateMutation = useMutation({
    mutationFn: (updates: UpdateSettingsRequest) => updateSettings(updates),
    onMutate: async (updates) => {
      // 낙관적 업데이트
      await queryClient.cancelQueries({ queryKey: notificationSettingsQueryKey });
      const previousSettings = queryClient.getQueryData<NotificationSetting>(
        notificationSettingsQueryKey,
      );

      if (previousSettings) {
        queryClient.setQueryData<NotificationSetting>(notificationSettingsQueryKey, {
          ...previousSettings,
          ...updates,
          updatedAt: new Date().toISOString(),
        });
      }

      return { previousSettings };
    },
    onError: (err, variables, context) => {
      // 에러 시 롤백
      if (context?.previousSettings) {
        queryClient.setQueryData(notificationSettingsQueryKey, context.previousSettings);
      }
    },
    onSettled: () => {
      // 완료 시 캐시 무효화
      queryClient.invalidateQueries({ queryKey: notificationSettingsQueryKey });
    },
  });

  // 설정 업데이트 핸들러
  const handleUpdateSettings = useCallback(
    async (updates: UpdateSettingsRequest) => {
      await updateMutation.mutateAsync(updates);
    },
    [updateMutation],
  );

  return {
    settings: data ?? null,
    isLoading,
    isUpdating: updateMutation.isPending,
    error: error as Error | null,
    updateSettings: handleUpdateSettings,
    refresh: refetch,
  };
}
