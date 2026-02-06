/**
 * useBulkActions Hook
 * 다중 선택 및 일괄 작업 기능
 */

import { useState, useCallback, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bulkRemoveFavorites, favoritesQueryKeys } from '../api/favoritesApi';
import type { BulkDeleteResult } from '../types';

/**
 * useBulkActions Hook 반환 타입
 */
export interface UseBulkActionsReturn {
  // 선택 상태
  /** 선택된 ID Set */
  selectedIds: Set<string>;
  /** 선택된 개수 */
  selectedCount: number;
  /** 전체 선택 여부 */
  isAllSelected: boolean;
  /** 선택 모드 활성화 여부 */
  isSelectionMode: boolean;

  // 선택 액션
  /** 개별 항목 선택/해제 토글 */
  toggleSelect: (id: string) => void;
  /** 전체 선택 */
  selectAll: (ids: string[]) => void;
  /** 전체 선택 해제 */
  clearSelection: () => void;
  /** 선택 모드 활성화 */
  enterSelectionMode: () => void;
  /** 선택 모드 종료 */
  exitSelectionMode: () => void;
  /** ID가 선택되어 있는지 확인 */
  isSelected: (id: string) => boolean;

  // 일괄 삭제
  /** 선택된 항목 일괄 삭제 */
  bulkRemove: () => Promise<BulkDeleteResult>;
  /** 일괄 삭제 진행 중 여부 */
  isBulkRemoving: boolean;
  /** 일괄 삭제 에러 */
  bulkRemoveError: Error | null;
}

/**
 * 다중 선택 및 일괄 작업 Hook
 *
 * @example
 * ```tsx
 * const {
 *   selectedIds,
 *   toggleSelect,
 *   selectAll,
 *   clearSelection,
 *   bulkRemove,
 *   isBulkRemoving,
 * } = useBulkActions();
 *
 * // 항목 선택
 * toggleSelect('fav-123');
 *
 * // 전체 선택
 * selectAll(favorites.map(f => f.id));
 *
 * // 일괄 삭제
 * const result = await bulkRemove();
 * console.log(`${result.deletedCount}개 삭제됨`);
 * ```
 */
export function useBulkActions(): UseBulkActionsReturn {
  const queryClient = useQueryClient();

  // 선택된 ID 상태
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // 선택 모드 상태
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // 전체 항목 ID (전체 선택 비교용)
  const [allIds, setAllIds] = useState<string[]>([]);

  // 일괄 삭제 뮤테이션
  const bulkRemoveMutation = useMutation({
    mutationFn: (ids: string[]) => bulkRemoveFavorites({ ids }),
    onSuccess: (result) => {
      // 삭제 성공한 항목만 선택에서 제거
      const successIds = new Set(
        Array.from(selectedIds).filter(
          (id) => !result.failedIds.includes(id),
        ),
      );

      // 선택 초기화
      setSelectedIds(new Set());
      setIsSelectionMode(false);

      // 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: favoritesQueryKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: favoritesQueryKeys.stats(),
      });
    },
  });

  // 개별 선택/해제 토글
  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // 전체 선택
  const selectAll = useCallback((ids: string[]) => {
    setAllIds(ids);
    setSelectedIds(new Set(ids));
  }, []);

  // 선택 초기화
  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  // 선택 모드 진입
  const enterSelectionMode = useCallback(() => {
    setIsSelectionMode(true);
  }, []);

  // 선택 모드 종료
  const exitSelectionMode = useCallback(() => {
    setIsSelectionMode(false);
    setSelectedIds(new Set());
  }, []);

  // ID가 선택되어 있는지 확인
  const isSelected = useCallback(
    (id: string) => selectedIds.has(id),
    [selectedIds],
  );

  // 일괄 삭제 실행
  const bulkRemove = useCallback(async (): Promise<BulkDeleteResult> => {
    if (selectedIds.size === 0) {
      return { deletedCount: 0, failedIds: [] };
    }

    const ids = Array.from(selectedIds);
    return bulkRemoveMutation.mutateAsync(ids);
  }, [selectedIds, bulkRemoveMutation]);

  // 메모이제이션된 값
  const selectedCount = useMemo(() => selectedIds.size, [selectedIds]);

  const isAllSelected = useMemo(() => {
    if (allIds.length === 0) return false;
    return allIds.every((id) => selectedIds.has(id));
  }, [allIds, selectedIds]);

  return {
    // 선택 상태
    selectedIds,
    selectedCount,
    isAllSelected,
    isSelectionMode,

    // 선택 액션
    toggleSelect,
    selectAll,
    clearSelection,
    enterSelectionMode,
    exitSelectionMode,
    isSelected,

    // 일괄 삭제
    bulkRemove,
    isBulkRemoving: bulkRemoveMutation.isPending,
    bulkRemoveError: bulkRemoveMutation.error || null,
  };
}
