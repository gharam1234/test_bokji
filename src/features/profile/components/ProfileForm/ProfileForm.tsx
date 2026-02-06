/**
 * ProfileForm 컴포넌트
 * 프로필 등록 다단계 폼 컨테이너
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProfileStep } from '../../types';
import { useProfileForm } from '../../hooks/useProfileForm';
import { useAutoSave } from '../../hooks/useAutoSave';
import { StepIndicator } from '../StepIndicator';
import { ProgressBar } from '../ProgressBar';
import { BasicInfoForm } from '../BasicInfoForm';
import { IncomeForm } from '../IncomeForm';
import { AddressForm } from '../AddressForm';
import { HouseholdForm } from '../HouseholdForm';
import { profileFormStyles as styles } from './ProfileForm.styles';

interface ProfileFormProps {
  /** 초기 데이터 (수정 시) */
  initialData?: any;
  /** 작성 완료 후 이동할 경로 */
  redirectTo?: string;
}

/**
 * 프로필 폼 컨테이너
 */
export const ProfileForm: React.FC<ProfileFormProps> = ({
  initialData,
  redirectTo = '/profile',
}) => {
  const navigate = useNavigate();

  // 폼 상태 관리
  const {
    formData,
    currentStep,
    errors,
    isLoading,
    isSubmitting,
    hasDraft,
    updateStepData,
    goToNextStep,
    goToPrevStep,
    canGoNext,
    canGoPrev,
    submitForm,
    saveDraft,
    loadDraft,
    getCompletionRate,
  } = useProfileForm({ initialData });

  // 자동 저장
  const { isSaving, lastSaved, saveError } = useAutoSave(formData, saveDraft);

  // 임시 저장 데이터 로드 (초기 데이터가 없을 때)
  useEffect(() => {
    if (!initialData && hasDraft) {
      const shouldLoad = window.confirm(
        '작성 중이던 프로필 정보가 있습니다. 이어서 작성하시겠습니까?'
      );
      if (shouldLoad) {
        loadDraft();
      }
    }
  }, [initialData, hasDraft, loadDraft]);

  // 현재 단계 폼 렌더링
  const renderCurrentStepForm = () => {
    switch (currentStep) {
      case ProfileStep.BASIC_INFO:
        return (
          <BasicInfoForm
            data={formData.basicInfo}
            onChange={(data) => updateStepData('basicInfo', data)}
            errors={errors.basicInfo}
            disabled={isSubmitting}
          />
        );
      case ProfileStep.INCOME:
        return (
          <IncomeForm
            data={formData.income}
            onChange={(data) => updateStepData('income', data)}
            errors={errors.income}
            disabled={isSubmitting}
            householdSize={formData.household.size}
          />
        );
      case ProfileStep.ADDRESS:
        return (
          <AddressForm
            data={formData.address}
            onChange={(data) => updateStepData('address', data)}
            errors={errors.address}
            disabled={isSubmitting}
          />
        );
      case ProfileStep.HOUSEHOLD:
        return (
          <HouseholdForm
            data={formData.household}
            onChange={(data) => updateStepData('household', data)}
            errors={errors.household}
            disabled={isSubmitting}
          />
        );
      default:
        return null;
    }
  };

  // 폼 제출 핸들러
  const handleSubmit = async () => {
    const success = await submitForm();
    if (success) {
      navigate(redirectTo);
    }
  };

  // 완료율
  const completionRate = getCompletionRate();

  // 마지막 단계 여부
  const isLastStep = currentStep === ProfileStep.HOUSEHOLD;

  return (
    <div className={styles.container}>
      {/* 로딩 오버레이 */}
      {isLoading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.spinner} />
        </div>
      )}

      {/* 헤더 */}
      <div className={styles.header}>
        <h1 className={styles.title}>
          {initialData ? '프로필 수정' : '프로필 등록'}
        </h1>
      </div>

      {/* 진행률 */}
      <ProgressBar value={completionRate} showLabel className="mb-4" />

      {/* 단계 표시 */}
      <div className={styles.stepSection}>
        <StepIndicator currentStep={currentStep} />
      </div>

      {/* 폼 내용 */}
      <div className={styles.formContent}>
        {renderCurrentStepForm()}
      </div>

      {/* 네비게이션 */}
      <div className={styles.navigation}>
        <div>
          {canGoPrev && (
            <button
              type="button"
              onClick={goToPrevStep}
              disabled={isSubmitting}
              className={styles.prevButton}
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              이전
            </button>
          )}
        </div>

        <div className={styles.autoSaveIndicator}>
          {isSaving && (
            <span className={styles.savingText}>
              <svg className="w-4 h-4 animate-spin mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              저장 중...
            </span>
          )}
          {!isSaving && lastSaved && (
            <span className={styles.savedText}>
              <svg className="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              자동 저장됨
            </span>
          )}
          {saveError && (
            <span className={styles.errorText}>
              <svg className="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              저장 실패
            </span>
          )}
        </div>

        <div>
          {isLastStep ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !canGoNext}
              className={styles.submitButton}
            >
              {isSubmitting ? (
                <>
                  <svg className="w-5 h-5 mr-1 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  저장 중...
                </>
              ) : (
                <>
                  완료
                  <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={goToNextStep}
              disabled={isSubmitting || !canGoNext}
              className={styles.nextButton}
            >
              다음
              <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileForm;
