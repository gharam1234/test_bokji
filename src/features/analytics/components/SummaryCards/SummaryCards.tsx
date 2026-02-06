/**
 * SummaryCards 컴포넌트
 * 활동 요약 카드 그리드
 */

import React from 'react';
import { SummaryCard } from './SummaryCard';
import { OverviewStats } from '../../types';

export interface SummaryCardsProps {
  /** 개요 통계 데이터 */
  data: OverviewStats | null;
  /** 로딩 상태 */
  isLoading?: boolean;
}

/**
 * 검색 아이콘
 */
const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

/**
 * 조회 아이콘
 */
const ViewIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
);

/**
 * 즐겨찾기 아이콘
 */
const BookmarkIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

/**
 * 캘린더 아이콘
 */
const CalendarIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

/**
 * 활동 요약 카드 그리드
 */
export const SummaryCards: React.FC<SummaryCardsProps> = ({
  data,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <SummaryCard
        title="검색"
        value={data.totalSearches}
        icon={<SearchIcon />}
        change={data.searchesChange}
        colorTheme="blue"
      />
      <SummaryCard
        title="조회"
        value={data.totalViews}
        icon={<ViewIcon />}
        change={data.viewsChange}
        colorTheme="green"
      />
      <SummaryCard
        title="즐겨찾기"
        value={data.totalBookmarks}
        icon={<BookmarkIcon />}
        change={data.bookmarksChange}
        unit="개"
        colorTheme="amber"
      />
      <SummaryCard
        title="활동일"
        value={data.activeDays}
        icon={<CalendarIcon />}
        unit="일"
        colorTheme="purple"
      />
    </div>
  );
};

/**
 * 스켈레톤 카드 (로딩용)
 */
const SkeletonCard: React.FC = () => (
  <div className="bg-gray-100 rounded-xl p-4 animate-pulse">
    <div className="flex items-center gap-2 mb-2">
      <div className="w-5 h-5 bg-gray-200 rounded" />
      <div className="w-12 h-4 bg-gray-200 rounded" />
    </div>
    <div className="w-16 h-8 bg-gray-200 rounded mt-2" />
    <div className="w-20 h-4 bg-gray-200 rounded mt-2" />
  </div>
);

export default SummaryCards;
