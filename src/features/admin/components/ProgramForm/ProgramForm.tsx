/**
 * 프로그램 폼 컴포넌트
 * 분리된 섹션 컴포넌트들을 조합하여 프로그램 생성/수정 폼을 구성
 */

import { useState, useEffect } from 'react';
import type {
  WelfareProgram,
  CreateProgramRequest,
  TargetGroup,
  EligibilityCriteria,
  ApplicationMethod,
} from '../../types';
import {
  validateProgramForm,
  hasFormErrors,
  type ProgramFormErrors,
} from '../../utils/validation';
import { BasicInfoSection } from './BasicInfoSection';
import { EligibilitySection } from './EligibilitySection';
import { ApplicationSection } from './ApplicationSection';

interface ProgramFormProps {
  initialData?: WelfareProgram;
  onSubmit: (data: CreateProgramRequest) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

/** 폼 기본값 */
const DEFAULT_FORM_DATA: CreateProgramRequest = {
  name: '',
  description: '',
  summary: '',
  category: 'other',
  targetGroups: [],
  eligibilityCriteria: {},
  applicationMethod: {},
  requiredDocuments: [],
  contactInfo: null,
  managingOrganization: '',
  benefits: '',
  benefitAmount: null,
  applicationStartDate: null,
  applicationEndDate: null,
  isAlwaysOpen: false,
  sourceUrl: null,
  tags: [],
  isActive: true,
};

/** 확장/축소 가능한 섹션 상태 */
interface ExpandedSections {
  basic: boolean;
  eligibility: boolean;
  application: boolean;
  additional: boolean;
}

/**
 * 프로그램 폼 컴포넌트
 */
export function ProgramForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
}: ProgramFormProps) {
  const [formData, setFormData] = useState<CreateProgramRequest>(DEFAULT_FORM_DATA);
  const [errors, setErrors] = useState<ProgramFormErrors>({});
  const [expandedSections, setExpandedSections] = useState<ExpandedSections>({
    basic: true,
    eligibility: false,
    application: false,
    additional: false,
  });

  // 초기 데이터 설정
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description,
        summary: initialData.summary,
        category: initialData.category,
        targetGroups: initialData.targetGroups,
        eligibilityCriteria: initialData.eligibilityCriteria,
        applicationMethod: initialData.applicationMethod,
        requiredDocuments: initialData.requiredDocuments,
        contactInfo: initialData.contactInfo,
        managingOrganization: initialData.managingOrganization,
        benefits: initialData.benefits,
        benefitAmount: initialData.benefitAmount,
        applicationStartDate: initialData.applicationStartDate,
        applicationEndDate: initialData.applicationEndDate,
        isAlwaysOpen: initialData.isAlwaysOpen,
        sourceUrl: initialData.sourceUrl,
        tags: initialData.tags,
        isActive: initialData.isActive,
      });
    }
  }, [initialData]);

  // 필드 업데이트
  const updateField = <K extends keyof CreateProgramRequest>(
    field: K,
    value: CreateProgramRequest[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // 해당 필드 에러 제거
    if (errors[field as keyof ProgramFormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // 대상 그룹 토글
  const toggleTargetGroup = (group: TargetGroup) => {
    setFormData((prev) => ({
      ...prev,
      targetGroups: prev.targetGroups.includes(group)
        ? prev.targetGroups.filter((g) => g !== group)
        : [...prev.targetGroups, group],
    }));
    if (errors.targetGroups) {
      setErrors((prev) => ({ ...prev, targetGroups: undefined }));
    }
  };

  // 자격 조건 업데이트
  const updateEligibility = (eligibility: EligibilityCriteria) => {
    setFormData((prev) => ({
      ...prev,
      eligibilityCriteria: eligibility,
    }));
  };

  // 신청 방법 업데이트
  const updateApplicationMethod = (method: ApplicationMethod) => {
    setFormData((prev) => ({
      ...prev,
      applicationMethod: method,
    }));
  };

  // 섹션 토글
  const toggleSection = (section: keyof ExpandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // 폼 제출
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateProgramForm(formData);
    setErrors(validationErrors);

    if (!hasFormErrors(validationErrors)) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 기본 정보 섹션 */}
      <Section
        title="기본 정보"
        icon="📋"
        expanded={expandedSections.basic}
        onToggle={() => toggleSection('basic')}
      >
        <BasicInfoSection
          formData={formData}
          errors={errors}
          onUpdateField={updateField}
          onToggleTargetGroup={toggleTargetGroup}
        />
      </Section>

      {/* 자격 조건 섹션 */}
      <Section
        title="자격 조건"
        icon="✅"
        expanded={expandedSections.eligibility}
        onToggle={() => toggleSection('eligibility')}
      >
        <EligibilitySection
          formData={formData}
          onUpdateEligibility={updateEligibility}
        />
      </Section>

      {/* 신청 정보 섹션 */}
      <Section
        title="신청 정보"
        icon="📅"
        expanded={expandedSections.application}
        onToggle={() => toggleSection('application')}
      >
        <ApplicationSection
          formData={formData}
          onUpdateField={updateField}
          onUpdateApplicationMethod={updateApplicationMethod}
        />
      </Section>

      {/* 추가 정보 섹션 */}
      <Section
        title="추가 정보"
        icon="⚙️"
        expanded={expandedSections.additional}
        onToggle={() => toggleSection('additional')}
      >
        <AdditionalSection formData={formData} onUpdateField={updateField} />
      </Section>

      {/* 버튼 */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? '저장 중...' : initialData ? '수정' : '등록'}
        </button>
      </div>
    </form>
  );
}

/** 섹션 래퍼 컴포넌트 */
function Section({
  title,
  icon,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  icon: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50"
      >
        <div className="flex items-center gap-2">
          <span>{icon}</span>
          <span className="font-medium">{title}</span>
        </div>
        <span className="text-gray-400">{expanded ? '▲' : '▼'}</span>
      </button>
      {expanded && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

/** 추가 정보 섹션 (인라인) */
function AdditionalSection({
  formData,
  onUpdateField,
}: {
  formData: CreateProgramRequest;
  onUpdateField: <K extends keyof CreateProgramRequest>(
    field: K,
    value: CreateProgramRequest[K]
  ) => void;
}) {
  return (
    <div className="space-y-4">
      {/* 태그 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          태그 (쉼표로 구분)
        </label>
        <input
          type="text"
          value={formData.tags?.join(', ') || ''}
          onChange={(e) =>
            onUpdateField(
              'tags',
              e.target.value
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean)
            )
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="청년, 주거, 지원금"
        />
      </div>

      {/* 활성 상태 */}
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={formData.isActive}
          onChange={(e) => onUpdateField('isActive', e.target.checked)}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <span className="text-sm text-gray-700">활성 상태로 게시</span>
      </label>
    </div>
  );
}

export default ProgramForm;
