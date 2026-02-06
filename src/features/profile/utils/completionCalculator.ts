/**
 * 프로필 완성도 계산 유틸리티
 */

import { ProfileStep, ProfileFormData, BasicInfoFormData, IncomeFormData, AddressFormData, HouseholdFormData } from '../types';

/** 단계별 가중치 */
const STEP_WEIGHTS: Record<ProfileStep, number> = {
  [ProfileStep.BASIC_INFO]: 30,
  [ProfileStep.INCOME]: 25,
  [ProfileStep.ADDRESS]: 25,
  [ProfileStep.HOUSEHOLD]: 20,
  [ProfileStep.COMPLETE]: 0,
};

/** 필드별 가중치 (단계 내) */
const FIELD_WEIGHTS = {
  basicInfo: {
    name: 25,
    birthDate: 25,
    gender: 20,
    phone: 20,
    email: 10,
  },
  income: {
    type: 50,
    annualAmount: 50,
  },
  address: {
    zipCode: 15,
    sido: 15,
    sigungu: 15,
    roadAddress: 25,
    detail: 30,
  },
  household: {
    size: 60,
    members: 40,
  },
};

/**
 * 기본 정보 완성도 계산
 */
export const calculateBasicInfoCompletion = (data: Partial<BasicInfoFormData>): number => {
  let score = 0;
  const weights = FIELD_WEIGHTS.basicInfo;

  if (data.name && data.name.trim().length >= 2) {
    score += weights.name;
  }
  if (data.birthDate) {
    score += weights.birthDate;
  }
  if (data.gender) {
    score += weights.gender;
  }
  if (data.phone && data.phone.replace(/[^0-9]/g, '').length >= 10) {
    score += weights.phone;
  }
  if (data.email && data.email.includes('@')) {
    score += weights.email;
  }

  return score;
};

/**
 * 소득 정보 완성도 계산
 */
export const calculateIncomeCompletion = (data: Partial<IncomeFormData>): number => {
  let score = 0;
  const weights = FIELD_WEIGHTS.income;

  if (data.type) {
    score += weights.type;
  }
  if (data.annualAmount !== undefined && data.annualAmount >= 0) {
    score += weights.annualAmount;
  }

  return score;
};

/**
 * 주소 정보 완성도 계산
 */
export const calculateAddressCompletion = (data: Partial<AddressFormData>): number => {
  let score = 0;
  const weights = FIELD_WEIGHTS.address;

  if (data.zipCode && data.zipCode.length === 5) {
    score += weights.zipCode;
  }
  if (data.sido) {
    score += weights.sido;
  }
  if (data.sigungu) {
    score += weights.sigungu;
  }
  if (data.roadAddress) {
    score += weights.roadAddress;
  }
  if (data.detail && data.detail.trim().length > 0) {
    score += weights.detail;
  }

  return score;
};

/**
 * 가구원 정보 완성도 계산
 */
export const calculateHouseholdCompletion = (data: Partial<HouseholdFormData>): number => {
  let score = 0;
  const weights = FIELD_WEIGHTS.household;

  if (data.size && data.size >= 1) {
    score += weights.size;
  }

  // 가구원 수가 2 이상이면 가구원 정보 필요
  if (data.size && data.size > 1) {
    const expectedMembers = data.size - 1; // 본인 제외
    const actualMembers = data.members?.length || 0;
    const memberRatio = Math.min(actualMembers / expectedMembers, 1);
    score += weights.members * memberRatio;
  } else {
    // 1인 가구면 가구원 정보 만점
    score += weights.members;
  }

  return score;
};

/**
 * 단계별 완성도 계산
 */
export const calculateStepCompletion = (
  step: ProfileStep,
  data: Partial<ProfileFormData>
): number => {
  switch (step) {
    case ProfileStep.BASIC_INFO:
      return calculateBasicInfoCompletion(data.basicInfo || {});
    case ProfileStep.INCOME:
      return calculateIncomeCompletion(data.income || {});
    case ProfileStep.ADDRESS:
      return calculateAddressCompletion(data.address || {});
    case ProfileStep.HOUSEHOLD:
      return calculateHouseholdCompletion(data.household || {});
    default:
      return 0;
  }
};

/**
 * 전체 프로필 완성도 계산
 */
export const calculateOverallCompletion = (data: Partial<ProfileFormData>): number => {
  const steps = [
    ProfileStep.BASIC_INFO,
    ProfileStep.INCOME,
    ProfileStep.ADDRESS,
    ProfileStep.HOUSEHOLD,
  ];

  let totalScore = 0;

  for (const step of steps) {
    const stepWeight = STEP_WEIGHTS[step];
    const stepCompletion = calculateStepCompletion(step, data);
    totalScore += (stepCompletion / 100) * stepWeight;
  }

  return Math.round(totalScore);
};

/**
 * 누락된 필드 목록 조회
 */
export const getMissingFields = (
  step: ProfileStep,
  data: Partial<ProfileFormData>
): string[] => {
  const missing: string[] = [];

  switch (step) {
    case ProfileStep.BASIC_INFO: {
      const basicInfo = data.basicInfo || {};
      if (!basicInfo.name || basicInfo.name.trim().length < 2) missing.push('이름');
      if (!basicInfo.birthDate) missing.push('생년월일');
      if (!basicInfo.gender) missing.push('성별');
      if (!basicInfo.phone) missing.push('전화번호');
      break;
    }
    case ProfileStep.INCOME: {
      const income = data.income || {};
      if (!income.type) missing.push('소득 유형');
      if (income.annualAmount === undefined) missing.push('연간 소득');
      break;
    }
    case ProfileStep.ADDRESS: {
      const address = data.address || {};
      if (!address.zipCode) missing.push('우편번호');
      if (!address.roadAddress) missing.push('도로명 주소');
      if (!address.detail) missing.push('상세 주소');
      break;
    }
    case ProfileStep.HOUSEHOLD: {
      const household = data.household || {};
      if (!household.size || household.size < 1) missing.push('가구원 수');
      if (household.size && household.size > 1) {
        const expectedMembers = household.size - 1;
        const actualMembers = household.members?.length || 0;
        if (actualMembers < expectedMembers) {
          missing.push(`가구원 정보 (${actualMembers}/${expectedMembers}명)`);
        }
      }
      break;
    }
  }

  return missing;
};
