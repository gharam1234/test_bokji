/**
 * CategoryDistributionChart 컴포넌트
 * 카테고리별 관심 분포를 도넛 차트로 표시
 */

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { ChartContainer } from './ChartContainer';
import { CategoryCount } from '../../types';
import { useChartData } from '../../hooks';
import { CHART_COLORS, getCategoryColor } from '../../constants';

export interface CategoryDistributionChartProps {
  /** 카테고리별 데이터 */
  data: CategoryCount[] | null;
  /** 로딩 상태 */
  isLoading?: boolean;
  /** 차트 높이 */
  height?: number;
}

/**
 * 카테고리 분포 도넛 차트
 */
export const CategoryDistributionChart: React.FC<CategoryDistributionChartProps> = ({
  data,
  isLoading = false,
  height = 300,
}) => {
  const { chartData, isEmpty } = useChartData({
    data,
    chartType: 'donut',
  });

  return (
    <ChartContainer
      title="관심 카테고리 분포"
      subtitle="조회한 복지의 카테고리 비율"
      isLoading={isLoading}
      isEmpty={isEmpty}
      emptyMessage="아직 조회한 복지가 없습니다"
    >
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
            nameKey="name"
            label={({ name, percentage }) => `${name} ${percentage}%`}
            labelLine={false}
          >
            {chartData.map((entry: any, index: number) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  getCategoryColor(entry.name) ||
                  CHART_COLORS.primary[index % CHART_COLORS.primary.length]
                }
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string) => [
              `${value}회`,
              name,
            ]}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value: string) => (
              <span className="text-sm text-gray-600">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default CategoryDistributionChart;
