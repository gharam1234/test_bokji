/**
 * 가구원 관계 옵션 정의
 */

import { FamilyRelation, Gender } from '../types';

/** 가구원 관계 옵션 */
export const RELATION_OPTIONS = [
  { value: FamilyRelation.SELF, label: '본인', order: 0 },
  { value: FamilyRelation.SPOUSE, label: '배우자', order: 1 },
  { value: FamilyRelation.CHILD, label: '자녀', order: 2 },
  { value: FamilyRelation.PARENT, label: '부모', order: 3 },
  { value: FamilyRelation.GRANDPARENT, label: '조부모', order: 4 },
  { value: FamilyRelation.SIBLING, label: '형제자매', order: 5 },
  { value: FamilyRelation.OTHER, label: '기타', order: 6 },
] as const;

/** 본인 제외 관계 옵션 (가구원 추가 시) */
export const RELATION_OPTIONS_WITHOUT_SELF = RELATION_OPTIONS.filter(
  (option) => option.value !== FamilyRelation.SELF
);

/** 성별 옵션 */
export const GENDER_OPTIONS = [
  { value: Gender.MALE, label: '남성' },
  { value: Gender.FEMALE, label: '여성' },
  { value: Gender.OTHER, label: '기타' },
] as const;

/** 최대 가구원 수 */
export const MAX_HOUSEHOLD_SIZE = 20;

/** 최소 가구원 수 */
export const MIN_HOUSEHOLD_SIZE = 1;

/** 가구원 수 옵션 생성 */
export const HOUSEHOLD_SIZE_OPTIONS = Array.from(
  { length: MAX_HOUSEHOLD_SIZE },
  (_, i) => ({
    value: i + 1,
    label: `${i + 1}인 가구`,
  })
);

/** 관계별 아이콘 */
export const RELATION_ICONS: Record<FamilyRelation, string> = {
  [FamilyRelation.SELF]: '👤',
  [FamilyRelation.SPOUSE]: '💑',
  [FamilyRelation.CHILD]: '👶',
  [FamilyRelation.PARENT]: '👨‍👩‍👧',
  [FamilyRelation.GRANDPARENT]: '👴',
  [FamilyRelation.SIBLING]: '👫',
  [FamilyRelation.OTHER]: '👥',
};
