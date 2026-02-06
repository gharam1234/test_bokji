/**
 * useNotificationSettings 훅 테스트
 */

import '@testing-library/jest-dom';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useNotificationSettings } from '../useNotificationSettings';
import * as notificationApi from '../../api/notificationApi';
import { EmailDigestFrequency } from '../../types/notification.types';

// API 모킹
jest.mock('../../api/notificationApi');

const mockNotificationApi = jest.mocked(notificationApi);

describe('useNotificationSettings', () => {
  let queryClient: QueryClient;

  const mockSettings = {
    id: 'setting-1',
    userId: 'user-1',
    inAppEnabled: true,
    pushEnabled: true,
    emailEnabled: true,
    newWelfareEnabled: true,
    deadlineAlertEnabled: true,
    recommendationEnabled: true,
    quietHoursEnabled: false,
    quietHoursStart: null,
    quietHoursEnd: null,
    emailDigestFrequency: EmailDigestFrequency.DAILY,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const createWrapper = () => {
    return ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    jest.clearAllMocks();

    // 기본 모킹 설정
    mockNotificationApi.getSettings.mockResolvedValue({ settings: mockSettings });
    mockNotificationApi.updateSettings.mockResolvedValue({
      success: true,
      settings: mockSettings,
    });
  });

  afterEach(() => {
    queryClient.clear();
  });

  describe('설정 조회', () => {
    it('알림 설정을 성공적으로 조회해야 한다', async () => {
      const { result } = renderHook(() => useNotificationSettings(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.settings).toEqual(mockSettings);
    });

    it('로딩 상태를 올바르게 반환해야 한다', async () => {
      const { result } = renderHook(() => useNotificationSettings(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('에러 상태를 올바르게 반환해야 한다', async () => {
      const error = new Error('설정을 불러올 수 없습니다');
      mockNotificationApi.getSettings.mockRejectedValue(error);

      const { result } = renderHook(() => useNotificationSettings(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      expect(result.current.error?.message).toBe('설정을 불러올 수 없습니다');
    });

    it('설정이 없으면 null을 반환해야 한다', async () => {
      mockNotificationApi.getSettings.mockResolvedValue({ settings: null });

      const { result } = renderHook(() => useNotificationSettings(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.settings).toBeNull();
    });
  });

  describe('설정 업데이트', () => {
    it('단일 설정을 업데이트해야 한다', async () => {
      const updatedSettings = { ...mockSettings, pushEnabled: false };
      mockNotificationApi.updateSettings.mockResolvedValue({
        success: true,
        settings: updatedSettings,
      });

      const { result } = renderHook(() => useNotificationSettings(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.updateSettings({ pushEnabled: false });
      });

      expect(mockNotificationApi.updateSettings).toHaveBeenCalledWith({ pushEnabled: false });
    });

    it('여러 설정을 동시에 업데이트해야 한다', async () => {
      const { result } = renderHook(() => useNotificationSettings(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const updates = {
        pushEnabled: false,
        emailEnabled: false,
        quietHoursEnabled: true,
        quietHoursStart: '22:00',
        quietHoursEnd: '08:00',
      };

      await act(async () => {
        await result.current.updateSettings(updates);
      });

      expect(mockNotificationApi.updateSettings).toHaveBeenCalledWith(updates);
    });

    it('업데이트 중 상태를 올바르게 반환해야 한다', async () => {
      let resolveUpdate: (value: any) => void;
      mockNotificationApi.updateSettings.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveUpdate = resolve;
          }),
      );

      const { result } = renderHook(() => useNotificationSettings(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.updateSettings({ pushEnabled: false });
      });

      await waitFor(() => {
        expect(result.current.isUpdating).toBe(true);
      });

      await act(async () => {
        resolveUpdate!({ success: true, settings: mockSettings });
      });

      await waitFor(() => {
        expect(result.current.isUpdating).toBe(false);
      });
    });

    it('업데이트 실패 시 에러를 처리해야 한다', async () => {
      const error = new Error('업데이트 실패');
      mockNotificationApi.updateSettings.mockRejectedValue(error);

      const { result } = renderHook(() => useNotificationSettings(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        try {
          await result.current.updateSettings({ pushEnabled: false });
        } catch (e) {
          // 에러 예상됨
        }
      });

      expect(mockNotificationApi.updateSettings).toHaveBeenCalled();
    });

    it('낙관적 업데이트가 적용되어야 한다', async () => {
      let resolveUpdate: (value: any) => void;
      mockNotificationApi.updateSettings.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveUpdate = resolve;
          }),
      );

      const { result } = renderHook(() => useNotificationSettings(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.settings?.pushEnabled).toBe(true);
      });

      act(() => {
        result.current.updateSettings({ pushEnabled: false });
      });

      // 낙관적 업데이트로 즉시 반영
      await waitFor(() => {
        expect(result.current.settings?.pushEnabled).toBe(false);
      });

      await act(async () => {
        resolveUpdate!({ success: true, settings: { ...mockSettings, pushEnabled: false } });
      });
    });

    it('업데이트 실패 시 롤백되어야 한다', async () => {
      mockNotificationApi.updateSettings.mockRejectedValue(new Error('업데이트 실패'));

      const { result } = renderHook(() => useNotificationSettings(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.settings?.pushEnabled).toBe(true);
      });

      await act(async () => {
        try {
          await result.current.updateSettings({ pushEnabled: false });
        } catch (e) {
          // 에러 예상됨
        }
      });

      // 롤백되어 원래 값으로 복원
      await waitFor(() => {
        expect(result.current.settings?.pushEnabled).toBe(true);
      });
    });
  });

  describe('방해금지 시간 설정', () => {
    it('방해금지 시간을 활성화해야 한다', async () => {
      const { result } = renderHook(() => useNotificationSettings(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.updateSettings({
          quietHoursEnabled: true,
          quietHoursStart: '22:00',
          quietHoursEnd: '07:00',
        });
      });

      expect(mockNotificationApi.updateSettings).toHaveBeenCalledWith({
        quietHoursEnabled: true,
        quietHoursStart: '22:00',
        quietHoursEnd: '07:00',
      });
    });

    it('방해금지 시간을 비활성화해야 한다', async () => {
      const { result } = renderHook(() => useNotificationSettings(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.updateSettings({ quietHoursEnabled: false });
      });

      expect(mockNotificationApi.updateSettings).toHaveBeenCalledWith({
        quietHoursEnabled: false,
      });
    });
  });

  describe('이메일 빈도 설정', () => {
    it.each([
      EmailDigestFrequency.REALTIME,
      EmailDigestFrequency.DAILY,
      EmailDigestFrequency.WEEKLY,
      EmailDigestFrequency.NONE,
    ])('이메일 빈도를 %s로 설정해야 한다', async (frequency) => {
      const { result } = renderHook(() => useNotificationSettings(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.updateSettings({ emailDigestFrequency: frequency });
      });

      expect(mockNotificationApi.updateSettings).toHaveBeenCalledWith({
        emailDigestFrequency: frequency,
      });
    });
  });

  describe('새로고침', () => {
    it('설정을 새로고침해야 한다', async () => {
      const { result } = renderHook(() => useNotificationSettings(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        result.current.refresh();
      });

      // 초기 로드 + 새로고침
      await waitFor(() => {
        expect(mockNotificationApi.getSettings).toHaveBeenCalledTimes(2);
      });
    });
  });
});
