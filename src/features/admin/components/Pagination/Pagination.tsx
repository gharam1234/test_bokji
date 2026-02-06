/**
 * 페이지네이션 컴포넌트
 */

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * 페이지네이션 컴포넌트
 */
export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  hasNext,
  hasPrev,
}: PaginationProps) {
  // 표시할 페이지 번호 계산
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 항상 첫 페이지
      pages.push(1);

      // 시작과 끝 계산
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      // 현재 페이지가 끝에 가까우면 조정
      if (currentPage <= 3) {
        end = 4;
      }
      // 현재 페이지가 끝에 가까우면 조정
      if (currentPage >= totalPages - 2) {
        start = totalPages - 3;
      }

      // 첫 페이지와 시작 사이에 갭이 있으면 ... 추가
      if (start > 2) {
        pages.push('...');
      }

      // 중간 페이지들
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // 끝과 마지막 페이지 사이에 갭이 있으면 ... 추가
      if (end < totalPages - 1) {
        pages.push('...');
      }

      // 항상 마지막 페이지
      pages.push(totalPages);
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <nav className="flex items-center justify-center gap-1">
      {/* 이전 버튼 */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPrev}
        className={`
          px-3 py-2 rounded-lg border text-sm font-medium transition-colors
          ${
            hasPrev
              ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
              : 'border-gray-200 text-gray-400 cursor-not-allowed'
          }
        `}
      >
        이전
      </button>

      {/* 페이지 번호 */}
      <div className="flex items-center gap-1">
        {getPageNumbers().map((page, index) => {
          if (page === '...') {
            return (
              <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-400">
                ...
              </span>
            );
          }

          const pageNum = page as number;
          const isActive = pageNum === currentPage;

          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`
                w-10 h-10 rounded-lg text-sm font-medium transition-colors
                ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              {pageNum}
            </button>
          );
        })}
      </div>

      {/* 다음 버튼 */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNext}
        className={`
          px-3 py-2 rounded-lg border text-sm font-medium transition-colors
          ${
            hasNext
              ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
              : 'border-gray-200 text-gray-400 cursor-not-allowed'
          }
        `}
      >
        다음
      </button>
    </nav>
  );
}

export default Pagination;
