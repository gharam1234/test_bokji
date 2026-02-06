/**
 * SummaryCard 컴포넌트
 * 개별 통계 카드
 */

import React from 'react';
import { getChangeColor } from '../../constants';

export interface SummaryCardProps {
  /** 제목 */
  title: string;
  /** 값 */
  value: number;
  /** 아이콘 */
  icon: React.ReactNode;
  /** 변화율 (퍼센트) */
  change?: number;
  /** 단위 */
  unit?: string;
  /** 색상 테마 */
  colorTheme?: 'blue' | 'green' | 'amber' | 'purple';
}

/** 색상 테마 매핑 */
const colorThemes = {
  blue: {
    bg: 'bg-blue-50',
    icon: 'text-blue-500',
    text: 'text-blue-700',
  },
  green: {
    bg: 'bg-emerald-50',
    icon: 'text-emerald-500',
    text: 'text-emerald-700',
  },
  amber: {
    bg: 'bg-amber-50',
    icon: 'text-amber-500',
    text: 'text-amber-700',
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'text-purple-500',
    text: 'text-purple-700',
  },
};

/**
 * 개별 통계 요약 카드
 */
export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  icon,
  change,
  unit = '회',
  colorTheme = 'blue',
}) => {
  const theme = colorThemes[colorTheme];
  const changeColor = change !== undefined ? getChangeColor(change) : '';

  return (
    <div className={`${theme.bg} rounded-xl p-4 transition-all hover:shadow-md`}>
      {/* 아이콘과 제목 */}
      <div className="flex items-center gap-2 mb-2">
        <span className={`${theme.icon}`}>{icon}</span>
        <span className="text-sm text-gray-600">{title}</span>
      </div>

      {/* 값 */}
      <div className="flex items-baseline gap-1">
        <span className={`text-2xl font-bold ${theme.text}`}>
          {value.toLocaleString()}
        </span>
        <span className="text-sm text-gray-500">{unit}</span>
      </div>

      {/* 변화율 */}
      {change !== undefined && (
        <div className="mt-2">
          <span
            className="text-sm font-medium"
            style={{ color: changeColor }}
          >
            {change >= 0 ? '▲' : '▼'} {Math.abs(change).toFixed(1)}%
          </span>
          <span className="text-xs text-gray-400 ml-1">전 기간 대비</span>
        </div>
      )}
    </div>
  );
};

export default SummaryCard;
