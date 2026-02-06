/**
 * IncomeForm 컴포넌트
 * 프로필 소득 정보 입력 폼
 */

import React, { useCallback } from 'react';
import { IncomeFormData, IncomeType, INCOME_TYPE_LABELS } from '../../types';
import { useIncomeBracket, formatIncome } from '../../hooks/useIncomeBracket';
import { incomeFormStyles as styles } from './IncomeForm.styles';

interface IncomeFormProps {
  /** 폼 데이터 */
  data: IncomeFormData;
  /** 데이터 변경 핸들러 */
  onChange: (data: Partial<IncomeFormData>) => void;
  /** 가구원 수 (소득 구간 계산용) */
  householdSize?: number;
  /** 에러 메시지 */
  errors?: Record<string, string>;
  /** 비활성화 여부 */
  disabled?: boolean;
}

/**
 * 소득 정보(소득 유형, 연간 소득) 입력 폼
 */
export const IncomeForm: React.FC<IncomeFormProps> = ({
  data,
  onChange,
  householdSize = 1,
  errors = {},
  disabled = false,
}) => {
  // 소득 구간 계산
  const { bracket, bracketLabel, ratio, medianIncome } = useIncomeBracket({
    annualIncome: data.annualAmount,
    householdSize,
  });

  // 소득 유형 변경 핸들러
  const handleTypeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const type = e.target.value as IncomeType;
      onChange({ type });
      
      // 소득 없음 선택 시 금액 0으로 설정
      if (type === IncomeType.NONE) {
        onChange({ type, annualAmount: 0 });
      }
    },
    [onChange],
  );

  // 소득 금액 변경 핸들러
  const handleAmountChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/[^0-9]/g, '');
      const amount = value ? parseInt(value, 10) : 0;
      onChange({ annualAmount: amount });
    },
    [onChange],
  );

  // 금액 포맷팅 (입력 필드용)
  const formatInputAmount = (amount: number): string => {
    if (amount === 0) return '';
    return amount.toLocaleString();
  };

  return (
    <div className={styles.container}>
      {/* 섹션 헤더 */}
      <div>
        <h2 className={styles.title}>소득 정보</h2>
        <p className={styles.description}>
          복지 서비스 자격 요건 확인을 위한 소득 정보를 입력해주세요.
        </p>
      </div>

      {/* 폼 필드 */}
      <div className={styles.formGroup}>
        {/* 소득 유형 */}
        <div className={styles.field}>
          <label htmlFor="incomeType" className={styles.label}>
            소득 유형<span className={styles.required}>*</span>
          </label>
          <select
            id="incomeType"
            name="incomeType"
            value={data.type}
            onChange={handleTypeChange}
            disabled={disabled}
            className={`${styles.select} ${errors.type ? styles.inputError : ''}`}
            aria-invalid={!!errors.type}
          >
            {Object.entries(INCOME_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          {errors.type && <p className={styles.errorText}>{errors.type}</p>}
        </div>

        {/* 연간 소득 */}
        {data.type !== IncomeType.NONE && (
          <div className={styles.field}>
            <label htmlFor="annualAmount" className={styles.label}>
              연간 총 소득<span className={styles.required}>*</span>
            </label>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                id="annualAmount"
                name="annualAmount"
                value={formatInputAmount(data.annualAmount)}
                onChange={handleAmountChange}
                placeholder="0"
                disabled={disabled}
                className={`${styles.input} ${errors.annualAmount ? styles.inputError : ''}`}
                aria-invalid={!!errors.annualAmount}
                inputMode="numeric"
              />
              <span className={styles.inputSuffix}>원</span>
            </div>
            {errors.annualAmount && (
              <p className={styles.errorText}>{errors.annualAmount}</p>
            )}
            <p className={styles.helpText}>
              세전 연간 총 소득을 입력해주세요. (근로소득, 사업소득 등 합산)
            </p>
          </div>
        )}
      </div>

      {/* 소득 구간 안내 */}
      {data.annualAmount > 0 && (
        <div className={styles.bracketCard}>
          <p className={styles.bracketTitle}>예상 소득 구간</p>
          <p className={styles.bracketValue}>{bracketLabel}</p>
          <p className={styles.bracketDescription}>
            {householdSize}인 가구 기준 중위소득({formatIncome(medianIncome)}) 대비{' '}
            <strong>{ratio}%</strong>
          </p>
        </div>
      )}

      {/* 안내 문구 */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-2">💡 소득 구간 안내</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• 중위소득 50% 이하: 기초생활보장, 긴급복지 등 대상</li>
          <li>• 중위소득 50~75%: 차상위계층 복지 대상</li>
          <li>• 중위소득 75~100%: 일부 주거/교육 복지 대상</li>
          <li>• 중위소득 100~150%: 일부 보편적 복지 대상</li>
        </ul>
      </div>
    </div>
  );
};

export default IncomeForm;
