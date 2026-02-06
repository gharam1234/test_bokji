/**
 * ChartLegend 컴포넌트
 * 차트 범례(Legend)를 커스터마이징하는 컴포넌트
 * Recharts의 기본 Legend 대신 사용 가능
 */

import React from 'react';

// ==================== 타입 정의 ====================

export interface LegendItem {
  /** 범례 항목 ID 또는 키 */
  id: string;
  /** 표시 이름 */
  name: string;
  /** 색상 (HEX, RGB, 또는 CSS 색상명) */
  color: string;
  /** 값 (선택적) */
  value?: number | string;
  /** 비활성화 여부 */
  inactive?: boolean;
}

export type LegendLayout = 'horizontal' | 'vertical';
export type LegendAlign = 'left' | 'center' | 'right';
export type LegendPosition = 'top' | 'bottom' | 'left' | 'right';

export interface ChartLegendProps {
  /** 범례 항목 목록 */
  items: LegendItem[];
  /** 레이아웃 방향 */
  layout?: LegendLayout;
  /** 정렬 */
  align?: LegendAlign;
  /** 위치 */
  position?: LegendPosition;
  /** 아이콘 모양 */
  iconType?: 'circle' | 'square' | 'line' | 'rect';
  /** 아이콘 크기 */
  iconSize?: number;
  /** 항목 클릭 핸들러 (토글용) */
  onItemClick?: (item: LegendItem) => void;
  /** 항목 호버 핸들러 */
  onItemHover?: (item: LegendItem | null) => void;
  /** 인터랙티브 여부 */
  interactive?: boolean;
  /** 값 포맷터 */
  valueFormatter?: (value: number | string | undefined) => string;
  /** 추가 CSS 클래스 */
  className?: string;
}

// ==================== 아이콘 컴포넌트 ====================

interface LegendIconProps {
  type: ChartLegendProps['iconType'];
  color: string;
  size: number;
  inactive?: boolean;
}

const LegendIcon: React.FC<LegendIconProps> = ({
  type = 'circle',
  color,
  size,
  inactive,
}) => {
  const style = {
    backgroundColor: inactive ? '#d1d5db' : color,
    opacity: inactive ? 0.5 : 1,
  };

  switch (type) {
    case 'square':
      return (
        <span
          className="inline-block rounded-sm"
          style={{ ...style, width: size, height: size }}
        />
      );
    case 'line':
      return (
        <span
          className="inline-block rounded-full"
          style={{ ...style, width: size * 1.5, height: 3 }}
        />
      );
    case 'rect':
      return (
        <span
          className="inline-block rounded-sm"
          style={{ ...style, width: size * 1.2, height: size * 0.8 }}
        />
      );
    case 'circle':
    default:
      return (
        <span
          className="inline-block rounded-full"
          style={{ ...style, width: size, height: size }}
        />
      );
  }
};

// ==================== 메인 컴포넌트 ====================

/**
 * ChartLegend - 커스텀 차트 범례 컴포넌트
 *
 * @example
 * ```tsx
 * <ChartLegend
 *   items={[
 *     { id: 'sales', name: '매출', color: '#3b82f6', value: 1500000 },
 *     { id: 'profit', name: '이익', color: '#10b981', value: 450000 },
 *   ]}
 *   layout="horizontal"
 *   align="center"
 *   onItemClick={(item) => toggleSeries(item.id)}
 *   valueFormatter={(v) => `${(v as number).toLocaleString()}원`}
 * />
 * ```
 */
export const ChartLegend: React.FC<ChartLegendProps> = ({
  items,
  layout = 'horizontal',
  align = 'center',
  position = 'bottom',
  iconType = 'circle',
  iconSize = 10,
  onItemClick,
  onItemHover,
  interactive = true,
  valueFormatter,
  className = '',
}) => {
  // 정렬 클래스 매핑
  const alignClass = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  }[align];

  // 레이아웃 클래스 매핑
  const layoutClass = layout === 'vertical' ? 'flex-col' : 'flex-row flex-wrap';

  // 위치에 따른 마진
  const positionClass = {
    top: 'mb-4',
    bottom: 'mt-4',
    left: 'mr-4',
    right: 'ml-4',
  }[position];

  // 항목 클릭 핸들러
  const handleItemClick = (item: LegendItem) => {
    if (interactive && onItemClick) {
      onItemClick(item);
    }
  };

  // 항목 호버 핸들러
  const handleItemHover = (item: LegendItem | null) => {
    if (interactive && onItemHover) {
      onItemHover(item);
    }
  };

  return (
    <div
      className={`flex ${layoutClass} ${alignClass} ${positionClass} gap-x-4 gap-y-2 ${className}`}
      role="list"
      aria-label="차트 범례"
    >
      {items.map((item) => (
        <div
          key={item.id}
          className={`
            flex items-center gap-2 text-sm
            ${interactive && onItemClick ? 'cursor-pointer' : ''}
            ${item.inactive ? 'opacity-50' : ''}
            ${interactive ? 'hover:opacity-80 transition-opacity' : ''}
          `}
          role="listitem"
          onClick={() => handleItemClick(item)}
          onMouseEnter={() => handleItemHover(item)}
          onMouseLeave={() => handleItemHover(null)}
          tabIndex={interactive && onItemClick ? 0 : undefined}
          onKeyPress={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleItemClick(item);
            }
          }}
        >
          {/* 아이콘 */}
          <LegendIcon
            type={iconType}
            color={item.color}
            size={iconSize}
            inactive={item.inactive}
          />

          {/* 이름 */}
          <span
            className={`text-gray-700 ${item.inactive ? 'line-through' : ''}`}
          >
            {item.name}
          </span>

          {/* 값 (있는 경우) */}
          {item.value !== undefined && (
            <span className="text-gray-500 font-medium">
              {valueFormatter ? valueFormatter(item.value) : item.value}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

// ==================== 헬퍼 함수 ====================

/**
 * Recharts 데이터에서 범례 아이템 생성
 */
export function createLegendItems(
  dataKeys: string[],
  colors: string[],
  labels?: Record<string, string>,
  values?: Record<string, number>,
): LegendItem[] {
  return dataKeys.map((key, index) => ({
    id: key,
    name: labels?.[key] ?? key,
    color: colors[index % colors.length],
    value: values?.[key],
  }));
}

/**
 * 범례 아이템 토글 (차트 시리즈 표시/숨김용)
 */
export function toggleLegendItem(
  items: LegendItem[],
  itemId: string,
): LegendItem[] {
  return items.map((item) =>
    item.id === itemId ? { ...item, inactive: !item.inactive } : item,
  );
}

export default ChartLegend;
