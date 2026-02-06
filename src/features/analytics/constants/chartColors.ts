/**
 * 차트 색상 상수
 * 일관된 차트 스타일을 위한 색상 팔레트
 */

/** 기본 차트 색상 팔레트 */
export const CHART_COLORS = {
  /** 메인 색상 (카테고리 등) */
  primary: [
    '#3B82F6', // blue-500
    '#10B981', // emerald-500
    '#F59E0B', // amber-500
    '#EF4444', // red-500
    '#8B5CF6', // violet-500
    '#EC4899', // pink-500
    '#06B6D4', // cyan-500
    '#84CC16', // lime-500
  ],

  /** 보조 색상 */
  secondary: [
    '#60A5FA', // blue-400
    '#34D399', // emerald-400
    '#FBBF24', // amber-400
    '#F87171', // red-400
    '#A78BFA', // violet-400
    '#F472B6', // pink-400
    '#22D3EE', // cyan-400
    '#A3E635', // lime-400
  ],

  /** 트렌드 라인 색상 */
  trend: {
    searches: '#3B82F6', // blue-500
    views: '#10B981',    // emerald-500
    bookmarks: '#F59E0B', // amber-500
  },

  /** 퍼널 차트 색상 */
  funnel: [
    '#3B82F6', // 추천 노출
    '#10B981', // 클릭
    '#F59E0B', // 즐겨찾기
  ],

  /** 증가/감소 색상 */
  change: {
    positive: '#059669', // emerald-600
    negative: '#DC2626', // red-600
    neutral: '#6B7280',  // gray-500
  },

  /** 그라데이션 */
  gradient: {
    blue: {
      start: '#3B82F6',
      end: '#60A5FA',
    },
    green: {
      start: '#10B981',
      end: '#34D399',
    },
  },
};

/** 카테고리별 색상 매핑 */
export const CATEGORY_COLORS: Record<string, string> = {
  '주거지원': '#3B82F6',  // blue
  '취업지원': '#10B981',  // emerald
  '교육지원': '#F59E0B',  // amber
  '의료지원': '#EF4444',  // red
  '생활지원': '#8B5CF6',  // violet
  '복지서비스': '#EC4899', // pink
  '기타': '#6B7280',      // gray
};

/**
 * 카테고리 이름으로 색상 가져오기
 * @param category 카테고리 이름
 * @returns 색상 코드 또는 undefined
 */
export function getCategoryColor(category: string): string | undefined {
  return CATEGORY_COLORS[category];
}

/**
 * 인덱스로 색상 가져오기 (순환)
 * @param index 인덱스
 * @param palette 색상 팔레트 (기본: primary)
 * @returns 색상 코드
 */
export function getColorByIndex(
  index: number,
  palette: string[] = CHART_COLORS.primary,
): string {
  return palette[index % palette.length];
}

/**
 * 변화율에 따른 색상 가져오기
 * @param change 변화율 (퍼센트)
 * @returns 색상 코드
 */
export function getChangeColor(change: number): string {
  if (change > 0) return CHART_COLORS.change.positive;
  if (change < 0) return CHART_COLORS.change.negative;
  return CHART_COLORS.change.neutral;
}

export default CHART_COLORS;
