/**
 * InsightCard 컴포넌트
 * 개별 인사이트 카드
 */

import React from 'react';
import { UserInsight, InsightType } from '../../types';

export interface InsightCardProps {
  /** 인사이트 데이터 */
  insight: UserInsight;
  /** 클릭 핸들러 */
  onClick?: (insight: UserInsight) => void;
  /** 읽음 처리 핸들러 */
  onMarkAsRead?: (insightId: string) => void;
}

/** 인사이트 유형별 아이콘과 색상 */
const insightStyles: Record<InsightType, { icon: string; bgColor: string; borderColor: string }> = {
  [InsightType.TOP_CATEGORY]: {
    icon: '🏠',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  [InsightType.ACTIVITY_INCREASE]: {
    icon: '📈',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  [InsightType.NEW_RECOMMENDATION]: {
    icon: '✨',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
  [InsightType.BOOKMARK_REMINDER]: {
    icon: '⭐',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  [InsightType.UNUSED_BENEFIT]: {
    icon: '💡',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
  },
};

/**
 * 인사이트 카드
 */
export const InsightCard: React.FC<InsightCardProps> = ({
  insight,
  onClick,
  onMarkAsRead,
}) => {
  const style = insightStyles[insight.insightType] || {
    icon: '💡',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
  };

  const handleClick = () => {
    onClick?.(insight);
    if (!insight.isRead) {
      onMarkAsRead?.(insight.id);
    }
  };

  return (
    <div
      className={`
        ${style.bgColor} ${style.borderColor}
        border rounded-lg p-4 cursor-pointer
        transition-all hover:shadow-md
        ${insight.isRead ? 'opacity-70' : ''}
      `}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && handleClick()}
    >
      <div className="flex items-start gap-3">
        {/* 아이콘 */}
        <span className="text-2xl flex-shrink-0">{style.icon}</span>

        {/* 내용 */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 text-sm leading-snug">
            {insight.title}
          </h4>
          {insight.description && (
            <p className="text-gray-600 text-xs mt-1 line-clamp-2">
              {insight.description}
            </p>
          )}
        </div>

        {/* 읽지 않음 표시 */}
        {!insight.isRead && (
          <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
        )}
      </div>

      {/* 화살표 */}
      <div className="flex justify-end mt-2">
        <span className="text-gray-400 text-sm">→</span>
      </div>
    </div>
  );
};

export default InsightCard;
