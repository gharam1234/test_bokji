/**
 * BaseChart 컴포넌트
 * 모든 차트의 기본이 되는 추상 래퍼 컴포넌트
 * 공통 스타일링, 로딩/에러/빈 상태 처리, 반응형 지원
 */

import React, { ReactNode } from 'react';
import { ResponsiveContainer } from 'recharts';

// ==================== 타입 정의 ====================

export type ChartType = 'line' | 'bar' | 'pie' | 'donut' | 'area' | 'funnel' | 'radar';

export interface BaseChartProps {
  /** 차트 타입 */
  type?: ChartType;
  /** 차트 제목 */
  title?: string;
  /** 부제목 또는 설명 */
  subtitle?: string;
  /** 차트 높이 (px) */
  height?: number;
  /** 차트 너비 (px 또는 %) */
  width?: number | string;
  /** 차트 내용 (Recharts 컴포넌트) */
  children: ReactNode;
  /** 로딩 상태 */
  isLoading?: boolean;
  /** 에러 상태 */
  error?: Error | null;
  /** 데이터 비어있는지 */
  isEmpty?: boolean;
  /** 빈 데이터 메시지 */
  emptyMessage?: string;
  /** 에러 메시지 */
  errorMessage?: string;
  /** 우측 상단 액션 버튼 */
  actions?: ReactNode;
  /** 추가 CSS 클래스 */
  className?: string;
  /** 카드 스타일 적용 여부 */
  withCard?: boolean;
  /** 패딩 적용 여부 */
  withPadding?: boolean;
  /** 재시도 콜백 */
  onRetry?: () => void;
}

// ==================== 서브 컴포넌트 ====================

/**
 * 로딩 스켈레톤
 */
const ChartSkeleton: React.FC<{ height: number }> = ({ height }) => (
  <div
    className="animate-pulse bg-gray-100 rounded-lg flex items-center justify-center"
    style={{ height }}
  >
    <div className="flex flex-col items-center gap-2">
      <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
      <span className="text-sm text-gray-400">차트 로딩 중...</span>
    </div>
  </div>
);

/**
 * 빈 상태 표시
 */
const ChartEmpty: React.FC<{ message: string; height: number }> = ({
  message,
  height,
}) => (
  <div
    className="flex flex-col items-center justify-center text-gray-400"
    style={{ height }}
  >
    <svg
      className="w-16 h-16 mb-3 opacity-50"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />
    </svg>
    <p className="text-sm">{message}</p>
  </div>
);

/**
 * 에러 상태 표시
 */
const ChartError: React.FC<{
  message: string;
  height: number;
  onRetry?: () => void;
}> = ({ message, height, onRetry }) => (
  <div
    className="flex flex-col items-center justify-center text-red-400"
    style={{ height }}
  >
    <svg
      className="w-16 h-16 mb-3 opacity-50"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
    <p className="text-sm mb-2">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="text-sm text-blue-500 hover:text-blue-600 underline"
      >
        다시 시도
      </button>
    )}
  </div>
);

// ==================== 메인 컴포넌트 ====================

/**
 * BaseChart - 모든 차트의 기본 래퍼 컴포넌트
 *
 * @example
 * ```tsx
 * <BaseChart
 *   title="월별 매출"
 *   subtitle="최근 12개월"
 *   height={300}
 *   isLoading={isLoading}
 *   isEmpty={data.length === 0}
 * >
 *   <LineChart data={data}>
 *     <Line dataKey="value" />
 *   </LineChart>
 * </BaseChart>
 * ```
 */
export const BaseChart: React.FC<BaseChartProps> = ({
  type,
  title,
  subtitle,
  height = 300,
  width = '100%',
  children,
  isLoading = false,
  error = null,
  isEmpty = false,
  emptyMessage = '표시할 데이터가 없습니다',
  errorMessage = '차트를 불러오는데 실패했습니다',
  actions,
  className = '',
  withCard = true,
  withPadding = true,
  onRetry,
}) => {
  // 컨테이너 스타일
  const containerClass = [
    withCard && 'bg-white rounded-xl shadow-sm border border-gray-100',
    withPadding && 'p-4 sm:p-5',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // 차트 렌더링 결정
  const renderContent = () => {
    if (isLoading) {
      return <ChartSkeleton height={height} />;
    }

    if (error) {
      return (
        <ChartError
          message={errorMessage}
          height={height}
          onRetry={onRetry}
        />
      );
    }

    if (isEmpty) {
      return <ChartEmpty message={emptyMessage} height={height} />;
    }

    return (
      <ResponsiveContainer width={width} height={height}>
        {children as React.ReactElement}
      </ResponsiveContainer>
    );
  };

  return (
    <div className={containerClass} data-chart-type={type}>
      {/* 헤더 (제목 또는 액션이 있을 때만 표시) */}
      {(title || actions) && (
        <div className="flex items-start justify-between mb-4">
          <div>
            {title && (
              <h3 className="text-base font-semibold text-gray-800">{title}</h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}

      {/* 차트 영역 */}
      <div className="chart-content">{renderContent()}</div>
    </div>
  );
};

export default BaseChart;
