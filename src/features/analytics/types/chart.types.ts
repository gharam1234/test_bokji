/**
 * Analytics Feature - 차트 관련 타입 정의
 * 차트 렌더링에 필요한 타입들
 */

import { CategoryCount, TrendDataPoint, FunnelStep, ProgramCount } from './analytics.types';

// ==================== 차트 공통 타입 ====================

/** 차트 유형 */
export type ChartType = 'pie' | 'donut' | 'line' | 'bar' | 'funnel';

/** 차트 색상 스킴 */
export interface ColorScheme {
  primary: string[];
  secondary: string[];
  gradient: {
    start: string;
    end: string;
  };
}

/** 차트 기본 옵션 */
export interface BaseChartOptions {
  width?: number | string;
  height?: number | string;
  margin?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  responsive?: boolean;
  animate?: boolean;
}

// ==================== 도넛/파이 차트 타입 ====================

/** 도넛 차트 데이터 */
export interface DonutChartData {
  name: string;
  value: number;
  percentage: number;
  fill?: string;
}

/** 도넛 차트 옵션 */
export interface DonutChartOptions extends BaseChartOptions {
  innerRadius?: number;
  outerRadius?: number;
  showLabel?: boolean;
  showLegend?: boolean;
}

/** CategoryCount를 도넛 차트 데이터로 변환 */
export type CategoryToDonutMapper = (data: CategoryCount[]) => DonutChartData[];

// ==================== 라인 차트 타입 ====================

/** 라인 차트 시리즈 */
export interface LineChartSeries {
  dataKey: string;
  name: string;
  stroke: string;
  strokeWidth?: number;
  dot?: boolean;
}

/** 라인 차트 옵션 */
export interface LineChartOptions extends BaseChartOptions {
  xAxisKey: string;
  series: LineChartSeries[];
  showGrid?: boolean;
  showTooltip?: boolean;
}

/** TrendDataPoint를 라인 차트 데이터로 변환 */
export type TrendToLineMapper = (data: TrendDataPoint[]) => any[];

// ==================== 바 차트 타입 ====================

/** 바 차트 데이터 */
export interface BarChartData {
  name: string;
  value: number;
  fill?: string;
}

/** 바 차트 옵션 */
export interface BarChartOptions extends BaseChartOptions {
  layout?: 'horizontal' | 'vertical';
  barSize?: number;
  showLabel?: boolean;
}

/** ProgramCount를 바 차트 데이터로 변환 */
export type ProgramToBarMapper = (data: ProgramCount[]) => BarChartData[];

// ==================== 퍼널 차트 타입 ====================

/** 퍼널 차트 데이터 */
export interface FunnelChartData {
  name: string;
  value: number;
  percentage: number;
  fill?: string;
}

/** 퍼널 차트 옵션 */
export interface FunnelChartOptions extends BaseChartOptions {
  showLabel?: boolean;
  showPercentage?: boolean;
}

/** FunnelStep을 퍼널 차트 데이터로 변환 */
export type FunnelStepToChartMapper = (data: FunnelStep[]) => FunnelChartData[];

// ==================== 차트 컨테이너 타입 ====================

/** 차트 컨테이너 Props */
export interface ChartContainerProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyMessage?: string;
  className?: string;
}

// ==================== 차트 Tooltip 타입 ====================

/** 커스텀 Tooltip Props */
export interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}
