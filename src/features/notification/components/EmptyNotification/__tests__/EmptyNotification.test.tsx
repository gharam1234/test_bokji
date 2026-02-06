import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { EmptyNotification } from '../EmptyNotification';

describe('EmptyNotification', () => {
  it('기본 메시지를 표시해야 한다', () => {
    render(<EmptyNotification />);

    expect(screen.getByText('알림이 없습니다')).toBeInTheDocument();
    expect(screen.getByText('새로운 알림이 도착하면 여기에 표시됩니다.')).toBeInTheDocument();
  });

  it('커스텀 메시지를 표시해야 한다', () => {
    render(
      <EmptyNotification
        title="필터링된 알림이 없습니다"
        description="다른 필터를 선택해보세요."
      />
    );

    expect(screen.getByText('필터링된 알림이 없습니다')).toBeInTheDocument();
    expect(screen.getByText('다른 필터를 선택해보세요.')).toBeInTheDocument();
  });

  it('아이콘을 표시해야 한다', () => {
    const { container } = render(<EmptyNotification />);

    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('액션 버튼이 있을 때 표시해야 한다', () => {
    const handleAction = jest.fn();
    render(
      <EmptyNotification
        actionLabel="새로고침"
        onAction={handleAction}
      />
    );

    expect(screen.getByText('새로고침')).toBeInTheDocument();
  });
});
