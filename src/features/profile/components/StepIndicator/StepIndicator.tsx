/**
 * StepIndicator 컴포넌트
 * 프로필 입력 단계 표시
 */

import React from 'react';
import { ProfileStep, STEP_LABELS } from '../../types';
import { stepIndicatorStyles as styles } from './StepIndicator.styles';

/** 표시할 단계 목록 (complete 제외) */
const DISPLAY_STEPS: ProfileStep[] = [
  ProfileStep.BASIC_INFO,
  ProfileStep.INCOME,
  ProfileStep.ADDRESS,
  ProfileStep.HOUSEHOLD,
];

interface StepIndicatorProps {
  /** 현재 단계 */
  currentStep: ProfileStep;
  /** 완료된 단계 목록 */
  completedSteps?: ProfileStep[];
  /** 단계 클릭 핸들러 */
  onStepClick?: (step: ProfileStep) => void;
  /** 클릭 가능 여부 */
  clickable?: boolean;
}

/**
 * 프로필 입력 단계를 시각적으로 표시하는 컴포넌트
 */
export const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  completedSteps = [],
  onStepClick,
  clickable = false,
}) => {
  const getStepStatus = (step: ProfileStep) => {
    if (completedSteps.includes(step)) return 'completed';
    if (step === currentStep) return 'active';
    return 'pending';
  };

  const getStepClassName = (status: string) => {
    switch (status) {
      case 'completed':
        return `${styles.step} ${styles.stepCompleted}`;
      case 'active':
        return `${styles.step} ${styles.stepActive}`;
      default:
        return `${styles.step} ${styles.stepPending}`;
    }
  };

  const getLabelClassName = (status: string) => {
    switch (status) {
      case 'completed':
        return `${styles.stepLabel} ${styles.stepLabelCompleted}`;
      case 'active':
        return `${styles.stepLabel} ${styles.stepLabelActive}`;
      default:
        return `${styles.stepLabel} ${styles.stepLabelPending}`;
    }
  };

  const handleStepClick = (step: ProfileStep) => {
    if (clickable && onStepClick) {
      onStepClick(step);
    }
  };

  return (
    <nav className={styles.container} aria-label="프로필 입력 단계">
      <ol className={styles.stepList}>
        {DISPLAY_STEPS.map((step, index) => {
          const status = getStepStatus(step);
          const stepNumber = index + 1;
          const isLast = index === DISPLAY_STEPS.length - 1;

          return (
            <li key={step} className={styles.stepWrapper}>
              {/* 단계 버튼 */}
              <button
                type="button"
                onClick={() => handleStepClick(step)}
                disabled={!clickable || (status === 'pending' && !completedSteps.includes(step))}
                className={getStepClassName(status)}
                aria-current={status === 'active' ? 'step' : undefined}
                aria-label={`${stepNumber}단계: ${STEP_LABELS[step]}`}
              >
                {status === 'completed' ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  stepNumber
                )}
              </button>

              {/* 단계 라벨 */}
              <span className={getLabelClassName(status)}>
                {STEP_LABELS[step]}
              </span>

              {/* 연결선 */}
              {!isLast && (
                <div
                  className={`${styles.connector} ${
                    status === 'completed' || completedSteps.includes(DISPLAY_STEPS[index + 1])
                      ? styles.connectorCompleted
                      : styles.connectorPending
                  }`}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default StepIndicator;
