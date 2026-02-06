/**
 * 프로필 완성도 계산 서비스
 * 프로필 입력 완성도 및 누락 필드 검사
 */

import { Injectable, Logger } from '@nestjs/common';
import { ProfileStep, UserProfile } from '../entities/user-profile.entity';
import { HouseholdMember } from '../entities/household-member.entity';
import {
  ProfileCompletionResponseDto,
  StepCompletionDto,
} from '../dto/profile-response.dto';

// 단계별 라벨
const STEP_LABELS: Record<ProfileStep, string> = {
  [ProfileStep.BASIC_INFO]: '기본 정보',
  [ProfileStep.INCOME]: '소득 정보',
  [ProfileStep.ADDRESS]: '주소 정보',
  [ProfileStep.HOUSEHOLD]: '가구원 정보',
  [ProfileStep.COMPLETE]: '완료',
};

// 단계별 가중치 (전체 100%)
const STEP_WEIGHTS: Record<ProfileStep, number> = {
  [ProfileStep.BASIC_INFO]: 30,
  [ProfileStep.INCOME]: 20,
  [ProfileStep.ADDRESS]: 25,
  [ProfileStep.HOUSEHOLD]: 25,
  [ProfileStep.COMPLETE]: 0,
};

@Injectable()
export class CompletionService {
  private readonly logger = new Logger(CompletionService.name);

  /**
   * 프로필 완성도 계산
   * @param profile 사용자 프로필
   * @param householdMembers 가구원 목록
   * @returns 완성도 응답 DTO
   */
  calculateCompletion(
    profile: Partial<UserProfile> | null,
    householdMembers: HouseholdMember[] = [],
  ): ProfileCompletionResponseDto {
    const steps: StepCompletionDto[] = [];
    let totalCompletion = 0;

    // 기본 정보 검사
    const basicInfoResult = this.checkBasicInfo(profile);
    steps.push(basicInfoResult);
    totalCompletion += basicInfoResult.completionRate * (STEP_WEIGHTS[ProfileStep.BASIC_INFO] / 100);

    // 소득 정보 검사
    const incomeResult = this.checkIncome(profile);
    steps.push(incomeResult);
    totalCompletion += incomeResult.completionRate * (STEP_WEIGHTS[ProfileStep.INCOME] / 100);

    // 주소 정보 검사
    const addressResult = this.checkAddress(profile);
    steps.push(addressResult);
    totalCompletion += addressResult.completionRate * (STEP_WEIGHTS[ProfileStep.ADDRESS] / 100);

    // 가구원 정보 검사
    const householdResult = this.checkHousehold(profile, householdMembers);
    steps.push(householdResult);
    totalCompletion += householdResult.completionRate * (STEP_WEIGHTS[ProfileStep.HOUSEHOLD] / 100);

    return {
      overall: Math.round(totalCompletion),
      steps,
    };
  }

  /**
   * 기본 정보 완성도 검사
   */
  private checkBasicInfo(profile: Partial<UserProfile> | null): StepCompletionDto {
    const missingFields: string[] = [];
    let completedFields = 0;
    const totalFields = 4; // name, birthDate, gender, phone

    if (!profile) {
      return {
        step: ProfileStep.BASIC_INFO,
        label: STEP_LABELS[ProfileStep.BASIC_INFO],
        isComplete: false,
        completionRate: 0,
        missingFields: ['이름', '생년월일', '성별', '전화번호'],
      };
    }

    if (profile.nameEncrypted) completedFields++; else missingFields.push('이름');
    if (profile.birthDate) completedFields++; else missingFields.push('생년월일');
    if (profile.gender) completedFields++; else missingFields.push('성별');
    if (profile.phoneEncrypted) completedFields++; else missingFields.push('전화번호');

    const completionRate = Math.round((completedFields / totalFields) * 100);

    return {
      step: ProfileStep.BASIC_INFO,
      label: STEP_LABELS[ProfileStep.BASIC_INFO],
      isComplete: missingFields.length === 0,
      completionRate,
      missingFields,
    };
  }

  /**
   * 소득 정보 완성도 검사
   */
  private checkIncome(profile: Partial<UserProfile> | null): StepCompletionDto {
    const missingFields: string[] = [];
    let completedFields = 0;
    const totalFields = 2; // incomeType, annualAmount

    if (!profile) {
      return {
        step: ProfileStep.INCOME,
        label: STEP_LABELS[ProfileStep.INCOME],
        isComplete: false,
        completionRate: 0,
        missingFields: ['소득 유형', '연간 소득'],
      };
    }

    if (profile.incomeType) completedFields++; else missingFields.push('소득 유형');
    if (profile.annualAmountEncrypted) completedFields++; else missingFields.push('연간 소득');

    const completionRate = Math.round((completedFields / totalFields) * 100);

    return {
      step: ProfileStep.INCOME,
      label: STEP_LABELS[ProfileStep.INCOME],
      isComplete: missingFields.length === 0,
      completionRate,
      missingFields,
    };
  }

  /**
   * 주소 정보 완성도 검사
   */
  private checkAddress(profile: Partial<UserProfile> | null): StepCompletionDto {
    const missingFields: string[] = [];
    let completedFields = 0;
    const totalFields = 5; // zipCode, sido, sigungu, roadAddress, detail

    if (!profile) {
      return {
        step: ProfileStep.ADDRESS,
        label: STEP_LABELS[ProfileStep.ADDRESS],
        isComplete: false,
        completionRate: 0,
        missingFields: ['우편번호', '시/도', '시/군/구', '도로명 주소', '상세 주소'],
      };
    }

    if (profile.zipCode) completedFields++; else missingFields.push('우편번호');
    if (profile.sido) completedFields++; else missingFields.push('시/도');
    if (profile.sigungu) completedFields++; else missingFields.push('시/군/구');
    if (profile.roadAddress) completedFields++; else missingFields.push('도로명 주소');
    if (profile.detailEncrypted) completedFields++; else missingFields.push('상세 주소');

    const completionRate = Math.round((completedFields / totalFields) * 100);

    return {
      step: ProfileStep.ADDRESS,
      label: STEP_LABELS[ProfileStep.ADDRESS],
      isComplete: missingFields.length === 0,
      completionRate,
      missingFields,
    };
  }

  /**
   * 가구원 정보 완성도 검사
   */
  private checkHousehold(
    profile: Partial<UserProfile> | null,
    householdMembers: HouseholdMember[],
  ): StepCompletionDto {
    const missingFields: string[] = [];

    if (!profile) {
      return {
        step: ProfileStep.HOUSEHOLD,
        label: STEP_LABELS[ProfileStep.HOUSEHOLD],
        isComplete: false,
        completionRate: 0,
        missingFields: ['가구원 수'],
      };
    }

    if (!profile.householdSize) {
      missingFields.push('가구원 수');
    }

    // 가구원 수와 실제 등록된 가구원 수 비교 (본인 제외)
    const expectedMembers = (profile.householdSize || 1) - 1;
    const actualMembers = householdMembers.length;

    if (expectedMembers > actualMembers) {
      missingFields.push(`가구원 ${expectedMembers - actualMembers}명 추가 필요`);
    }

    const isComplete = missingFields.length === 0;
    const completionRate = isComplete ? 100 : Math.round((actualMembers / Math.max(expectedMembers, 1)) * 100);

    return {
      step: ProfileStep.HOUSEHOLD,
      label: STEP_LABELS[ProfileStep.HOUSEHOLD],
      isComplete,
      completionRate: Math.min(completionRate, 100),
      missingFields,
    };
  }

  /**
   * 다음 단계 결정
   * @param currentStep 현재 단계
   * @returns 다음 단계
   */
  getNextStep(currentStep: ProfileStep): ProfileStep {
    const stepOrder: ProfileStep[] = [
      ProfileStep.BASIC_INFO,
      ProfileStep.INCOME,
      ProfileStep.ADDRESS,
      ProfileStep.HOUSEHOLD,
      ProfileStep.COMPLETE,
    ];

    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex === -1 || currentIndex >= stepOrder.length - 1) {
      return ProfileStep.COMPLETE;
    }

    return stepOrder[currentIndex + 1];
  }
}
