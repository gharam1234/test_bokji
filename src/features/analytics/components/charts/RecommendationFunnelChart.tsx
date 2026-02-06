/**
 * RecommendationFunnelChart 컴포넌트
 * 추천 전환 분석을 퍼널 형태로 표시
 */

import React from 'react';
import { ChartContainer } from './ChartContainer';
import { FunnelStep } from '../../types';
import { CHART_COLORS } from '../../constants';

export interface RecommendationFunnelChartProps {
  /** 퍼널 데이터 */
  data: FunnelStep[] | null;
  /** 로딩 상태 */
  isLoading?: boolean;
}

/**
 * 추천 전환 퍼널 차트
 * 추천 노출 → 클릭 → 즐겨찾기 전환율 시각화
 */
export const RecommendationFunnelChart: React.FC<RecommendationFunnelChartProps> = ({
  data,
  isLoading = false,
}) => {
  const isEmpty = !data || data.length === 0;

  return (
    <ChartContainer
      title="추천 전환 분석"
      subtitle="추천 복지의 클릭 및 즐겨찾기 전환율"
      isLoading={isLoading}
      isEmpty={isEmpty}
      emptyMessage="아직 추천 데이터가 없습니다"
    >
      <div className="w-full px-4">
        {/* 퍼널 바 */}
        <div className="space-y-3">
          {data?.map((step, index) => (
            <FunnelBar
              key={step.step}
              step={step}
              color={CHART_COLORS.funnel[index] || CHART_COLORS.primary[index]}
              isFirst={index === 0}
            />
          ))}
        </div>

        {/* 전환율 표시 */}
        {data && data.length > 1 && (
          <div className="mt-6 flex justify-center gap-8">
            {data.slice(1).map((step, index) => (
              <ConversionRate
                key={step.step}
                fromStep={data[index].step}
                toStep={step.step}
                rate={step.percentage}
              />
            ))}
          </div>
        )}
      </div>
    </ChartContainer>
  );
};

/**
 * 퍼널 바 컴포넌트
 */
interface FunnelBarProps {
  step: FunnelStep;
  color: string;
  isFirst: boolean;
}

const FunnelBar: React.FC<FunnelBarProps> = ({ step, color, isFirst }) => {
  const width = isFirst ? 100 : step.percentage;

  return (
    <div className="flex items-center gap-4">
      <div className="w-24 text-sm text-gray-600 text-right">{step.step}</div>
      <div className="flex-1 relative">
        <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
          <div
            className="h-full rounded-lg transition-all duration-500 flex items-center justify-end pr-3"
            style={{
              width: `${width}%`,
              backgroundColor: color,
            }}
          >
            <span className="text-white text-sm font-medium">
              {step.count.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
      <div className="w-16 text-sm text-gray-500 text-right">
        {step.percentage.toFixed(1)}%
      </div>
    </div>
  );
};

/**
 * 전환율 표시 컴포넌트
 */
interface ConversionRateProps {
  fromStep: string;
  toStep: string;
  rate: number;
}

const ConversionRate: React.FC<ConversionRateProps> = ({
  fromStep,
  toStep,
  rate,
}) => (
  <div className="text-center">
    <div className="text-2xl font-bold text-blue-600">{rate.toFixed(1)}%</div>
    <div className="text-xs text-gray-500 mt-1">
      {fromStep} → {toStep}
    </div>
  </div>
);

export default RecommendationFunnelChart;
