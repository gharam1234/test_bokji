/**
 * 자격 조건 섹션 컴포넌트
 * 프로그램 신청 자격 조건 입력 영역
 */

import type { CreateProgramRequest, EligibilityCriteria } from '../../types';

interface EligibilitySectionProps {
  /** 폼 데이터 */
  formData: CreateProgramRequest;
  /** 자격 조건 업데이트 함수 */
  onUpdateEligibility: (eligibility: EligibilityCriteria) => void;
}

/**
 * 자격 조건 섹션
 */
export function EligibilitySection({
  formData,
  onUpdateEligibility,
}: EligibilitySectionProps) {
  const criteria = formData.eligibilityCriteria || {};

  const updateCriteria = <K extends keyof EligibilityCriteria>(
    field: K,
    value: EligibilityCriteria[K]
  ) => {
    onUpdateEligibility({
      ...criteria,
      [field]: value,
    });
  };

  return (
    <div className="space-y-4">
      {/* 나이 제한 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            최소 나이
          </label>
          <input
            type="number"
            min={0}
            max={120}
            value={criteria.minAge ?? ''}
            onChange={(e) =>
              updateCriteria(
                'minAge',
                e.target.value ? parseInt(e.target.value, 10) : undefined
              )
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="예: 19"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            최대 나이
          </label>
          <input
            type="number"
            min={0}
            max={120}
            value={criteria.maxAge ?? ''}
            onChange={(e) =>
              updateCriteria(
                'maxAge',
                e.target.value ? parseInt(e.target.value, 10) : undefined
              )
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="예: 34"
          />
        </div>
      </div>

      {/* 소득 수준 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">소득 수준</label>
        <select
          value={criteria.incomeLevel ?? ''}
          onChange={(e) =>
            updateCriteria(
              'incomeLevel',
              (e.target.value as EligibilityCriteria['incomeLevel']) || undefined
            )
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">선택 안함</option>
          <option value="low">저소득 (기준 중위소득 50% 이하)</option>
          <option value="medium">중위소득 (기준 중위소득 100% 이하)</option>
          <option value="all">제한 없음</option>
        </select>
      </div>

      {/* 소득 분위 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          최대 소득 분위 (%)
        </label>
        <input
          type="number"
          min={0}
          max={100}
          value={criteria.maxIncomePercentile ?? ''}
          onChange={(e) =>
            updateCriteria(
              'maxIncomePercentile',
              e.target.value ? parseInt(e.target.value, 10) : undefined
            )
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="예: 50 (기준 중위소득 50%)"
        />
        <p className="mt-1 text-sm text-gray-500">기준 중위소득 대비 퍼센트</p>
      </div>

      {/* 거주 요건 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          거주 요건
        </label>
        <input
          type="text"
          value={criteria.residenceRequirement ?? ''}
          onChange={(e) =>
            updateCriteria('residenceRequirement', e.target.value || undefined)
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="예: 서울시 거주 1년 이상"
        />
      </div>

      {/* 고용 상태 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          고용 상태 요건
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {EMPLOYMENT_STATUS_OPTIONS.map((status) => (
            <label
              key={status.value}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                criteria.employmentStatus?.includes(status.value)
                  ? 'bg-blue-50 border-blue-500'
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
            >
              <input
                type="checkbox"
                checked={criteria.employmentStatus?.includes(status.value) ?? false}
                onChange={() => {
                  const current = criteria.employmentStatus || [];
                  const updated = current.includes(status.value)
                    ? current.filter((s) => s !== status.value)
                    : [...current, status.value];
                  updateCriteria(
                    'employmentStatus',
                    updated.length > 0 ? updated : undefined
                  );
                }}
                className="hidden"
              />
              <span className="text-sm">{status.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 추가 조건 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          추가 자격 조건 (줄 바꿈으로 구분)
        </label>
        <textarea
          value={criteria.additionalConditions?.join('\n') ?? ''}
          onChange={(e) => {
            const lines = e.target.value
              .split('\n')
              .map((line) => line.trim())
              .filter(Boolean);
            updateCriteria(
              'additionalConditions',
              lines.length > 0 ? lines : undefined
            );
          }}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="예: 6개월 이상 구직 활동자&#10;중소기업 재직자"
        />
        <p className="mt-1 text-sm text-gray-500">
          각 조건을 새 줄에 입력하세요
        </p>
      </div>
    </div>
  );
}

/** 고용 상태 옵션 */
const EMPLOYMENT_STATUS_OPTIONS = [
  { value: 'unemployed', label: '미취업자' },
  { value: 'employed', label: '재직자' },
  { value: 'self_employed', label: '자영업자' },
  { value: 'student', label: '학생' },
  { value: 'temporary', label: '비정규직' },
  { value: 'any', label: '제한 없음' },
];

export default EligibilitySection;
