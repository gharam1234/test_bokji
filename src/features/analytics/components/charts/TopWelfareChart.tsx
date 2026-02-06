/**
 * TopWelfareChart 컴포넌트
 * 가장 많이 조회한 복지 프로그램을 수평 바 차트로 표시
 */

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { ChartContainer } from './ChartContainer';
import { ProgramCount } from '../../types';
import { CHART_COLORS, getCategoryColor } from '../../constants';

export interface TopWelfareChartProps {
  /** 프로그램 데이터 */
  data: ProgramCount[] | null;
  /** 로딩 상태 */
  isLoading?: boolean;
  /** 표시할 최대 개수 */
  maxItems?: number;
  /** 차트 높이 */
  height?: number;
}

/**
 * 상위 복지 프로그램 수평 바 차트
 */
export const TopWelfareChart: React.FC<TopWelfareChartProps> = ({
  data,
  isLoading = false,
  maxItems = 5,
  height = 250,
}) => {
  const isEmpty = !data || data.length === 0;

  // 데이터 가공 (최대 개수 제한, 역순으로 표시)
  const chartData = data
    ? data.slice(0, maxItems).map((item, index) => ({
        ...item,
        name: truncateName(item.programName, 15),
        fill:
          getCategoryColor(item.category) ||
          CHART_COLORS.primary[index % CHART_COLORS.primary.length],
      }))
    : [];

  return (
    <ChartContainer
      title="가장 많이 본 복지 TOP 5"
      subtitle="조회수 기준 상위 복지 프로그램"
      isLoading={isLoading}
      isEmpty={isEmpty}
      emptyMessage="아직 조회한 복지가 없습니다"
    >
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
        >
          <XAxis type="number" tick={{ fontSize: 12 }} stroke="#9ca3af" />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 12 }}
            stroke="#9ca3af"
            width={90}
          />
          <Tooltip
            cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
            formatter={(value: number, name: string, props: any) => [
              `${value}회`,
              props.payload.programName,
            ]}
            labelFormatter={() => ''}
          />
          <Bar dataKey="viewCount" radius={[0, 4, 4, 0]} barSize={20}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

/**
 * 이름이 너무 길면 자르기
 */
function truncateName(name: string, maxLength: number): string {
  if (name.length <= maxLength) return name;
  return `${name.substring(0, maxLength)}...`;
}

export default TopWelfareChart;
