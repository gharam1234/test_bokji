/**
 * InsightList 컴포넌트
 * 인사이트 목록
 */

import React from 'react';
import { InsightCard } from './InsightCard';
import { UserInsight } from '../../types';

export interface InsightListProps {
  /** 인사이트 목록 */
  insights: UserInsight[] | null;
  /** 로딩 상태 */
  isLoading?: boolean;
  /** 인사이트 클릭 핸들러 */
  onInsightClick?: (insight: UserInsight) => void;
  /** 읽음 처리 핸들러 */
  onMarkAsRead?: (insightId: string) => void;
  /** 표시할 최대 개수 */
  maxItems?: number;
  /** 빈 상태 메시지 */
  emptyMessage?: string;
}

/**
 * 인사이트 목록 컴포넌트
 */
export const InsightList: React.FC<InsightListProps> = ({
  insights,
  isLoading = false,
  onInsightClick,
  onMarkAsRead,
  maxItems = 3,
  emptyMessage = '새로운 인사이트가 없습니다',
}) => {
  // 로딩 상태
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          💡 맞춤 인사이트
        </h3>
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <SkeletonInsight key={i} />
          ))}
        </div>
      </div>
    );
  }

  // 빈 상태
  if (!insights || insights.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          💡 맞춤 인사이트
        </h3>
        <div className="text-center py-6 text-gray-400">
          <span className="text-3xl mb-2 block">🔍</span>
          <p className="text-sm">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  // 표시할 인사이트 (최대 개수 제한)
  const displayInsights = insights.slice(0, maxItems);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        💡 맞춤 인사이트
        {insights.some((i) => !i.isRead) && (
          <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
            NEW
          </span>
        )}
      </h3>

      <div className="space-y-3">
        {displayInsights.map((insight) => (
          <InsightCard
            key={insight.id}
            insight={insight}
            onClick={onInsightClick}
            onMarkAsRead={onMarkAsRead}
          />
        ))}
      </div>

      {/* 더보기 (인사이트가 더 있을 경우) */}
      {insights.length > maxItems && (
        <button className="w-full mt-4 text-center text-sm text-blue-600 hover:text-blue-700 py-2">
          {insights.length - maxItems}개 더보기 →
        </button>
      )}
    </div>
  );
};

/**
 * 스켈레톤 인사이트 (로딩용)
 */
const SkeletonInsight: React.FC = () => (
  <div className="bg-gray-100 rounded-lg p-4 animate-pulse">
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 bg-gray-200 rounded" />
      <div className="flex-1">
        <div className="w-3/4 h-4 bg-gray-200 rounded mb-2" />
        <div className="w-full h-3 bg-gray-200 rounded" />
      </div>
    </div>
  </div>
);

export default InsightList;
