/**
 * 프로그램 목록 페이지
 */

import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { usePrograms } from '../../hooks/usePrograms';
import { useProgramMutation } from '../../hooks/useProgramMutation';
import {
  ProgramTable,
  ProgramFilters,
  Pagination,
  ConfirmDialog,
} from '../../components';
import { ADMIN_ROUTES } from '../../constants/routes';
import type { ProgramFilters as FilterType } from '../../types';

/**
 * 프로그램 목록 페이지 컴포넌트
 */
export function ProgramListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // URL 쿼리에서 필터 상태 추출
  const filters: FilterType = {
    search: searchParams.get('search') || undefined,
    category: searchParams.get('category') || undefined,
    status: searchParams.get('status') || undefined,
    isActive:
      searchParams.get('isActive') === 'true'
        ? true
        : searchParams.get('isActive') === 'false'
        ? false
        : undefined,
    page: parseInt(searchParams.get('page') || '1', 10),
    limit: parseInt(searchParams.get('limit') || '10', 10),
  };

  const { data, isLoading, error } = usePrograms(filters);
  const { deleteProgram, isDeleting } = useProgramMutation();

  // 필터 변경 핸들러
  const handleFilterChange = (newFilters: FilterType) => {
    const params = new URLSearchParams();
    if (newFilters.search) params.set('search', newFilters.search);
    if (newFilters.category) params.set('category', newFilters.category);
    if (newFilters.status) params.set('status', newFilters.status);
    if (newFilters.isActive !== undefined)
      params.set('isActive', String(newFilters.isActive));
    if (newFilters.page && newFilters.page > 1)
      params.set('page', String(newFilters.page));
    if (newFilters.limit && newFilters.limit !== 10)
      params.set('limit', String(newFilters.limit));
    setSearchParams(params);
  };

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    handleFilterChange({ ...filters, page });
  };

  // 삭제 확인 핸들러
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      await deleteProgram(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">프로그램 관리</h1>
          <p className="mt-1 text-sm text-gray-500">
            복지 프로그램을 조회하고 관리합니다.
          </p>
        </div>
        <Link
          to={ADMIN_ROUTES.PROGRAM_CREATE}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <span>➕</span>
          <span>새 프로그램</span>
        </Link>
      </div>

      {/* 필터 */}
      <ProgramFilters
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      {/* 에러 메시지 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">
            프로그램 목록을 불러오는데 실패했습니다.
          </p>
        </div>
      )}

      {/* 결과 요약 */}
      {data && (
        <div className="text-sm text-gray-500">
          총 {data.total}개의 프로그램
          {filters.search && ` (검색: "${filters.search}")`}
        </div>
      )}

      {/* 프로그램 테이블 */}
      <ProgramTable
        programs={data?.items ?? []}
        isLoading={isLoading}
        onDelete={(id: string, name: string) => setDeleteTarget({ id, name })}
      />

      {/* 페이지네이션 */}
      {data && data.totalPages > 1 && (
        <Pagination
          currentPage={data.page}
          totalPages={data.totalPages}
          onPageChange={handlePageChange}
        />
      )}

      {/* 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title="프로그램 삭제"
        message={`"${deleteTarget?.name}" 프로그램을 삭제하시겠습니까? 삭제된 프로그램은 복구할 수 없습니다.`}
        confirmLabel="삭제"
        confirmVariant="danger"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

export default ProgramListPage;
