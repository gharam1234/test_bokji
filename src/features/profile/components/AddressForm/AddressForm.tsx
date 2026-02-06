/**
 * AddressForm 컴포넌트
 * 프로필 주소 정보 입력 폼
 */

import React, { useCallback } from 'react';
import { AddressFormData, AddressSearchResult } from '../../types';
import { useAddressSearch } from '../../hooks/useAddressSearch';
import { addressFormStyles as styles } from './AddressForm.styles';

interface AddressFormProps {
  /** 폼 데이터 */
  data: AddressFormData;
  /** 데이터 변경 핸들러 */
  onChange: (data: Partial<AddressFormData>) => void;
  /** 에러 메시지 */
  errors?: Record<string, string>;
  /** 비활성화 여부 */
  disabled?: boolean;
}

/**
 * 주소 정보 입력 폼
 */
export const AddressForm: React.FC<AddressFormProps> = ({
  data,
  onChange,
  errors = {},
  disabled = false,
}) => {
  // 주소 검색 훅
  const { openSearchPopup, isSearching } = useAddressSearch((result) => {
    handleAddressSelect(result);
  });

  // 주소 선택 핸들러
  const handleAddressSelect = useCallback(
    (result: AddressSearchResult) => {
      onChange({
        zipCode: result.zipCode,
        sido: result.sido,
        sigungu: result.sigungu,
        roadAddress: result.roadAddress,
        jibunAddress: result.jibunAddress || '',
        buildingName: result.buildingName || '',
      });
    },
    [onChange],
  );

  // 상세 주소 변경 핸들러
  const handleDetailChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange({ detail: e.target.value });
    },
    [onChange],
  );

  return (
    <div className={styles.container}>
      {/* 섹션 헤더 */}
      <div>
        <h2 className={styles.title}>주소 정보</h2>
        <p className={styles.description}>
          거주지 주소를 입력해주세요. 지역별 복지 서비스 안내에 활용됩니다.
        </p>
      </div>

      {/* 폼 필드 */}
      <div className={styles.formGroup}>
        {/* 우편번호 검색 */}
        <div className={styles.field}>
          <label htmlFor="zipCode" className={styles.label}>
            우편번호<span className={styles.required}>*</span>
          </label>
          <div className={styles.inputWrapper}>
            <input
              type="text"
              id="zipCode"
              name="zipCode"
              value={data.zipCode}
              placeholder="우편번호"
              readOnly
              disabled={disabled}
              className={`${styles.input} ${styles.inputReadonly} ${
                errors.zipCode ? styles.inputError : ''
              }`}
              aria-invalid={!!errors.zipCode}
            />
            <button
              type="button"
              onClick={openSearchPopup}
              disabled={disabled || isSearching}
              className={styles.searchButton}
            >
              {isSearching ? '검색 중...' : '주소 검색'}
            </button>
          </div>
          {errors.zipCode && <p className={styles.errorText}>{errors.zipCode}</p>}
        </div>

        {/* 기본 주소 */}
        {data.roadAddress && (
          <div className={styles.addressDisplay}>
            <div className="mb-3">
              <p className={styles.addressLabel}>도로명 주소</p>
              <p className={styles.addressValue}>{data.roadAddress}</p>
            </div>
            {data.jibunAddress && (
              <div>
                <p className={styles.addressLabel}>지번 주소</p>
                <p className={styles.addressValue}>{data.jibunAddress}</p>
              </div>
            )}
          </div>
        )}

        {/* 지역 정보 (읽기 전용) */}
        {data.sido && (
          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label htmlFor="sido" className={styles.label}>
                시/도
              </label>
              <input
                type="text"
                id="sido"
                value={data.sido}
                readOnly
                disabled
                className={`${styles.input} ${styles.inputReadonly}`}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="sigungu" className={styles.label}>
                시/군/구
              </label>
              <input
                type="text"
                id="sigungu"
                value={data.sigungu}
                readOnly
                disabled
                className={`${styles.input} ${styles.inputReadonly}`}
              />
            </div>
          </div>
        )}

        {/* 상세 주소 */}
        <div className={styles.field}>
          <label htmlFor="detail" className={styles.label}>
            상세 주소<span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            id="detail"
            name="detail"
            value={data.detail}
            onChange={handleDetailChange}
            placeholder="동, 호수 등 상세 주소를 입력하세요"
            disabled={disabled || !data.roadAddress}
            className={`${styles.input} ${errors.detail ? styles.inputError : ''}`}
            aria-invalid={!!errors.detail}
          />
          {errors.detail && <p className={styles.errorText}>{errors.detail}</p>}
          <p className={styles.helpText}>
            상세 주소는 개인정보 보호를 위해 암호화되어 저장됩니다.
          </p>
        </div>
      </div>

      {/* 안내 문구 */}
      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="text-sm font-medium text-yellow-800 mb-1">📍 주소 정보 활용 안내</h4>
        <p className="text-sm text-yellow-700">
          입력하신 주소는 해당 지역에서 이용 가능한 복지 서비스를 추천하는 데 활용됩니다.
          정확한 주소를 입력해주시면 더 정확한 정보를 제공받으실 수 있습니다.
        </p>
      </div>
    </div>
  );
};

export default AddressForm;
