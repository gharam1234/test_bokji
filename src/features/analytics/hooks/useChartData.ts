/**
 * useChartData 훅
 * 차트 라이브러리 호환 형식으로 데이터 변환
 */

import { useMemo } from 'react';
import {
  CategoryCount,
  TrendDataPoint,
  FunnelStep,
  ProgramCount,
} from '../types';
import {
  DonutChartData,
  BarChartData,
  FunnelChartData,
  ChartType,
} from '../types/chart.types';
import { CHART_COLORS, getCategoryColor } from '../constants/chartColors';

/** useChartData 옵션 */
export interface UseChartDataOptions<T> {
  /** 원본 데이터 */
  data: T[] | null;
  /** 차트 유형 */
  chartType: ChartType;
  /** 커스텀 색상 스킴 */
  colorScheme?: string[];
}

/** useChartData 반환 타입 */
export interface UseChartDataReturn<TOutput> {
  /** 변환된 차트 데이터 */
  chartData: TOutput[];
  /** Recharts 호환 옵션 */
  chartOptions: Record<string, any>;
  /** 데이터 비어있는지 여부 */
  isEmpty: boolean;
}

/**
 * 카테고리 데이터를 도넛 차트용으로 변환
 */
function transformCategoryToDonut(
  data: CategoryCount[],
  colors: string[],
): DonutChartData[] {
  return data.map((item, index) => ({
    name: item.category,
    value: item.count,
    percentage: item.percentage,
    fill: getCategoryColor(item.category) || colors[index % colors.length],
  }));
}

/**
 * 프로그램 데이터를 바 차트용으로 변환
 */
function transformProgramToBar(
  data: ProgramCount[],
  colors: string[],
): BarChartData[] {
  return data.map((item, index) => ({
    name: item.programName,
    value: item.viewCount,
    fill: colors[index % colors.length],
  }));
}

/**
 * 퍼널 데이터 변환
 */
function transformFunnelData(
  data: FunnelStep[],
  colors: string[],
): FunnelChartData[] {
  return data.map((item, index) => ({
    name: item.step,
    value: item.count,
    percentage: item.percentage,
    fill: colors[index % colors.length],
  }));
}

/**
 * 차트 데이터 변환 및 옵션 생성 훅
 *
 * @example
 * ```tsx
 * const { chartData, isEmpty } = useChartData({
 *   data: categoryDistribution,
 *   chartType: 'donut',
 * });
 * ```
 */
export function useChartData<T>(
  options: UseChartDataOptions<T>,
): UseChartDataReturn<any> {
  const { data, chartType, colorScheme } = options;

  const colors = colorScheme || CHART_COLORS.primary;

  const result = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        chartData: [],
        chartOptions: {},
        isEmpty: true,
      };
    }

    let chartData: any[] = [];
    let chartOptions: Record<string, any> = {};

    switch (chartType) {
      case 'donut':
      case 'pie':
        chartData = transformCategoryToDonut(
          data as unknown as CategoryCount[],
          colors,
        );
        chartOptions = {
          innerRadius: chartType === 'donut' ? 60 : 0,
          outerRadius: 80,
          paddingAngle: 2,
        };
        break;

      case 'bar':
        chartData = transformProgramToBar(
          data as unknown as ProgramCount[],
          colors,
        );
        chartOptions = {
          layout: 'horizontal',
          barSize: 20,
        };
        break;

      case 'line':
        // 라인 차트는 데이터 그대로 사용
        chartData = data as any[];
        chartOptions = {
          strokeWidth: 2,
          dot: true,
        };
        break;

      case 'funnel':
        chartData = transformFunnelData(
          data as unknown as FunnelStep[],
          CHART_COLORS.funnel,
        );
        chartOptions = {};
        break;

      default:
        chartData = data as any[];
    }

    return {
      chartData,
      chartOptions,
      isEmpty: chartData.length === 0,
    };
  }, [data, chartType, colors]);

  return result;
}

/**
 * 트렌드 데이터 전용 훅
 */
export function useTrendChartData(data: TrendDataPoint[] | null) {
  return useMemo(() => {
    if (!data || data.length === 0) {
      return {
        chartData: [],
        series: [],
        isEmpty: true,
      };
    }

    const series = [
      {
        dataKey: 'searches',
        name: '검색',
        stroke: CHART_COLORS.trend.searches,
        strokeWidth: 2,
      },
      {
        dataKey: 'views',
        name: '조회',
        stroke: CHART_COLORS.trend.views,
        strokeWidth: 2,
      },
      {
        dataKey: 'bookmarks',
        name: '즐겨찾기',
        stroke: CHART_COLORS.trend.bookmarks,
        strokeWidth: 2,
      },
    ];

    return {
      chartData: data,
      series,
      isEmpty: false,
    };
  }, [data]);
}

export default useChartData;
