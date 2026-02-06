/**
 * AnalyticsDashboard 컴포넌트
 * 분석 대시보드 메인 컨테이너
 */

import React from 'react';
import { SummaryCards } from '../SummaryCards';
import { InsightList } from '../InsightCard';
import { PeriodFilter } from '../PeriodFilter';
import { PDFDownloadButton } from '../PDFDownloadButton';
import {
  CategoryDistributionChart,
  ActivityTrendChart,
  RecommendationFunnelChart,
  TopWelfareChart,
} from '../charts';
import { useAnalytics } from '../../hooks';
import { analyticsApi } from '../../api';
import { PeriodFilter as PeriodFilterType } from '../../types';

export interface AnalyticsDashboardProps {
  /** 초기 기간 */
  initialPeriod?: PeriodFilterType;
}

/**
 * 분석 대시보드 컴포넌트
 * 모든 분석 차트와 통계를 포함하는 메인 대시보드
 */
export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  initialPeriod = 'month',
}) => {
  const {
    summary,
    isLoading,
    error,
    refetch,
    changePeriod,
    currentPeriod,
  } = useAnalytics({
    period: initialPeriod,
    fetchOnMount: true,
  });

  // 인사이트 읽음 처리
  const handleMarkInsightAsRead = async (insightId: string) => {
    try {
      await analyticsApi.markInsightAsRead(insightId);
      refetch(); // 데이터 새로고침
    } catch (err) {
      console.error('Failed to mark insight as read:', err);
    }
  };

  // 에러 상태
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600 mb-4">데이터를 불러오는데 실패했습니다.</p>
        <button
          onClick={refetch}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            📊 나의 복지 분석 리포트
          </h1>
          {currentPeriod && (
            <p className="text-gray-500 mt-1">{currentPeriod.label}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <PeriodFilter
            value={initialPeriod}
            onChange={changePeriod}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* 요약 카드 */}
      <SummaryCards data={summary?.overview || null} isLoading={isLoading} />

      {/* 차트 그리드 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 카테고리 분포 차트 */}
        <CategoryDistributionChart
          data={summary?.categoryDistribution || null}
          isLoading={isLoading}
        />

        {/* 활동 트렌드 차트 */}
        <ActivityTrendChart
          data={summary?.activityTrend || null}
          isLoading={isLoading}
        />
      </div>

      {/* 추천 전환 퍼널 */}
      <RecommendationFunnelChart
        data={summary?.recommendationStats?.funnel || null}
        isLoading={isLoading}
      />

      {/* 하단 그리드 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 상위 조회 복지 */}
        <TopWelfareChart
          data={summary?.topWelfarePrograms || null}
          isLoading={isLoading}
        />

        {/* 인사이트 */}
        <InsightList
          insights={summary?.insights || null}
          isLoading={isLoading}
          onMarkAsRead={handleMarkInsightAsRead}
          maxItems={3}
        />
      </div>

      {/* PDF 다운로드 */}
      <div className="flex justify-end pt-4 border-t border-gray-200">
        <PDFDownloadButton
          period={initialPeriod}
          includeCharts={true}
          includeInsights={true}
          size="lg"
          variant="primary"
        />
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
