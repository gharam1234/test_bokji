/* global describe, it, expect, beforeEach, afterEach */
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NotificationBell } from '../NotificationBell';
import * as useUnreadCountModule from '../../../hooks/useUnreadCount';
import * as useNotificationSSEModule from '../../../hooks/useNotificationSSE';

jest.mock('../../../hooks/useUnreadCount');
jest.mock('../../../hooks/useNotificationSSE');
jest.mock('../../NotificationDropdown', () => ({
  NotificationDropdown: () => <div data-testid="notification-dropdown">Dropdown</div>,
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </MemoryRouter>
  );
};

describe('NotificationBell', () => {
  const mockUseUnreadCount = jest.mocked(useUnreadCountModule.useUnreadCount);
  const mockUseNotificationSSE = jest.mocked(useNotificationSSEModule.useNotificationSSE);

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseNotificationSSE.mockReturnValue({
      isConnected: false,
      lastNotification: null,
    } as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('읽지 않은 알림이 있을 때 배지를 표시해야 한다', () => {
    mockUseUnreadCount.mockReturnValue({
      count: 5,
      isLoading: false,
      error: null,
    } as any);

    render(<NotificationBell />, { wrapper: createWrapper() });

    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('읽지 않은 알림이 99개 초과일 때 99+를 표시해야 한다', () => {
    mockUseUnreadCount.mockReturnValue({
      count: 150,
      isLoading: false,
      error: null,
    } as any);

    render(<NotificationBell />, { wrapper: createWrapper() });

    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('읽지 않은 알림이 없을 때 배지를 표시하지 않아야 한다', () => {
    mockUseUnreadCount.mockReturnValue({
      count: 0,
      isLoading: false,
      error: null,
    } as any);

    render(<NotificationBell />, { wrapper: createWrapper() });

    expect(screen.queryByText(/^\d+$/)).not.toBeInTheDocument();
  });

  it('클릭 시 드롭다운이 토글되어야 한다', () => {
    mockUseUnreadCount.mockReturnValue({
      count: 0,
      isLoading: false,
      error: null,
    } as any);

    render(<NotificationBell />, { wrapper: createWrapper() });

    // 초기에는 드롭다운이 없음
    expect(screen.queryByTestId('notification-dropdown')).not.toBeInTheDocument();

    // 클릭하면 드롭다운 열림
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByTestId('notification-dropdown')).toBeInTheDocument();

    // 다시 클릭하면 닫힘
    fireEvent.click(screen.getByRole('button'));
    expect(screen.queryByTestId('notification-dropdown')).not.toBeInTheDocument();
  });

  it('로딩 중일 때 배지를 표시하지 않아야 한다', () => {
    mockUseUnreadCount.mockReturnValue({
      count: undefined,
      isLoading: true,
      error: null,
    } as any);

    render(<NotificationBell />, { wrapper: createWrapper() });

    expect(screen.queryByText(/^\d+$/)).not.toBeInTheDocument();
  });
});
