/**
 * ActivityTrendChart 컴포넌트
 * 활동 트렌드를 라인 차트로 표시
 */

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ChartContainer } from './ChartContainer';
import { TrendDataPoint } from '../../types';
import { useTrendChartData } from '../../hooks';
import { CHART_COLORS } from '../../constants';

export interface ActivityTrendChartProps {
  /** 트렌드 데이터 */
  data: TrendDataPoint[] | null;
  /** 로딩 상태 */
  isLoading?: boolean;
  /** 차트 높이 */
  height?: number;
}

/**
 * 날짜 포맷 (MM/DD)
 */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

/**
 * 활동 트렌드 라인 차트
 */
export const ActivityTrendChart: React.FC<ActivityTrendChartProps> = ({
  data,
  isLoading = false,
  height = 300,
}) => {
  const { chartData, series, isEmpty } = useTrendChartData(data);

  return (
    <ChartContainer
      title="활동 트렌드"
      subtitle="일별 검색, 조회, 즐겨찾기 추이"
      isLoading={isLoading}
      isEmpty={isEmpty}
      emptyMessage="아직 활동 데이터가 없습니다"
    >
      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={{ fontSize: 12 }}
            stroke="#9ca3af"
          />
          <YAxis
            tick={{ fontSize: 12 }}
            stroke="#9ca3af"
            allowDecimals={false}
          />
          <Tooltip
            labelFormatter={(label) => `날짜: ${label}`}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
            formatter={(value: number, name: string) => {
              const labels: Record<string, string> = {
                searches: '검색',
                views: '조회',
                bookmarks: '즐겨찾기',
              };
              return [`${value}회`, labels[name] || name];
            }}
          />
          <Legend
            formatter={(value: string) => {
              const labels: Record<string, string> = {
                searches: '검색',
                views: '조회',
                bookmarks: '즐겨찾기',
              };
              return <span className="text-sm">{labels[value] || value}</span>;
            }}
          />
          {series.map((s) => (
            <Line
              key={s.dataKey}
              type="monotone"
              dataKey={s.dataKey}
              name={s.dataKey}
              stroke={s.stroke}
              strokeWidth={s.strokeWidth}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default ActivityTrendChart;
