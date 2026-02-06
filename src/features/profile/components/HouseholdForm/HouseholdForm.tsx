/**
 * HouseholdForm 컴포넌트
 * 프로필 가구원 정보 입력 폼
 */

import React, { useState, useCallback } from 'react';
import {
  HouseholdFormData,
  HouseholdMemberInput,
  FamilyRelation,
  Gender,
  RELATION_LABELS,
  GENDER_LABELS,
} from '../../types';
import { householdFormStyles as styles } from './HouseholdForm.styles';

interface HouseholdFormProps {
  /** 폼 데이터 */
  data: HouseholdFormData;
  /** 데이터 변경 핸들러 */
  onChange: (data: Partial<HouseholdFormData>) => void;
  /** 에러 메시지 */
  errors?: Record<string, string>;
  /** 비활성화 여부 */
  disabled?: boolean;
}

/** 빈 가구원 초기값 */
const EMPTY_MEMBER: HouseholdMemberInput = {
  relation: FamilyRelation.SPOUSE,
  name: '',
  birthDate: '',
  gender: Gender.MALE,
  hasDisability: false,
  hasIncome: false,
};

/**
 * 가구원 정보 입력 폼
 */
export const HouseholdForm: React.FC<HouseholdFormProps> = ({
  data,
  onChange,
  errors = {},
  disabled = false,
}) => {
  // 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [memberForm, setMemberForm] = useState<HouseholdMemberInput>(EMPTY_MEMBER);

  // 가구원 수 변경
  const handleSizeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const size = parseInt(e.target.value, 10);
      onChange({ size });
    },
    [onChange],
  );

  // 모달 열기 (추가)
  const openAddModal = useCallback(() => {
    setMemberForm(EMPTY_MEMBER);
    setEditingIndex(null);
    setIsModalOpen(true);
  }, []);

  // 모달 열기 (수정)
  const openEditModal = useCallback(
    (index: number) => {
      setMemberForm(data.members[index]);
      setEditingIndex(index);
      setIsModalOpen(true);
    },
    [data.members],
  );

  // 모달 닫기
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingIndex(null);
    setMemberForm(EMPTY_MEMBER);
  }, []);

  // 가구원 폼 변경
  const handleMemberFormChange = useCallback(
    (field: keyof HouseholdMemberInput, value: any) => {
      setMemberForm((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  // 가구원 저장
  const handleSaveMember = useCallback(() => {
    const newMembers = [...data.members];

    if (editingIndex !== null) {
      newMembers[editingIndex] = memberForm;
    } else {
      newMembers.push(memberForm);
    }

    onChange({ members: newMembers });
    closeModal();
  }, [data.members, editingIndex, memberForm, onChange, closeModal]);

  // 가구원 삭제
  const handleDeleteMember = useCallback(
    (index: number) => {
      const newMembers = data.members.filter((_, i) => i !== index);
      onChange({ members: newMembers });
    },
    [data.members, onChange],
  );

  // 나이 계산
  const calculateAge = (birthDate: string): number => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className={styles.container}>
      {/* 섹션 헤더 */}
      <div>
        <h2 className={styles.title}>가구원 정보</h2>
        <p className={styles.description}>
          함께 거주하는 가구원 정보를 입력해주세요. 가구원 수에 따라 소득 기준이 달라질 수 있습니다.
        </p>
      </div>

      {/* 가구원 수 */}
      <div className={styles.formGroup}>
        <div className={styles.field}>
          <label htmlFor="householdSize" className={styles.label}>
            가구원 수 (본인 포함)<span className={styles.required}>*</span>
          </label>
          <select
            id="householdSize"
            name="householdSize"
            value={data.size}
            onChange={handleSizeChange}
            disabled={disabled}
            className={`${styles.select} ${errors.size ? styles.inputError : ''}`}
          >
            {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
              <option key={num} value={num}>
                {num}인 가구
              </option>
            ))}
          </select>
          {errors.size && <p className={styles.errorText}>{errors.size}</p>}
          <p className={styles.helpText}>
            본인을 포함한 세대원 수를 선택해주세요.
          </p>
        </div>
      </div>

      {/* 가구원 목록 */}
      {data.size > 1 && (
        <div className={styles.memberSection}>
          <div className={styles.memberHeader}>
            <h3 className={styles.memberTitle}>
              가구원 목록 ({data.members.length}/{data.size - 1}명)
            </h3>
            {data.members.length < data.size - 1 && (
              <button
                type="button"
                onClick={openAddModal}
                disabled={disabled}
                className={styles.addButton}
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                가구원 추가
              </button>
            )}
          </div>

          {data.members.length === 0 ? (
            <div className={styles.emptyState}>
              <p>등록된 가구원이 없습니다.</p>
              <p className="text-sm mt-1">가구원 추가 버튼을 클릭하여 가구원을 등록해주세요.</p>
            </div>
          ) : (
            <div className={styles.memberList}>
              {data.members.map((member, index) => (
                <div key={index} className={styles.memberCard}>
                  <div className={styles.memberInfo}>
                    <p className={styles.memberName}>{member.name}</p>
                    <p className={styles.memberDetails}>
                      <span className={styles.memberBadge}>
                        {RELATION_LABELS[member.relation]}
                      </span>
                      <span className={styles.memberBadge}>
                        {GENDER_LABELS[member.gender]}
                      </span>
                      <span className={styles.memberBadge}>
                        만 {calculateAge(member.birthDate)}세
                      </span>
                      {member.hasDisability && (
                        <span className={`${styles.memberBadge} bg-blue-100 text-blue-700`}>
                          장애
                        </span>
                      )}
                      {member.hasIncome && (
                        <span className={`${styles.memberBadge} bg-green-100 text-green-700`}>
                          소득 있음
                        </span>
                      )}
                    </p>
                  </div>
                  <div className={styles.memberActions}>
                    <button
                      type="button"
                      onClick={() => openEditModal(index)}
                      disabled={disabled}
                      className={styles.editButton}
                      aria-label="수정"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteMember(index)}
                      disabled={disabled}
                      className={styles.deleteButton}
                      aria-label="삭제"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 가구원 추가/수정 모달 */}
      {isModalOpen && (
        <div className={styles.modal} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {editingIndex !== null ? '가구원 수정' : '가구원 추가'}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className={styles.modalCloseButton}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className={styles.modalBody}>
              {/* 관계 */}
              <div className={styles.field}>
                <label className={styles.label}>관계<span className={styles.required}>*</span></label>
                <select
                  value={memberForm.relation}
                  onChange={(e) => handleMemberFormChange('relation', e.target.value)}
                  className={styles.select}
                >
                  {Object.entries(RELATION_LABELS)
                    .filter(([value]) => value !== FamilyRelation.SELF)
                    .map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                </select>
              </div>

              {/* 이름 */}
              <div className={styles.field}>
                <label className={styles.label}>이름<span className={styles.required}>*</span></label>
                <input
                  type="text"
                  value={memberForm.name}
                  onChange={(e) => handleMemberFormChange('name', e.target.value)}
                  className={styles.input}
                  placeholder="홍길동"
                />
              </div>

              {/* 생년월일 & 성별 */}
              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <label className={styles.label}>생년월일<span className={styles.required}>*</span></label>
                  <input
                    type="date"
                    value={memberForm.birthDate}
                    onChange={(e) => handleMemberFormChange('birthDate', e.target.value)}
                    className={styles.input}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>성별<span className={styles.required}>*</span></label>
                  <select
                    value={memberForm.gender}
                    onChange={(e) => handleMemberFormChange('gender', e.target.value)}
                    className={styles.select}
                  >
                    {Object.entries(GENDER_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 체크박스 */}
              <div className={styles.fieldRow}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={memberForm.hasDisability}
                    onChange={(e) => handleMemberFormChange('hasDisability', e.target.checked)}
                    className={styles.checkbox}
                  />
                  <span>장애 여부</span>
                </label>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={memberForm.hasIncome}
                    onChange={(e) => handleMemberFormChange('hasIncome', e.target.checked)}
                    className={styles.checkbox}
                  />
                  <span>소득 있음</span>
                </label>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button type="button" onClick={closeModal} className={styles.cancelButton}>
                취소
              </button>
              <button
                type="button"
                onClick={handleSaveMember}
                className={styles.submitButton}
                disabled={!memberForm.name || !memberForm.birthDate}
              >
                {editingIndex !== null ? '수정' : '추가'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HouseholdForm;
