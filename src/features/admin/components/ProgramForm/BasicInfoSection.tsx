/**
 * 기본 정보 섹션 컴포넌트
 * 프로그램 폼의 기본 정보 입력 영역
 */

import type { CreateProgramRequest, ProgramCategory, TargetGroup } from '../../types';
import type { ProgramFormErrors } from '../../utils/validation';
import { CATEGORIES } from '../../constants/categories';
import { TARGET_GROUPS } from '../../constants/targetGroups';

interface BasicInfoSectionProps {
  /** 폼 데이터 */
  formData: CreateProgramRequest;
  /** 유효성 검사 에러 */
  errors: ProgramFormErrors;
  /** 필드 업데이트 함수 */
  onUpdateField: <K extends keyof CreateProgramRequest>(
    field: K,
    value: CreateProgramRequest[K]
  ) => void;
  /** 대상 그룹 토글 함수 */
  onToggleTargetGroup: (group: TargetGroup) => void;
}

/**
 * 기본 정보 섹션
 */
export function BasicInfoSection({
  formData,
  errors,
  onUpdateField,
  onToggleTargetGroup,
}: BasicInfoSectionProps) {
  return (
    <div className="space-y-4">
      {/* 프로그램명 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          프로그램명 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => onUpdateField('name', e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="프로그램명을 입력하세요"
        />
        {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
      </div>

      {/* 요약 설명 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          요약 설명 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.summary}
          onChange={(e) => onUpdateField('summary', e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
            errors.summary ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="한 줄 요약을 입력하세요"
        />
        {errors.summary && <p className="mt-1 text-sm text-red-500">{errors.summary}</p>}
      </div>

      {/* 상세 설명 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          상세 설명 <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => onUpdateField('description', e.target.value)}
          rows={5}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="프로그램에 대한 상세 설명을 입력하세요"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-500">{errors.description}</p>
        )}
      </div>

      {/* 카테고리 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          카테고리 <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.category}
          onChange={(e) => onUpdateField('category', e.target.value as ProgramCategory)}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
            errors.category ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.icon} {cat.label}
            </option>
          ))}
        </select>
        {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
      </div>

      {/* 대상 그룹 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          대상 그룹 <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {TARGET_GROUPS.map((group) => (
            <label
              key={group.value}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                formData.targetGroups.includes(group.value)
                  ? 'bg-blue-50 border-blue-500'
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
            >
              <input
                type="checkbox"
                checked={formData.targetGroups.includes(group.value)}
                onChange={() => onToggleTargetGroup(group.value)}
                className="hidden"
              />
              <span>{group.icon}</span>
              <span className="text-sm">{group.label}</span>
            </label>
          ))}
        </div>
        {errors.targetGroups && (
          <p className="mt-1 text-sm text-red-500">{errors.targetGroups}</p>
        )}
      </div>

      {/* 관리 기관 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          관리 기관 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.managingOrganization}
          onChange={(e) => onUpdateField('managingOrganization', e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
            errors.managingOrganization ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="담당 기관명을 입력하세요"
        />
        {errors.managingOrganization && (
          <p className="mt-1 text-sm text-red-500">{errors.managingOrganization}</p>
        )}
      </div>

      {/* 혜택 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          혜택 <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.benefits}
          onChange={(e) => onUpdateField('benefits', e.target.value)}
          rows={3}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
            errors.benefits ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="지원 혜택을 입력하세요"
        />
        {errors.benefits && <p className="mt-1 text-sm text-red-500">{errors.benefits}</p>}
      </div>

      {/* 지원 금액 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">지원 금액</label>
        <input
          type="text"
          value={formData.benefitAmount || ''}
          onChange={(e) => onUpdateField('benefitAmount', e.target.value || null)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="예: 월 50만원"
        />
      </div>
    </div>
  );
}

export default BasicInfoSection;
