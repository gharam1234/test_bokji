import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Settings, Check, Trash2, ArrowLeft } from 'lucide-react';
import { clsx } from 'clsx';
import { NotificationList } from '../components/NotificationList';
import { useNotifications } from '../hooks/useNotifications';
import { NotificationType } from '../types/notification.types';
import { NOTIFICATION_TYPE_LABELS } from '../constants/notification.constants';

type FilterType = 'all' | NotificationType;

const FILTER_OPTIONS: { value: FilterType; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: NotificationType.WELFARE_NEW, label: NOTIFICATION_TYPE_LABELS[NotificationType.WELFARE_NEW] },
  { value: NotificationType.WELFARE_UPDATE, label: NOTIFICATION_TYPE_LABELS[NotificationType.WELFARE_UPDATE] },
  { value: NotificationType.WELFARE_EXPIRING, label: NOTIFICATION_TYPE_LABELS[NotificationType.WELFARE_EXPIRING] },
  { value: NotificationType.RECOMMENDATION, label: NOTIFICATION_TYPE_LABELS[NotificationType.RECOMMENDATION] },
  { value: NotificationType.APPLICATION_STATUS, label: NOTIFICATION_TYPE_LABELS[NotificationType.APPLICATION_STATUS] },
  { value: NotificationType.SYSTEM, label: NOTIFICATION_TYPE_LABELS[NotificationType.SYSTEM] },
];

export function NotificationCenterPage() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotifications,
  } = useNotifications({
    type: activeFilter === 'all' ? undefined : activeFilter,
    limit: 20,
  });

  const notifications = data?.pages.flatMap((page) => page.items) ?? [];

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoToSettings = () => {
    navigate('/notifications/settings');
  };

  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
    // 필터 변경 시 선택 모드 해제
    setIsSelectionMode(false);
    setSelectedIds(new Set());
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedIds(new Set());
  };

  const toggleSelectNotification = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleSelectAll = () => {
    if (selectedIds.size === notifications.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(notifications.map((n) => n.id)));
    }
  };

  const handleMarkSelectedAsRead = () => {
    const unreadIds = notifications
      .filter((n) => selectedIds.has(n.id) && !n.isRead)
      .map((n) => n.id);

    if (unreadIds.length > 0) {
      markAsRead.mutate({ notificationIds: unreadIds });
    }
    setIsSelectionMode(false);
    setSelectedIds(new Set());
  };

  const handleDeleteSelected = () => {
    if (selectedIds.size > 0) {
      deleteNotifications.mutate({ notificationIds: Array.from(selectedIds) });
    }
    setIsSelectionMode(false);
    setSelectedIds(new Set());
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={handleGoBack}
              className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="뒤로 가기"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary-600" />
              <h1 className="text-lg font-semibold text-gray-900">알림 센터</h1>
            </div>
          </div>
          <button
            onClick={handleGoToSettings}
            className="p-2 -mr-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="알림 설정"
          >
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-1 px-4 pb-3">
            {FILTER_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleFilterChange(option.value)}
                className={clsx(
                  'px-3 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-colors',
                  activeFilter === option.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Action Bar */}
      <div className="sticky top-[104px] z-10 bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between">
          {isSelectionMode ? (
            <>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  {selectedIds.size === notifications.length ? '전체 해제' : '전체 선택'}
                </button>
                <span className="text-sm text-gray-500">
                  {selectedIds.size}개 선택됨
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleMarkSelectedAsRead}
                  disabled={selectedIds.size === 0}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-primary-600 hover:bg-primary-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check className="w-4 h-4" />
                  읽음
                </button>
                <button
                  onClick={handleDeleteSelected}
                  disabled={selectedIds.size === 0}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-4 h-4" />
                  삭제
                </button>
                <button
                  onClick={toggleSelectionMode}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
                >
                  취소
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                onClick={toggleSelectionMode}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                선택
              </button>
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                모두 읽음 표시
              </button>
            </>
          )}
        </div>
      </div>

      {/* Notification List */}
      <main className="pb-safe">
        <NotificationList
          notifications={notifications}
          isLoading={isLoading}
          isFetchingMore={isFetchingNextPage}
          hasMore={hasNextPage}
          onLoadMore={fetchNextPage}
          onMarkAsRead={(id) => markAsRead.mutate({ notificationIds: [id] })}
          onDelete={(id) => deleteNotifications.mutate({ notificationIds: [id] })}
          isSelectionMode={isSelectionMode}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelectNotification}
        />
      </main>
    </div>
  );
}

export default NotificationCenterPage;
