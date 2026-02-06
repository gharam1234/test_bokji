/**
 * useProfileForm 훅
 * 프로필 폼 상태 관리
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { profileApi } from '../api';
import {
  ProfileFormData,
  BasicInfoFormData,
  IncomeFormData,
  AddressFormData,
  HouseholdFormData,
  ProfileStep,
  ProfileResponse,
  ProfileDraftResponse,
} from '../types';
import { Gender, IncomeType, FamilyRelation } from '../types';

/** 초기 폼 데이터 */
const INITIAL_FORM_DATA: ProfileFormData = {
  basicInfo: {
    name: '',
    birthDate: '',
    gender: Gender.MALE,
    phone: '',
    email: '',
  },
  income: {
    type: IncomeType.NONE,
    annualAmount: 0,
  },
  address: {
    zipCode: '',
    sido: '',
    sigungu: '',
    roadAddress: '',
    jibunAddress: '',
    detail: '',
    buildingName: '',
  },
  household: {
    size: 1,
    members: [],
  },
};

/** useProfileForm 옵션 */
export interface UseProfileFormOptions {
  /** 기존 프로필 데이터 (수정 모드) */
  existingProfile?: ProfileResponse | null;
  /** 임시 저장 데이터 로드 여부 */
  loadDraft?: boolean;
  /** 자동 저장 활성화 */
  enableAutoSave?: boolean;
  /** 저장 완료 콜백 */
  onComplete?: () => void;
}

/** useProfileForm 반환 타입 */
export interface UseProfileFormReturn {
  /** 폼 데이터 */
  formData: ProfileFormData;
  /** 현재 단계 */
  currentStep: ProfileStep;
  /** 로딩 상태 */
  isLoading: boolean;
  /** 저장 중 상태 */
  isSaving: boolean;
  /** 에러 */
  error: Error | null;
  /** 수정 모드 여부 */
  isEditMode: boolean;
  /** 변경 여부 */
  isDirty: boolean;
  /** 단계 변경 */
  goToStep: (step: ProfileStep) => void;
  /** 다음 단계 */
  nextStep: () => void;
  /** 이전 단계 */
  prevStep: () => void;
  /** 기본 정보 업데이트 */
  updateBasicInfo: (data: Partial<BasicInfoFormData>) => void;
  /** 소득 정보 업데이트 */
  updateIncome: (data: Partial<IncomeFormData>) => void;
  /** 주소 정보 업데이트 */
  updateAddress: (data: Partial<AddressFormData>) => void;
  /** 가구원 정보 업데이트 */
  updateHousehold: (data: Partial<HouseholdFormData>) => void;
  /** 단계별 저장 */
  saveCurrentStep: () => Promise<boolean>;
  /** 전체 저장 */
  saveAll: () => Promise<boolean>;
  /** 임시 저장 */
  saveDraft: () => Promise<boolean>;
  /** 폼 초기화 */
  resetForm: () => void;
}

/** 단계 순서 */
const STEP_ORDER: ProfileStep[] = [
  ProfileStep.BASIC_INFO,
  ProfileStep.INCOME,
  ProfileStep.ADDRESS,
  ProfileStep.HOUSEHOLD,
  ProfileStep.COMPLETE,
];

/**
 * 프로필 폼 상태를 관리하는 커스텀 훅
 */
export function useProfileForm(
  options: UseProfileFormOptions = {},
): UseProfileFormReturn {
  const {
    existingProfile,
    loadDraft = true,
    enableAutoSave = false,
    onComplete,
  } = options;

  // 상태
  const [formData, setFormData] = useState<ProfileFormData>(INITIAL_FORM_DATA);
  const [currentStep, setCurrentStep] = useState<ProfileStep>(ProfileStep.BASIC_INFO);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // 수정 모드 여부
  const isEditMode = existingProfile !== null && existingProfile !== undefined;

  // 자동 저장 타이머 ref
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);

  /**
   * 기존 프로필에서 폼 데이터 변환
   */
  const profileToFormData = useCallback((profile: ProfileResponse): ProfileFormData => {
    return {
      basicInfo: {
        name: profile.basicInfo.nameFull || profile.basicInfo.name,
        birthDate: profile.basicInfo.birthDate,
        gender: profile.basicInfo.gender,
        phone: profile.basicInfo.phoneFull || profile.basicInfo.phone,
        email: profile.basicInfo.email || '',
      },
      income: {
        type: profile.income.type,
        annualAmount: 0, // 소득 금액은 보안상 표시하지 않음
      },
      address: {
        zipCode: profile.address.zipCode,
        sido: profile.address.sido,
        sigungu: profile.address.sigungu,
        roadAddress: profile.address.roadAddress,
        detail: profile.address.detail || '',
        buildingName: profile.address.buildingName || '',
      },
      household: {
        size: profile.household.size,
        members: [], // 가구원 정보는 별도 처리
      },
    };
  }, []);

  /**
   * 임시 저장 데이터 로드
   */
  const loadDraftData = useCallback(async () => {
    if (!loadDraft || isEditMode) return;

    setIsLoading(true);
    try {
      const draft = await profileApi.getDraft();
      if (draft) {
        setFormData((prev) => ({
          ...prev,
          ...draft.formData,
        }));
        setCurrentStep(draft.currentStep);
      }
    } catch (err) {
      console.error('임시 저장 로드 실패:', err);
    } finally {
      setIsLoading(false);
    }
  }, [loadDraft, isEditMode]);

  // 초기화
  useEffect(() => {
    if (existingProfile) {
      setFormData(profileToFormData(existingProfile));
      setCurrentStep(existingProfile.meta.currentStep);
    } else {
      loadDraftData();
    }
  }, [existingProfile, profileToFormData, loadDraftData]);

  // 자동 저장
  useEffect(() => {
    if (enableAutoSave && isDirty) {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }

      autoSaveTimer.current = setTimeout(() => {
        saveDraft();
      }, 3000); // 3초 후 자동 저장
    }

    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, [enableAutoSave, isDirty, formData]);

  /**
   * 단계 변경
   */
  const goToStep = useCallback((step: ProfileStep) => {
    setCurrentStep(step);
  }, []);

  /**
   * 다음 단계
   */
  const nextStep = useCallback(() => {
    const currentIndex = STEP_ORDER.indexOf(currentStep);
    if (currentIndex < STEP_ORDER.length - 1) {
      setCurrentStep(STEP_ORDER[currentIndex + 1]);
    }
  }, [currentStep]);

  /**
   * 이전 단계
   */
  const prevStep = useCallback(() => {
    const currentIndex = STEP_ORDER.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(STEP_ORDER[currentIndex - 1]);
    }
  }, [currentStep]);

  /**
   * 기본 정보 업데이트
   */
  const updateBasicInfo = useCallback((data: Partial<BasicInfoFormData>) => {
    setFormData((prev) => ({
      ...prev,
      basicInfo: { ...prev.basicInfo, ...data },
    }));
    setIsDirty(true);
  }, []);

  /**
   * 소득 정보 업데이트
   */
  const updateIncome = useCallback((data: Partial<IncomeFormData>) => {
    setFormData((prev) => ({
      ...prev,
      income: { ...prev.income, ...data },
    }));
    setIsDirty(true);
  }, []);

  /**
   * 주소 정보 업데이트
   */
  const updateAddress = useCallback((data: Partial<AddressFormData>) => {
    setFormData((prev) => ({
      ...prev,
      address: { ...prev.address, ...data },
    }));
    setIsDirty(true);
  }, []);

  /**
   * 가구원 정보 업데이트
   */
  const updateHousehold = useCallback((data: Partial<HouseholdFormData>) => {
    setFormData((prev) => ({
      ...prev,
      household: { ...prev.household, ...data },
    }));
    setIsDirty(true);
  }, []);

  /**
   * 현재 단계 저장
   */
  const saveCurrentStep = useCallback(async (): Promise<boolean> => {
    setIsSaving(true);
    setError(null);

    try {
      switch (currentStep) {
        case ProfileStep.BASIC_INFO:
          await profileApi.saveBasicInfo(formData.basicInfo);
          break;
        case ProfileStep.INCOME:
          await profileApi.saveIncome(formData.income);
          break;
        case ProfileStep.ADDRESS:
          await profileApi.saveAddress(formData.address);
          break;
        case ProfileStep.HOUSEHOLD:
          const result = await profileApi.saveHousehold(formData.household);
          if (result.isComplete && onComplete) {
            onComplete();
          }
          break;
      }

      setIsDirty(false);
      nextStep();
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('저장 실패');
      setError(error);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [currentStep, formData, nextStep, onComplete]);

  /**
   * 전체 저장
   */
  const saveAll = useCallback(async (): Promise<boolean> => {
    setIsSaving(true);
    setError(null);

    try {
      if (isEditMode) {
        await profileApi.updateProfile(formData);
      } else {
        await profileApi.createProfile(formData);
      }

      setIsDirty(false);
      if (onComplete) {
        onComplete();
      }
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('저장 실패');
      setError(error);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [isEditMode, formData, onComplete]);

  /**
   * 임시 저장
   */
  const saveDraft = useCallback(async (): Promise<boolean> => {
    if (isEditMode) return false;

    try {
      await profileApi.saveDraft({
        currentStep,
        formData,
      });
      return true;
    } catch (err) {
      console.error('임시 저장 실패:', err);
      return false;
    }
  }, [isEditMode, currentStep, formData]);

  /**
   * 폼 초기화
   */
  const resetForm = useCallback(() => {
    setFormData(INITIAL_FORM_DATA);
    setCurrentStep(ProfileStep.BASIC_INFO);
    setError(null);
    setIsDirty(false);
  }, []);

  return {
    formData,
    currentStep,
    isLoading,
    isSaving,
    error,
    isEditMode,
    isDirty,
    goToStep,
    nextStep,
    prevStep,
    updateBasicInfo,
    updateIncome,
    updateAddress,
    updateHousehold,
    saveCurrentStep,
    saveAll,
    saveDraft,
    resetForm,
  };
}
