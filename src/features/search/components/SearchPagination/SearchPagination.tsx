/**
 * SearchPagination 컴포넌트
 * 페이지네이션 UI
 */

import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import type { PaginationInfo } from '../../types';

interface SearchPaginationProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  siblingCount?: number;
}

export function SearchPagination({
  pagination,
  onPageChange,
  siblingCount = 1,
}: SearchPaginationProps) {
  const { page, totalPages, hasNext, hasPrev } = pagination;

  // 페이지 번호 배열 생성
  const pageNumbers = useMemo(() => {
    const totalPageNumbers = siblingCount + 5; // 첫/마지막 + 현재 + siblings + dots

    // 전체 페이지가 표시 가능 범위 내인 경우
    if (totalPages <= totalPageNumbers) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(page - siblingCount, 1);
    const rightSiblingIndex = Math.min(page + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
      return [...leftRange, 'dots', totalPages];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = Array.from(
        { length: rightItemCount },
        (_, i) => totalPages - rightItemCount + i + 1,
      );
      return [1, 'dots', ...rightRange];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = Array.from(
        { length: rightSiblingIndex - leftSiblingIndex + 1 },
        (_, i) => leftSiblingIndex + i,
      );
      return [1, 'dots', ...middleRange, 'dots', totalPages];
    }

    return [];
  }, [page, totalPages, siblingCount]);

  if (totalPages <= 1) return null;

  return (
    <nav
      className="flex items-center justify-center gap-1"
      role="navigation"
      aria-label="페이지네이션"
    >
      {/* 이전 버튼 */}
      <button
        onClick={() => hasPrev && onPageChange(page - 1)}
        disabled={!hasPrev}
        className={`flex items-center justify-center w-9 h-9 rounded-lg
                   transition-colors ${
                     hasPrev
                       ? 'text-gray-700 hover:bg-gray-100'
                       : 'text-gray-300 cursor-not-allowed'
                   }`}
        aria-label="이전 페이지"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      {/* 페이지 번호 */}
      {pageNumbers.map((pageNumber, index) => {
        if (pageNumber === 'dots') {
          return (
            <span
              key={`dots-${index}`}
              className="flex items-center justify-center w-9 h-9 text-gray-400"
            >
              <MoreHorizontal className="h-4 w-4" />
            </span>
          );
        }

        const pageNum = pageNumber as number;
        const isActive = pageNum === page;

        return (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className={`flex items-center justify-center w-9 h-9 rounded-lg
                       text-sm font-medium transition-colors ${
                         isActive
                           ? 'bg-blue-600 text-white'
                           : 'text-gray-700 hover:bg-gray-100'
                       }`}
            aria-label={`${pageNum} 페이지`}
            aria-current={isActive ? 'page' : undefined}
          >
            {pageNum}
          </button>
        );
      })}

      {/* 다음 버튼 */}
      <button
        onClick={() => hasNext && onPageChange(page + 1)}
        disabled={!hasNext}
        className={`flex items-center justify-center w-9 h-9 rounded-lg
                   transition-colors ${
                     hasNext
                       ? 'text-gray-700 hover:bg-gray-100'
                       : 'text-gray-300 cursor-not-allowed'
                   }`}
        aria-label="다음 페이지"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </nav>
  );
}

export default SearchPagination;
