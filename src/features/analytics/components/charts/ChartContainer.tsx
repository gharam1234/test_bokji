/**
 * ChartContainer 컴포넌트
 * 차트를 감싸는 공통 래퍼 컴포넌트
 */

import React from 'react';

export interface ChartContainerProps {
  /** 차트 제목 */
  title: string;
  /** 부제목 */
  subtitle?: string;
  /** 차트 내용 */
  children: React.ReactNode;
  /** 로딩 상태 */
  isLoading?: boolean;
  /** 데이터 비어있는지 */
  isEmpty?: boolean;
  /** 빈 데이터 메시지 */
  emptyMessage?: string;
  /** 추가 CSS 클래스 */
  className?: string;
}

/**
 * 차트 컨테이너 - 제목, 로딩, 빈 상태 처리를 포함한 래퍼
 */
export const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  subtitle,
  children,
  isLoading = false,
  isEmpty = false,
  emptyMessage = '데이터가 없습니다',
  className = '',
}) => {
  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}
    >
      {/* 헤더 */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {subtitle && (
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        )}
      </div>

      {/* 컨텐츠 */}
      <div className="min-h-[200px] flex items-center justify-center">
        {isLoading ? (
          <LoadingSpinner />
        ) : isEmpty ? (
          <EmptyState message={emptyMessage} />
        ) : (
          children
        )}
      </div>
    </div>
  );
};

/**
 * 로딩 스피너
 */
const LoadingSpinner: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
    <p className="mt-2 text-sm text-gray-500">데이터를 불러오는 중...</p>
  </div>
);

/**
 * 빈 상태 표시
 */
const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-8 text-gray-400">
    <svg
      className="w-12 h-12 mb-2"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />
    </svg>
    <p className="text-sm">{message}</p>
  </div>
);

export default ChartContainer;
