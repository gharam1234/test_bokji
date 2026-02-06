/**
 * 감사 로그 페이지
 */

import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuditLogs } from '../../hooks/useAuditLogs';
import { AuditLogTable, Pagination } from '../../components';
import type { AuditLogFilters } from '../../types';

/**
 * 감사 로그 페이지 컴포넌트
 */
export function AuditLogPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL 쿼리에서 필터 상태 추출
  const filters: AuditLogFilters = {
    action: searchParams.get('action') || undefined,
    entityType: searchParams.get('entityType') || undefined,
    adminId: searchParams.get('adminId') || undefined,
    page: parseInt(searchParams.get('page') || '1', 10),
    limit: parseInt(searchParams.get('limit') || '20', 10),
  };

  const { data, isLoading, error } = useAuditLogs(filters);

  // 필터 변경 핸들러
  const handleFilterChange = (newFilters: Partial<AuditLogFilters>) => {
    const params = new URLSearchParams();
    const merged = { ...filters, ...newFilters, page: newFilters.page ?? 1 };
    if (merged.action) params.set('action', merged.action);
    if (merged.entityType) params.set('entityType', merged.entityType);
    if (merged.adminId) params.set('adminId', merged.adminId);
    if (merged.page && merged.page > 1) params.set('page', String(merged.page));
    if (merged.limit && merged.limit !== 20)
      params.set('limit', String(merged.limit));
    setSearchParams(params);
  };

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    handleFilterChange({ page });
  };

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">감사 로그</h1>
        <p className="mt-1 text-sm text-gray-500">
          시스템 변경 이력을 조회합니다.
        </p>
      </div>

      {/* 필터 */}
      <AuditLogFiltersComponent
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      {/* 에러 메시지 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">
            감사 로그를 불러오는데 실패했습니다.
          </p>
        </div>
      )}

      {/* 결과 요약 */}
      {data && (
        <div className="text-sm text-gray-500">
          총 {data.total}개의 로그
        </div>
      )}

      {/* 로그 테이블 */}
      <AuditLogTable
        logs={data?.items ?? []}
        isLoading={isLoading}
        showEntityName
      />

      {/* 페이지네이션 */}
      {data && data.totalPages > 1 && (
        <Pagination
          currentPage={data.page}
          totalPages={data.totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}

/** 감사 로그 필터 컴포넌트 */
function AuditLogFiltersComponent({
  filters,
  onFilterChange,
}: {
  filters: AuditLogFilters;
  onFilterChange: (filters: Partial<AuditLogFilters>) => void;
}) {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange(localFilters);
  };

  const handleReset = () => {
    setLocalFilters({});
    onFilterChange({});
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {/* 액션 필터 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            액션
          </label>
          <select
            value={localFilters.action || ''}
            onChange={(e) =>
              setLocalFilters({ ...localFilters, action: e.target.value || undefined })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">전체</option>
            <option value="CREATE">생성</option>
            <option value="UPDATE">수정</option>
            <option value="DELETE">삭제</option>
            <option value="LOGIN">로그인</option>
            <option value="LOGOUT">로그아웃</option>
          </select>
        </div>

        {/* 엔티티 타입 필터 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            대상 유형
          </label>
          <select
            value={localFilters.entityType || ''}
            onChange={(e) =>
              setLocalFilters({
                ...localFilters,
                entityType: e.target.value || undefined,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">전체</option>
            <option value="PROGRAM">프로그램</option>
            <option value="ADMIN">관리자</option>
          </select>
        </div>

        {/* 버튼 */}
        <div className="flex items-end gap-2 lg:col-span-2">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            검색
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            초기화
          </button>
        </div>
      </form>
    </div>
  );
}

export default AuditLogPage;
