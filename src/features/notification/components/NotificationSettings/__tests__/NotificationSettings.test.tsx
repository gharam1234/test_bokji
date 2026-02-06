/**
 * NotificationSettings 컴포넌트 테스트
 */

import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NotificationSettings } from '../NotificationSettings';
import { EmailDigestFrequency } from '../../../types/notification.types';
import * as useNotificationSettingsModule from '../../../hooks/useNotificationSettings';

// 훅 모킹
jest.mock('../../../hooks/useNotificationSettings');

const mockUseNotificationSettings = jest.mocked(useNotificationSettingsModule.useNotificationSettings);

describe('NotificationSettings', () => {
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

  const defaultMockReturn = {
    settings: mockSettings,
    isLoading: false,
    isUpdating: false,
    error: null,
    updateSettings: jest.fn(),
    refresh: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseNotificationSettings.mockReturnValue(defaultMockReturn as any);
  });

  describe('렌더링', () => {
    it('채널별 설정 섹션을 표시해야 한다', () => {
      render(<NotificationSettings />);

      expect(screen.getByText('알림 채널')).toBeInTheDocument();
      expect(screen.getByText('인앱 알림')).toBeInTheDocument();
      expect(screen.getByText('푸시 알림')).toBeInTheDocument();
      expect(screen.getByText('이메일 알림')).toBeInTheDocument();
    });

    it('알림 유형별 설정 섹션을 표시해야 한다', () => {
      render(<NotificationSettings />);

      expect(screen.getByText('알림 유형')).toBeInTheDocument();
      expect(screen.getByText('새 복지 프로그램')).toBeInTheDocument();
      expect(screen.getByText('마감 임박 알림')).toBeInTheDocument();
      expect(screen.getByText('맞춤 추천 알림')).toBeInTheDocument();
    });

    it('방해금지 시간 섹션을 표시해야 한다', () => {
      render(<NotificationSettings />);

      expect(screen.getByText('방해금지 시간')).toBeInTheDocument();
      expect(screen.getByText('방해금지 모드')).toBeInTheDocument();
    });

    it('이메일 활성화 시 이메일 수신 빈도 섹션을 표시해야 한다', () => {
      render(<NotificationSettings />);

      expect(screen.getByText('이메일 수신 빈도')).toBeInTheDocument();
    });

    it('이메일 비활성화 시 이메일 수신 빈도 섹션을 숨겨야 한다', () => {
      mockUseNotificationSettings.mockReturnValue({
        ...defaultMockReturn,
        settings: { ...mockSettings, emailEnabled: false },
      } as any);

      render(<NotificationSettings />);

      expect(screen.queryByText('이메일 수신 빈도')).not.toBeInTheDocument();
    });
  });

  describe('로딩 상태', () => {
    it('로딩 중일 때 스피너를 표시해야 한다', () => {
      mockUseNotificationSettings.mockReturnValue({
        ...defaultMockReturn,
        settings: null,
        isLoading: true,
      } as any);

      const { container } = render(<NotificationSettings />);

      expect(container.querySelector('.animate-spin')).toBeInTheDocument();
      expect(screen.getByText('설정을 불러오는 중...')).toBeInTheDocument();
    });
  });

  describe('채널 설정 토글', () => {
    it('인앱 알림 토글 시 updateSettings가 호출되어야 한다', async () => {
      const mockUpdateSettings = jest.fn();
      mockUseNotificationSettings.mockReturnValue({
        ...defaultMockReturn,
        updateSettings: mockUpdateSettings,
      } as any);

      render(<NotificationSettings />);

      const toggles = screen.getAllByRole('switch');
      // 인앱 알림은 첫 번째 토글
      fireEvent.click(toggles[0]);

      await waitFor(() => {
        expect(mockUpdateSettings).toHaveBeenCalledWith({ inAppEnabled: false });
      });
    });

    it('푸시 알림 토글 시 updateSettings가 호출되어야 한다', async () => {
      const mockUpdateSettings = jest.fn();
      mockUseNotificationSettings.mockReturnValue({
        ...defaultMockReturn,
        updateSettings: mockUpdateSettings,
      } as any);

      render(<NotificationSettings />);

      const toggles = screen.getAllByRole('switch');
      // 푸시 알림은 두 번째 토글
      fireEvent.click(toggles[1]);

      await waitFor(() => {
        expect(mockUpdateSettings).toHaveBeenCalledWith({ pushEnabled: false });
      });
    });

    it('이메일 알림 토글 시 updateSettings가 호출되어야 한다', async () => {
      const mockUpdateSettings = jest.fn();
      mockUseNotificationSettings.mockReturnValue({
        ...defaultMockReturn,
        updateSettings: mockUpdateSettings,
      } as any);

      render(<NotificationSettings />);

      const toggles = screen.getAllByRole('switch');
      // 이메일 알림은 세 번째 토글
      fireEvent.click(toggles[2]);

      await waitFor(() => {
        expect(mockUpdateSettings).toHaveBeenCalledWith({ emailEnabled: false });
      });
    });
  });

  describe('알림 유형 설정', () => {
    it('새 복지 프로그램 알림 토글이 작동해야 한다', async () => {
      const mockUpdateSettings = jest.fn();
      mockUseNotificationSettings.mockReturnValue({
        ...defaultMockReturn,
        updateSettings: mockUpdateSettings,
      } as any);

      render(<NotificationSettings />);

      const toggles = screen.getAllByRole('switch');
      // 새 복지 프로그램은 네 번째 토글
      fireEvent.click(toggles[3]);

      await waitFor(() => {
        expect(mockUpdateSettings).toHaveBeenCalledWith({ newWelfareEnabled: false });
      });
    });

    it('마감 임박 알림 토글이 작동해야 한다', async () => {
      const mockUpdateSettings = jest.fn();
      mockUseNotificationSettings.mockReturnValue({
        ...defaultMockReturn,
        updateSettings: mockUpdateSettings,
      } as any);

      render(<NotificationSettings />);

      const toggles = screen.getAllByRole('switch');
      fireEvent.click(toggles[4]);

      await waitFor(() => {
        expect(mockUpdateSettings).toHaveBeenCalledWith({ deadlineAlertEnabled: false });
      });
    });
  });

  describe('방해금지 시간', () => {
    it('방해금지 모드 활성화 시 시간 선택기가 표시되어야 한다', () => {
      mockUseNotificationSettings.mockReturnValue({
        ...defaultMockReturn,
        settings: {
          ...mockSettings,
          quietHoursEnabled: true,
          quietHoursStart: '22:00',
          quietHoursEnd: '08:00',
        },
      } as any);

      render(<NotificationSettings />);

      // QuietHoursPicker가 렌더링되었는지 확인
      expect(screen.getByDisplayValue('22:00')).toBeInTheDocument();
      expect(screen.getByDisplayValue('08:00')).toBeInTheDocument();
    });

    it('방해금지 모드 비활성화 시 시간 선택기가 숨겨져야 한다', () => {
      render(<NotificationSettings />);

      // 기본적으로 quietHoursEnabled가 false
      expect(screen.queryByDisplayValue('22:00')).not.toBeInTheDocument();
    });
  });

  describe('이메일 수신 빈도', () => {
    it('이메일 빈도 옵션이 표시되어야 한다', () => {
      render(<NotificationSettings />);

      expect(screen.getByLabelText(/즉시/)).toBeInTheDocument();
      expect(screen.getByLabelText(/일간 요약/)).toBeInTheDocument();
      expect(screen.getByLabelText(/주간 요약/)).toBeInTheDocument();
      expect(screen.getByLabelText(/수신 안함/)).toBeInTheDocument();
    });

    it('현재 설정된 빈도가 선택되어 있어야 한다', () => {
      render(<NotificationSettings />);

      const dailyRadio = screen.getByRole('radio', { name: /일간 요약/ });
      expect(dailyRadio).toBeChecked();
    });

    it('빈도 선택 시 updateSettings가 호출되어야 한다', async () => {
      const mockUpdateSettings = jest.fn();
      mockUseNotificationSettings.mockReturnValue({
        ...defaultMockReturn,
        updateSettings: mockUpdateSettings,
      } as any);

      render(<NotificationSettings />);

      const weeklyRadio = screen.getByRole('radio', { name: /주간 요약/ });
      fireEvent.click(weeklyRadio);

      await waitFor(() => {
        expect(mockUpdateSettings).toHaveBeenCalledWith({
          emailDigestFrequency: EmailDigestFrequency.WEEKLY,
        });
      });
    });
  });

  describe('업데이트 중 상태', () => {
    it('업데이트 중일 때 토글이 비활성화되어야 한다', () => {
      mockUseNotificationSettings.mockReturnValue({
        ...defaultMockReturn,
        isUpdating: true,
      } as any);

      render(<NotificationSettings />);

      const toggles = screen.getAllByRole('switch');
      toggles.forEach((toggle) => {
        expect(toggle).toBeDisabled();
      });
    });

    it('업데이트 중일 때 라디오 버튼이 비활성화되어야 한다', () => {
      mockUseNotificationSettings.mockReturnValue({
        ...defaultMockReturn,
        isUpdating: true,
      } as any);

      render(<NotificationSettings />);

      const radios = screen.getAllByRole('radio');
      radios.forEach((radio) => {
        expect(radio).toBeDisabled();
      });
    });
  });

  describe('스타일링', () => {
    it('className prop이 적용되어야 한다', () => {
      const { container } = render(<NotificationSettings className="custom-class" />);

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });
});
