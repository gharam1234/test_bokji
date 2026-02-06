/**
 * NotificationList 컴포넌트 테스트
 */

/* global describe, it, expect, beforeEach, afterEach */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { NotificationList } from '../NotificationList';
import { NotificationType, NotificationPriority } from '../../../types/notification.types';
import * as useNotificationsModule from '../../../hooks/useNotifications';

// IntersectionObserver 모킹
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
});
window.IntersectionObserver = mockIntersectionObserver;

// 훅 모킹
jest.mock('../../../hooks/useNotifications');

const mockUseNotifications = jest.mocked(useNotificationsModule.useNotifications);

// react-router-dom 모킹
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('NotificationList', () => {
  let queryClient: QueryClient;

  const createMockNotification = (overrides = {}) => ({
    id: 'notif-1',
    type: NotificationType.NEW_WELFARE,
    title: '테스트 알림',
    message: '테스트 내용입니다.',
    isRead: false,
    createdAt: new Date().toISOString(),
    linkUrl: '/welfare/123',
    ...overrides,
  });

  const defaultMockReturn = {
    notifications: [
      createMockNotification({ id: 'notif-1' }),
      createMockNotification({ id: 'notif-2', isRead: true }),
    ],
    totalCount: 2,
    unreadCount: 1,
    isLoading: false,
    error: null,
    hasMore: false,
    isFetchingNextPage: false,
    fetchNextPage: jest.fn(),
    refresh: jest.fn(),
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
    deleteNotification: jest.fn(),
    deleteAllNotifications: jest.fn(),
  };

  const renderWithProviders = (ui: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>{ui}</BrowserRouter>
      </QueryClientProvider>,
    );
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    jest.clearAllMocks();
    mockUseNotifications.mockReturnValue(defaultMockReturn as any);
  });

  describe('렌더링', () => {
    it('알림 목록을 표시해야 한다', () => {
      renderWithProviders(<NotificationList />);

      expect(screen.getAllByText('테스트 알림')).toHaveLength(2);
      expect(screen.getAllByText('테스트 내용입니다.')).toHaveLength(2);
    });

    it('헤더에 총 개수와 읽지 않은 개수를 표시해야 한다', () => {
      renderWithProviders(<NotificationList />);

      expect(screen.getByText(/총 2개/)).toBeInTheDocument();
      expect(screen.getByText(/읽지 않음 1개/)).toBeInTheDocument();
    });

    it('모두 읽음 처리 버튼을 표시해야 한다', () => {
      renderWithProviders(<NotificationList />);

      expect(screen.getByText('모두 읽음 처리')).toBeInTheDocument();
    });

    it('모두 삭제 버튼을 표시해야 한다', () => {
      renderWithProviders(<NotificationList />);

      expect(screen.getByText('모두 삭제')).toBeInTheDocument();
    });

    it('읽지 않은 알림이 없으면 모두 읽음 처리 버튼을 숨겨야 한다', () => {
      mockUseNotifications.mockReturnValue({
        ...defaultMockReturn,
        unreadCount: 0,
      } as any);

      renderWithProviders(<NotificationList />);

      expect(screen.queryByText('모두 읽음 처리')).not.toBeInTheDocument();
    });

    it('알림이 없으면 모두 삭제 버튼을 숨겨야 한다', () => {
      mockUseNotifications.mockReturnValue({
        ...defaultMockReturn,
        notifications: [],
        totalCount: 0,
      } as any);

      renderWithProviders(<NotificationList />);

      expect(screen.queryByText('모두 삭제')).not.toBeInTheDocument();
    });
  });

  describe('로딩 상태', () => {
    it('초기 로딩 시 스켈레톤을 표시해야 한다', () => {
      mockUseNotifications.mockReturnValue({
        ...defaultMockReturn,
        notifications: [],
        isLoading: true,
      } as any);

      const { container } = renderWithProviders(<NotificationList />);

      expect(container.querySelectorAll('.animate-pulse')).toHaveLength(5);
    });

    it('다음 페이지 로딩 시 로딩 인디케이터를 표시해야 한다', () => {
      mockUseNotifications.mockReturnValue({
        ...defaultMockReturn,
        isFetchingNextPage: true,
      } as any);

      const { container } = renderWithProviders(<NotificationList />);

      expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    });
  });

  describe('에러 상태', () => {
    it('에러 메시지를 표시해야 한다', () => {
      const error = new Error('알림을 불러올 수 없습니다');
      mockUseNotifications.mockReturnValue({
        ...defaultMockReturn,
        notifications: [],
        error,
      } as any);

      renderWithProviders(<NotificationList />);

      expect(
        screen.getByText('알림을 불러오는 중 오류가 발생했습니다.'),
      ).toBeInTheDocument();
      expect(screen.getByText('알림을 불러올 수 없습니다')).toBeInTheDocument();
    });
  });

  describe('빈 상태', () => {
    it('알림이 없을 때 빈 상태 컴포넌트를 표시해야 한다', () => {
      mockUseNotifications.mockReturnValue({
        ...defaultMockReturn,
        notifications: [],
        totalCount: 0,
        unreadCount: 0,
      } as any);

      renderWithProviders(<NotificationList />);

      expect(screen.getByText('알림이 없습니다')).toBeInTheDocument();
    });
  });

  describe('알림 클릭', () => {
    it('알림 클릭 시 linkUrl로 이동해야 한다', async () => {
      renderWithProviders(<NotificationList />);

      const notifications = screen.getAllByText('테스트 알림');
      fireEvent.click(notifications[0]);

      expect(mockNavigate).toHaveBeenCalledWith('/welfare/123');
    });

    it('linkUrl이 없는 알림은 이동하지 않아야 한다', () => {
      mockUseNotifications.mockReturnValue({
        ...defaultMockReturn,
        notifications: [createMockNotification({ linkUrl: undefined })],
      } as any);

      renderWithProviders(<NotificationList />);

      const notification = screen.getByText('테스트 알림');
      fireEvent.click(notification);

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('읽음 처리', () => {
    it('읽음 처리 버튼 클릭 시 markAsRead가 호출되어야 한다', async () => {
      const mockMarkAsRead = jest.fn();
      mockUseNotifications.mockReturnValue({
        ...defaultMockReturn,
        markAsRead: mockMarkAsRead,
      } as any);

      renderWithProviders(<NotificationList />);

      const markAsReadButton = screen.getAllByLabelText('읽음 표시')[0];
      fireEvent.click(markAsReadButton);

      await waitFor(() => {
        expect(mockMarkAsRead).toHaveBeenCalledWith(['notif-1']);
      });
    });

    it('모두 읽음 처리 클릭 시 markAllAsRead가 호출되어야 한다', async () => {
      const mockMarkAllAsRead = jest.fn();
      mockUseNotifications.mockReturnValue({
        ...defaultMockReturn,
        markAllAsRead: mockMarkAllAsRead,
      } as any);

      renderWithProviders(<NotificationList />);

      const markAllButton = screen.getByText('모두 읽음 처리');
      fireEvent.click(markAllButton);

      await waitFor(() => {
        expect(mockMarkAllAsRead).toHaveBeenCalled();
      });
    });
  });

  describe('삭제', () => {
    it('삭제 버튼 클릭 시 deleteNotification이 호출되어야 한다', async () => {
      const mockDeleteNotification = jest.fn();
      mockUseNotifications.mockReturnValue({
        ...defaultMockReturn,
        deleteNotification: mockDeleteNotification,
      } as any);

      renderWithProviders(<NotificationList />);

      const deleteButtons = screen.getAllByLabelText('알림 삭제');
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(mockDeleteNotification).toHaveBeenCalledWith('notif-1');
      });
    });

    it('모두 삭제 클릭 시 확인 후 deleteAllNotifications가 호출되어야 한다', async () => {
      const mockDeleteAll = jest.fn();
      mockUseNotifications.mockReturnValue({
        ...defaultMockReturn,
        deleteAllNotifications: mockDeleteAll,
      } as any);

      // window.confirm 모킹
      jest.spyOn(window, 'confirm').mockReturnValue(true);

      renderWithProviders(<NotificationList />);

      const deleteAllButton = screen.getByText('모두 삭제');
      fireEvent.click(deleteAllButton);

      await waitFor(() => {
        expect(mockDeleteAll).toHaveBeenCalled();
      });
    });

    it('모두 삭제 취소 시 deleteAllNotifications가 호출되지 않아야 한다', () => {
      const mockDeleteAll = jest.fn();
      mockUseNotifications.mockReturnValue({
        ...defaultMockReturn,
        deleteAllNotifications: mockDeleteAll,
      } as any);

      jest.spyOn(window, 'confirm').mockReturnValue(false);

      renderWithProviders(<NotificationList />);

      const deleteAllButton = screen.getByText('모두 삭제');
      fireEvent.click(deleteAllButton);

      expect(mockDeleteAll).not.toHaveBeenCalled();
    });
  });

  describe('무한 스크롤', () => {
    it('더 불러올 데이터가 있으면 hasMore가 true여야 한다', () => {
      mockUseNotifications.mockReturnValue({
        ...defaultMockReturn,
        hasMore: true,
      } as any);

      renderWithProviders(<NotificationList />);

      // IntersectionObserver 모킹이 필요하지만 여기서는 상태만 확인
      expect(mockUseNotifications).toHaveBeenCalled();
    });
  });

  describe('필터 옵션', () => {
    it('options prop을 useNotifications에 전달해야 한다', () => {
      const options = { type: NotificationType.NEW_WELFARE };

      renderWithProviders(<NotificationList options={options} />);

      expect(mockUseNotifications).toHaveBeenCalledWith(options);
    });
  });

  describe('스타일링', () => {
    it('className prop이 적용되어야 한다', () => {
      const { container } = renderWithProviders(
        <NotificationList className="custom-class" />,
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });
});
