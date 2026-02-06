/**
 * 대상 그룹 상수
 */

import type { TargetGroup } from '../types';

/** 대상 그룹 정보 */
export interface TargetGroupInfo {
  value: TargetGroup;
  label: string;
  description: string;
  icon: string;
}

/** 대상 그룹 목록 */
export const TARGET_GROUPS: TargetGroupInfo[] = [
  {
    value: 'youth',
    label: '청년',
    description: '만 19세 ~ 34세',
    icon: '👨‍🎓',
  },
  {
    value: 'elderly',
    label: '어르신',
    description: '만 65세 이상',
    icon: '👴',
  },
  {
    value: 'disabled',
    label: '장애인',
    description: '장애인 등록증 소지자',
    icon: '♿',
  },
  {
    value: 'low_income',
    label: '저소득층',
    description: '기준 중위소득 이하 가구',
    icon: '💰',
  },
  {
    value: 'single_parent',
    label: '한부모가정',
    description: '한부모가족지원법 대상',
    icon: '👨‍👧',
  },
  {
    value: 'veteran',
    label: '보훈대상자',
    description: '국가유공자, 보훈대상자',
    icon: '🎖️',
  },
  {
    value: 'multicultural',
    label: '다문화가정',
    description: '다문화가족지원법 대상',
    icon: '🌍',
  },
  {
    value: 'all',
    label: '전체',
    description: '제한 없음',
    icon: '👥',
  },
];

/** 대상 그룹 맵 (빠른 조회용) */
export const TARGET_GROUP_MAP = new Map<TargetGroup, TargetGroupInfo>(
  TARGET_GROUPS.map((group) => [group.value, group])
);

/** 대상 그룹 라벨 가져오기 */
export function getTargetGroupLabel(targetGroup: TargetGroup): string {
  return TARGET_GROUP_MAP.get(targetGroup)?.label ?? targetGroup;
}

/** 대상 그룹 아이콘 가져오기 */
export function getTargetGroupIcon(targetGroup: TargetGroup): string {
  return TARGET_GROUP_MAP.get(targetGroup)?.icon ?? '👥';
}
