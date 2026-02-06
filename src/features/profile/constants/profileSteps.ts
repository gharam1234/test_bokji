/**
 * 프로필 입력 단계 정의
 */

import { ProfileStep } from '../types';

/** 단계 정보 */
export interface StepConfig {
  /** 단계 키 */
  key: ProfileStep;
  /** 단계 라벨 */
  label: string;
  /** 단계 설명 */
  description: string;
  /** 단계 순서 (0부터 시작) */
  order: number;
  /** 아이콘 이름 */
  icon: string;
}

/** 프로필 입력 단계 목록 */
export const PROFILE_STEPS: StepConfig[] = [
  {
    key: ProfileStep.BASIC_INFO,
    label: '기본 정보',
    description: '이름, 생년월일, 연락처 등 기본 정보를 입력합니다.',
    order: 0,
    icon: 'user',
  },
  {
    key: ProfileStep.INCOME,
    label: '소득 정보',
    description: '소득 유형과 연간 소득을 입력합니다.',
    order: 1,
    icon: 'wallet',
  },
  {
    key: ProfileStep.ADDRESS,
    label: '주소 정보',
    description: '거주지 주소를 입력합니다.',
    order: 2,
    icon: 'map-pin',
  },
  {
    key: ProfileStep.HOUSEHOLD,
    label: '가구원 정보',
    description: '함께 거주하는 가구원 정보를 입력합니다.',
    order: 3,
    icon: 'users',
  },
];

/** 단계별 키로 설정 조회 */
export const getStepConfig = (step: ProfileStep): StepConfig | undefined => {
  return PROFILE_STEPS.find((s) => s.key === step);
};

/** 다음 단계 조회 */
export const getNextStep = (currentStep: ProfileStep): ProfileStep | null => {
  const currentIndex = PROFILE_STEPS.findIndex((s) => s.key === currentStep);
  if (currentIndex === -1 || currentIndex >= PROFILE_STEPS.length - 1) {
    return null;
  }
  return PROFILE_STEPS[currentIndex + 1].key;
};

/** 이전 단계 조회 */
export const getPrevStep = (currentStep: ProfileStep): ProfileStep | null => {
  const currentIndex = PROFILE_STEPS.findIndex((s) => s.key === currentStep);
  if (currentIndex <= 0) {
    return null;
  }
  return PROFILE_STEPS[currentIndex - 1].key;
};

/** 총 단계 수 */
export const TOTAL_STEPS = PROFILE_STEPS.length;
