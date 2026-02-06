/**
 * BasicInfoForm 컴포넌트
 * 프로필 기본 정보 입력 폼
 */

import React, { useCallback } from 'react';
import { BasicInfoFormData, Gender, GENDER_LABELS } from '../../types';
import { basicInfoFormStyles as styles } from './BasicInfoForm.styles';

interface BasicInfoFormProps {
  /** 폼 데이터 */
  data: BasicInfoFormData;
  /** 데이터 변경 핸들러 */
  onChange: (data: Partial<BasicInfoFormData>) => void;
  /** 에러 메시지 */
  errors?: Record<string, string>;
  /** 비활성화 여부 */
  disabled?: boolean;
}

/**
 * 기본 정보(이름, 생년월일, 성별, 연락처) 입력 폼
 */
export const BasicInfoForm: React.FC<BasicInfoFormProps> = ({
  data,
  onChange,
  errors = {},
  disabled = false,
}) => {
  // 필드 변경 핸들러
  const handleChange = useCallback(
    (field: keyof BasicInfoFormData) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        onChange({ [field]: e.target.value });
      },
    [onChange],
  );

  // 전화번호 자동 포맷팅
  const handlePhoneChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let value = e.target.value.replace(/[^0-9]/g, '');
      
      if (value.length > 11) {
        value = value.slice(0, 11);
      }

      // 자동 하이픈 삽입
      if (value.length > 7) {
        value = `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7)}`;
      } else if (value.length > 3) {
        value = `${value.slice(0, 3)}-${value.slice(3)}`;
      }

      onChange({ phone: value });
    },
    [onChange],
  );

  return (
    <div className={styles.container}>
      {/* 섹션 헤더 */}
      <div>
        <h2 className={styles.title}>기본 정보</h2>
        <p className={styles.description}>
          복지 서비스 자격 확인을 위한 기본 정보를 입력해주세요.
        </p>
      </div>

      {/* 폼 필드 */}
      <div className={styles.formGroup}>
        {/* 이름 */}
        <div className={styles.field}>
          <label htmlFor="name" className={styles.label}>
            이름<span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={data.name}
            onChange={handleChange('name')}
            placeholder="홍길동"
            disabled={disabled}
            className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'name-error' : undefined}
          />
          {errors.name && (
            <p id="name-error" className={styles.errorText}>
              {errors.name}
            </p>
          )}
        </div>

        {/* 생년월일 & 성별 */}
        <div className={styles.fieldRow}>
          {/* 생년월일 */}
          <div className={styles.field}>
            <label htmlFor="birthDate" className={styles.label}>
              생년월일<span className={styles.required}>*</span>
            </label>
            <input
              type="date"
              id="birthDate"
              name="birthDate"
              value={data.birthDate}
              onChange={handleChange('birthDate')}
              disabled={disabled}
              max={new Date().toISOString().split('T')[0]}
              className={`${styles.input} ${errors.birthDate ? styles.inputError : ''}`}
              aria-invalid={!!errors.birthDate}
            />
            {errors.birthDate && (
              <p className={styles.errorText}>{errors.birthDate}</p>
            )}
          </div>

          {/* 성별 */}
          <div className={styles.field}>
            <label htmlFor="gender" className={styles.label}>
              성별<span className={styles.required}>*</span>
            </label>
            <select
              id="gender"
              name="gender"
              value={data.gender}
              onChange={handleChange('gender')}
              disabled={disabled}
              className={`${styles.select} ${errors.gender ? styles.inputError : ''}`}
              aria-invalid={!!errors.gender}
            >
              {Object.entries(GENDER_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            {errors.gender && (
              <p className={styles.errorText}>{errors.gender}</p>
            )}
          </div>
        </div>

        {/* 전화번호 */}
        <div className={styles.field}>
          <label htmlFor="phone" className={styles.label}>
            전화번호<span className={styles.required}>*</span>
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={data.phone}
            onChange={handlePhoneChange}
            placeholder="010-1234-5678"
            disabled={disabled}
            className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
            aria-invalid={!!errors.phone}
          />
          {errors.phone && (
            <p className={styles.errorText}>{errors.phone}</p>
          )}
        </div>

        {/* 이메일 (선택) */}
        <div className={styles.field}>
          <label htmlFor="email" className={styles.label}>
            이메일 <span className="text-gray-400">(선택)</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={data.email || ''}
            onChange={handleChange('email')}
            placeholder="example@email.com"
            disabled={disabled}
            className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <p className={styles.errorText}>{errors.email}</p>
          )}
          <p className={styles.helpText}>
            복지 서비스 관련 알림을 받으실 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BasicInfoForm;
