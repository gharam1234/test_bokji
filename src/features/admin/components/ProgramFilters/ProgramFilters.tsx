/**
 * 프로그램 필터 컴포넌트
 */

import { useState } from 'react';
import type { ProgramListParams, ProgramCategory, TargetGroup } from '../../types';
import { CATEGORIES } from '../../constants/categories';
import { TARGET_GROUPS } from '../../constants/targetGroups';

interface ProgramFiltersProps {
  params: ProgramListParams;
  onParamsChange: (params: Partial<ProgramListParams>) => void;
  onReset: () => void;
}

/**
 * 프로그램 필터 컴포넌트
 */
export function ProgramFilters({
  params,
  onParamsChange,
  onReset,
}: ProgramFiltersProps) {
  const [searchInput, setSearchInput] = useState(params.search || '');

  // 검색어 변경 핸들러 (디바운스)
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onParamsChange({ search: searchInput });
  };

  // 검색어 초기화
  const handleClearSearch = () => {
    setSearchInput('');
    onParamsChange({ search: '' });
  };

  // 필터 변경 핸들러
  const handleFilterChange = (key: keyof ProgramListParams, value: unknown) => {
    onParamsChange({ [key]: value || undefined });
  };

  // 필터 적용 여부 확인
  const hasFilters =
    params.search ||
    params.category ||
    params.targetGroup ||
    params.isActive !== undefined ||
    params.includeDeleted;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* 검색 */}
        <form onSubmit={handleSearchSubmit} className="flex-1">
          <div className="relative">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="프로그램명, 설명으로 검색..."
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
        </form>

        {/* 카테고리 필터 */}
        <select
          value={params.category || ''}
          onChange={(e) =>
            handleFilterChange('category', e.target.value as ProgramCategory)
          }
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">모든 카테고리</option>
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.icon} {cat.label}
            </option>
          ))}
        </select>

        {/* 대상 그룹 필터 */}
        <select
          value={params.targetGroup || ''}
          onChange={(e) =>
            handleFilterChange('targetGroup', e.target.value as TargetGroup)
          }
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">모든 대상</option>
          {TARGET_GROUPS.map((group) => (
            <option key={group.value} value={group.value}>
              {group.icon} {group.label}
            </option>
          ))}
        </select>

        {/* 상태 필터 */}
        <select
          value={params.isActive === undefined ? '' : String(params.isActive)}
          onChange={(e) => {
            const value = e.target.value;
            handleFilterChange(
              'isActive',
              value === '' ? undefined : value === 'true'
            );
          }}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">모든 상태</option>
          <option value="true">활성</option>
          <option value="false">비활성</option>
        </select>
      </div>

      {/* 추가 옵션 및 초기화 */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={params.includeDeleted || false}
            onChange={(e) => handleFilterChange('includeDeleted', e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          삭제된 항목 포함
        </label>

        {hasFilters && (
          <button
            type="button"
            onClick={onReset}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            필터 초기화
          </button>
        )}
      </div>
    </div>
  );
}

export default ProgramFilters;
