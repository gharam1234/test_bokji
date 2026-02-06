/**
 * NotificationBell 컴포넌트
 * 헤더에 표시되는 알림 벨 아이콘 + 배지
 */

import React, { useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';
import { useUnreadCount } from '../../hooks/useUnreadCount';
import { useNotificationSSE } from '../../hooks/useNotificationSSE';
import { NotificationDropdown } from '../NotificationDropdown';

/**
 * NotificationBell Props
 */
export interface NotificationBellProps {
  /** 추가 클래스명 */
  className?: string;
  /** SSE 실시간 연결 활성화 */
  enableSSE?: boolean;
}

/**
 * NotificationBell 컴포넌트
 */
export function NotificationBell({
  className,
  enableSSE = true,
}: NotificationBellProps): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const bellRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 읽지 않은 알림 개수
  const { count, isLoading } = useUnreadCount();

  // SSE 실시간 연결
  const { isConnected, lastNotification } = useNotificationSSE({
    enabled: enableSSE,
  });

  // 드롭다운 토글
  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        bellRef.current &&
        dropdownRef.current &&
        !bellRef.current.contains(event.target as Node) &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // ESC 키로 닫기
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  return (
    <div className={clsx('relative', className)}>
      {/* 알림 벨 버튼 */}
      <button
        ref={bellRef}
        type="button"
        onClick={handleToggle}
        className={clsx(
          'relative p-2 rounded-full',
          'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
          'focus:outline-none focus:ring-2 focus:ring-blue-500',
          'transition-colors duration-200',
          isOpen && 'bg-gray-100 text-gray-900',
        )}
        aria-label={`알림 ${count > 0 ? `(${count}개의 읽지 않은 알림)` : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {/* 벨 아이콘 */}
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* 배지 */}
        {count > 0 && (
          <span
            className={clsx(
              'absolute -top-1 -right-1',
              'min-w-[20px] h-5 px-1.5',
              'flex items-center justify-center',
              'text-xs font-bold text-white',
              'bg-red-500 rounded-full',
              'transform transition-transform duration-200',
              'animate-pulse',
            )}
          >
            {count > 99 ? '99+' : count}
          </span>
        )}

        {/* SSE 연결 상태 표시 */}
        {enableSSE && (
          <span
            className={clsx(
              'absolute bottom-0 right-0',
              'w-2 h-2 rounded-full',
              'border border-white',
              isConnected ? 'bg-green-500' : 'bg-gray-400',
            )}
            title={isConnected ? '실시간 연결됨' : '연결 끊김'}
          />
        )}
      </button>

      {/* 드롭다운 */}
      {isOpen && (
        <div ref={dropdownRef}>
          <NotificationDropdown onClose={() => setIsOpen(false)} />
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
