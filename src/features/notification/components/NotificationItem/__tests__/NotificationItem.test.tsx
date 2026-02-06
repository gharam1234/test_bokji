import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { NotificationItem } from '../NotificationItem';
import { NotificationType, NotificationPriority } from '../../../types/notification.types';

describe('NotificationItem', () => {
  const defaultNotification = {
    id: 'notif-1',
    type: NotificationType.WELFARE_NEW,
    title: '새로운 복지 프로그램',
    message: '맞춤형 복지 정보가 등록되었습니다.',
    isRead: false,
    priority: NotificationPriority.NORMAL,
    createdAt: new Date().toISOString(),
    linkUrl: '/welfare/123',
  };

  it('알림 제목과 내용을 표시해야 한다', () => {
    render(<NotificationItem notification={defaultNotification} />);

    expect(screen.getByText('새로운 복지 프로그램')).toBeInTheDocument();
    expect(screen.getByText('맞춤형 복지 정보가 등록되었습니다.')).toBeInTheDocument();
  });

  it('읽지 않은 알림에 시각적 표시가 있어야 한다', () => {
    const { container } = render(<NotificationItem notification={defaultNotification} />);

    // 읽지 않은 알림은 배경색이 다르거나 인디케이터가 있음
    const item = container.firstChild;
    expect(item).toHaveClass('bg-blue-50/50');
  });

  it('읽은 알림은 다른 스타일을 가져야 한다', () => {
    const readNotification = { ...defaultNotification, isRead: true };
    const { container } = render(<NotificationItem notification={readNotification} />);

    const item = container.firstChild;
    expect(item).not.toHaveClass('bg-blue-50/50');
  });

  it('클릭 시 onClick 핸들러가 호출되어야 한다', () => {
    const handleClick = jest.fn();
    render(<NotificationItem notification={defaultNotification} onClick={handleClick} />);

    fireEvent.click(screen.getByText('새로운 복지 프로그램'));

    expect(handleClick).toHaveBeenCalledWith(defaultNotification);
  });

  it('삭제 버튼 클릭 시 onDelete 핸들러가 호출되어야 한다', () => {
    const handleDelete = jest.fn();
    render(<NotificationItem notification={defaultNotification} onDelete={handleDelete} />);

    // 삭제 버튼 찾기
    const deleteButton = screen.getByLabelText('알림 삭제');
    fireEvent.click(deleteButton);

    expect(handleDelete).toHaveBeenCalledWith('notif-1');
  });

  it('읽음 표시 버튼 클릭 시 onMarkAsRead 핸들러가 호출되어야 한다', () => {
    const handleMarkAsRead = jest.fn();
    render(<NotificationItem notification={defaultNotification} onMarkAsRead={handleMarkAsRead} />);

    // 읽음 표시 버튼 찾기
    const markAsReadButton = screen.getByLabelText('읽음 표시');
    fireEvent.click(markAsReadButton);

    expect(handleMarkAsRead).toHaveBeenCalledWith('notif-1');
  });

  it('높은 우선순위 알림에 시각적 표시가 있어야 한다', () => {
    const highPriorityNotification = {
      ...defaultNotification,
      priority: NotificationPriority.HIGH,
    };

    const { container } = render(<NotificationItem notification={highPriorityNotification} />);

    // 높은 우선순위 인디케이터가 있어야 함
    expect(container.querySelector('.text-red-500')).toBeInTheDocument();
  });

  it('알림 타입에 맞는 아이콘을 표시해야 한다', () => {
    render(<NotificationItem notification={defaultNotification} />);

    // Lucide 아이콘이 렌더링되어야 함
    const icon = document.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('시간 정보를 상대적 형식으로 표시해야 한다', () => {
    const notification = {
      ...defaultNotification,
      createdAt: new Date().toISOString(),
    };

    render(<NotificationItem notification={notification} />);

    expect(screen.getByText('방금 전')).toBeInTheDocument();
  });
});
