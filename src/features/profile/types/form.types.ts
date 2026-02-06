/**
 * 폼 관련 타입 정의
 */

import { ProfileStep } from './profile.types';

/** 폼 상태 */
export interface ProfileFormState {
  /** 현재 단계 */
  currentStep: ProfileStep;
  /** 완료된 단계 목록 */
  completedSteps: ProfileStep[];
  /** 수정 중인지 여부 */
  isEditing: boolean;
  /** 저장 중인지 여부 */
  isSaving: boolean;
  /** 변경된 필드가 있는지 여부 */
  isDirty: boolean;
}

/** 폼 에러 */
export interface FormErrors {
  [key: string]: string | undefined;
}

/** 폼 필드 상태 */
export interface FieldState {
  value: any;
  error?: string;
  touched: boolean;
  dirty: boolean;
}

/** 유효성 검증 결과 */
export interface ValidationResult {
  isValid: boolean;
  errors: FormErrors;
}

/** 단계 정보 */
export interface StepInfo {
  step: ProfileStep;
  label: string;
  description: string;
  isOptional: boolean;
}

/** 단계 목록 */
export const PROFILE_STEPS: StepInfo[] = [
  {
    step: ProfileStep.BASIC_INFO,
    label: '기본 정보',
    description: '이름, 생년월일, 성별, 연락처를 입력해주세요.',
    isOptional: false,
  },
  {
    step: ProfileStep.INCOME,
    label: '소득 정보',
    description: '소득 유형과 연간 소득을 입력해주세요.',
    isOptional: false,
  },
  {
    step: ProfileStep.ADDRESS,
    label: '주소 정보',
    description: '거주지 주소를 입력해주세요.',
    isOptional: false,
  },
  {
    step: ProfileStep.HOUSEHOLD,
    label: '가구원 정보',
    description: '함께 사는 가구원 정보를 입력해주세요.',
    isOptional: false,
  },
];
