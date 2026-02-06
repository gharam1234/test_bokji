/**
 * 지역 코드 상수 정의
 */

import type { RegionOption } from '../types';

/**
 * 시도 목록
 */
export const SIDO_LIST: RegionOption[] = [
  { code: '11', name: '서울특별시', type: 'sido' },
  { code: '26', name: '부산광역시', type: 'sido' },
  { code: '27', name: '대구광역시', type: 'sido' },
  { code: '28', name: '인천광역시', type: 'sido' },
  { code: '29', name: '광주광역시', type: 'sido' },
  { code: '30', name: '대전광역시', type: 'sido' },
  { code: '31', name: '울산광역시', type: 'sido' },
  { code: '36', name: '세종특별자치시', type: 'sido' },
  { code: '41', name: '경기도', type: 'sido' },
  { code: '42', name: '강원도', type: 'sido' },
  { code: '43', name: '충청북도', type: 'sido' },
  { code: '44', name: '충청남도', type: 'sido' },
  { code: '45', name: '전라북도', type: 'sido' },
  { code: '46', name: '전라남도', type: 'sido' },
  { code: '47', name: '경상북도', type: 'sido' },
  { code: '48', name: '경상남도', type: 'sido' },
  { code: '50', name: '제주특별자치도', type: 'sido' },
];

/**
 * 시도 코드 → 이름 맵
 */
export const SIDO_NAMES: Record<string, string> = SIDO_LIST.reduce(
  (acc, region) => {
    acc[region.code] = region.name;
    return acc;
  },
  {} as Record<string, string>,
);

/**
 * 지역 이름 조회
 */
export function getRegionName(code: string): string {
  if (!code || code === 'all' || code === '00') return '전국';
  
  // 시도 코드 (2자리)
  const sidoCode = code.substring(0, 2);
  return SIDO_NAMES[sidoCode] || '전국';
}

/**
 * 시도 목록 조회 (드롭다운용)
 */
export function getSidoOptions(): Array<{ value: string; label: string }> {
  return [
    { value: 'all', label: '전국' },
    ...SIDO_LIST.map((region) => ({
      value: region.code,
      label: region.name,
    })),
  ];
}
