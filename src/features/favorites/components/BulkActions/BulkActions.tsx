/**
 * BulkActions 컴포넌트
 * 일괄 작업 툴바
 */

import React, { memo, useCallback, useState } from 'react';
import { Trash2, X, Loader2 } from 'lucide-react';
import { SelectionCheckbox } from './SelectionCheckbox';

/**
 * BulkActions Props
 */
export interface BulkActionsProps {
  /** 선택된 개수 */
  selectedCount: number;
  /** 전체 개수 */
  totalCount: number;
  /** 전체 선택 여부 */
  isAllSelected: boolean;
  /** 전체 선택/해제 핸들러 */
  onSelectAll: (selected: boolean) => void;
  /** 선택 취소 핸들러 */
  onClearSelection: () => void;
  /** 일괄 삭제 핸들러 */
  onBulkDelete: () => Promise<void>;
  /** 삭제 진행 중 여부 */
  isDeleting?: boolean;
}

/**
 * 일괄 작업 툴바 컴포넌트
 *
 * @example
 * ```tsx
 * <BulkActions
 *   selectedCount={selectedCount}
 *   totalCount={favorites.length}
 *   isAllSelected={isAllSelected}
 *   onSelectAll={(selected) => selected ? selectAll(ids) : clearSelection()}
 *   onClearSelection={clearSelection}
 *   onBulkDelete={bulkRemove}
 *   isDeleting={isBulkRemoving}
 * />
 * ```
 */
export const BulkActions = memo<BulkActionsProps>(function BulkActions({
  selectedCount,
  totalCount,
  isAllSelected,
  onSelectAll,
  onClearSelection,
  onBulkDelete,
  isDeleting = false,
}) {
  const [showConfirm, setShowConfirm] = useState(false);

  const isPartialSelected = selectedCount > 0 && !isAllSelected;

  // 삭제 확인 모달 열기
  const handleDeleteClick = useCallback(() => {
    setShowConfirm(true);
  }, []);

  // 삭제 취소
  const handleCancelDelete = useCallback(() => {
    setShowConfirm(false);
  }, []);

  // 삭제 확정
  const handleConfirmDelete = useCallback(async () => {
    await onBulkDelete();
    setShowConfirm(false);
  }, [onBulkDelete]);

  if (selectedCount === 0) {
    return null;
  }

  return (
    <>
      {/* 툴바 */}
      <div className="flex items-center justify-between py-3 px-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center gap-4">
          {/* 전체 선택 체크박스 */}
          <SelectionCheckbox
            isAllSelected={isAllSelected}
            isPartialSelected={isPartialSelected}
            onChange={onSelectAll}
          />

          {/* 선택 개수 */}
          <span className="text-sm font-medium text-blue-700">
            {selectedCount}개 선택됨
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* 삭제 버튼 */}
          <button
            type="button"
            onClick={handleDeleteClick}
            disabled={isDeleting}
            className="
              flex items-center gap-1.5 px-3 py-1.5
              bg-red-500 text-white text-sm font-medium rounded-lg
              hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors
            "
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            삭제
          </button>

          {/* 선택 취소 버튼 */}
          <button
            type="button"
            onClick={onClearSelection}
            className="
              flex items-center gap-1.5 px-3 py-1.5
              bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300
              hover:bg-gray-50 transition-colors
            "
          >
            <X className="w-4 h-4" />
            취소
          </button>
        </div>
      </div>

      {/* 삭제 확인 모달 */}
      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={handleCancelDelete}
        >
          <div
            className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              즐겨찾기 삭제
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              선택한 {selectedCount}개의 즐겨찾기를 삭제하시겠습니까?
              <br />
              삭제된 항목은 복구할 수 없습니다.
            </p>
            <div className="flex items-center gap-3 justify-end">
              <button
                type="button"
                onClick={handleCancelDelete}
                className="
                  px-4 py-2 text-sm font-medium text-gray-700
                  bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors
                "
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="
                  flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white
                  bg-red-500 rounded-lg hover:bg-red-600
                  disabled:opacity-50 disabled:cursor-not-allowed transition-colors
                "
              >
                {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
});
