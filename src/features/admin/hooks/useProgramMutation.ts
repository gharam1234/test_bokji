/**
 * 프로그램 뮤테이션 훅
 * 프로그램 생성, 수정, 삭제, 복구
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateProgramRequest, UpdateProgramRequest, WelfareProgram } from '../types';
import {
  createProgram,
  updateProgram,
  deleteProgram,
  restoreProgram,
} from '../api/programApi';

/**
 * 프로그램 뮤테이션 훅
 */
export function useProgramMutation() {
  const queryClient = useQueryClient();

  /**
   * 프로그램 생성
   */
  const createProgramMutation = useMutation({
    mutationFn: (data: CreateProgramRequest) => createProgram(data),
    onSuccess: () => {
      // 프로그램 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['admin', 'programs'] });
    },
  });

  /**
   * 프로그램 수정
   */
  const updateProgramMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProgramRequest }) =>
      updateProgram(id, data),
    onSuccess: (updatedProgram: WelfareProgram) => {
      // 프로그램 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['admin', 'programs'] });
      // 해당 프로그램 상세 캐시 업데이트
      queryClient.setQueryData(
        ['admin', 'program', updatedProgram.id, false],
        updatedProgram
      );
    },
  });

  /**
   * 프로그램 삭제
   */
  const deleteProgramMutation = useMutation({
    mutationFn: (id: string) => deleteProgram(id),
    onSuccess: (_: void, id: string) => {
      // 프로그램 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['admin', 'programs'] });
      // 해당 프로그램 상세 캐시 제거
      queryClient.removeQueries({ queryKey: ['admin', 'program', id] });
    },
  });

  /**
   * 프로그램 복구
   */
  const restoreProgramMutation = useMutation({
    mutationFn: (id: string) => restoreProgram(id),
    onSuccess: () => {
      // 프로그램 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['admin', 'programs'] });
    },
  });

  return {
    createProgram: createProgramMutation,
    updateProgram: updateProgramMutation,
    deleteProgram: deleteProgramMutation,
    restoreProgram: restoreProgramMutation,
  };
}
