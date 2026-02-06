/**
 * 폼 유효성 검사 스키마
 * Zod를 사용한 프로그램 폼 검증
 */

import type {
  CreateProgramRequest,
  ProgramCategory,
  TargetGroup,
} from '../types';

/** 유효한 카테고리 목록 */
export const VALID_CATEGORIES: ProgramCategory[] = [
  'employment',
  'housing',
  'education',
  'healthcare',
  'childcare',
  'welfare',
  'culture',
  'other',
];

/** 유효한 대상 그룹 목록 */
export const VALID_TARGET_GROUPS: TargetGroup[] = [
  'youth',
  'elderly',
  'disabled',
  'low_income',
  'single_parent',
  'veteran',
  'multicultural',
  'all',
];

/** 프로그램 폼 에러 */
export interface ProgramFormErrors {
  name?: string;
  description?: string;
  summary?: string;
  category?: string;
  targetGroups?: string;
  managingOrganization?: string;
  benefits?: string;
  eligibilityCriteria?: string;
  applicationMethod?: string;
}

/**
 * 프로그램 생성 폼 유효성 검사
 */
export function validateProgramForm(
  data: Partial<CreateProgramRequest>
): ProgramFormErrors {
  const errors: ProgramFormErrors = {};

  // 프로그램명 검증
  if (!data.name || data.name.trim().length < 2) {
    errors.name = '프로그램명은 최소 2자 이상이어야 합니다.';
  } else if (data.name.length > 200) {
    errors.name = '프로그램명은 200자를 초과할 수 없습니다.';
  }

  // 요약 설명 검증
  if (!data.summary || data.summary.trim().length < 5) {
    errors.summary = '요약 설명은 최소 5자 이상이어야 합니다.';
  } else if (data.summary.length > 500) {
    errors.summary = '요약 설명은 500자를 초과할 수 없습니다.';
  }

  // 상세 설명 검증
  if (!data.description || data.description.trim().length < 10) {
    errors.description = '상세 설명은 최소 10자 이상이어야 합니다.';
  }

  // 카테고리 검증
  if (!data.category || !VALID_CATEGORIES.includes(data.category)) {
    errors.category = '카테고리를 선택해주세요.';
  }

  // 대상 그룹 검증
  if (!data.targetGroups || data.targetGroups.length === 0) {
    errors.targetGroups = '최소 하나의 대상 그룹을 선택해주세요.';
  }

  // 관리 기관 검증
  if (!data.managingOrganization || data.managingOrganization.trim().length < 2) {
    errors.managingOrganization = '관리 기관을 입력해주세요.';
  }

  // 혜택 검증
  if (!data.benefits || data.benefits.trim().length < 5) {
    errors.benefits = '혜택 정보를 입력해주세요.';
  }

  return errors;
}

/**
 * 폼 에러가 있는지 확인
 */
export function hasFormErrors(errors: ProgramFormErrors): boolean {
  return Object.keys(errors).length > 0;
}

/**
 * 날짜 문자열 유효성 검사
 */
export function isValidDateString(dateStr: string | null | undefined): boolean {
  if (!dateStr) return true; // 선택적 필드
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
}

/**
 * URL 유효성 검사
 */
export function isValidUrl(url: string | null | undefined): boolean {
  if (!url) return true; // 선택적 필드
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
