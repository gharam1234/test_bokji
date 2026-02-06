/**
 * 프로그램 상세 훅
 * 단일 프로그램 조회
 */

import { useQuery } from '@tanstack/react-query';
import type { WelfareProgram } from '../types';
import { getProgram } from '../api/programApi';

/** useProgram 반환 타입 */
export interface UseProgramReturn {
  program: WelfareProgram | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * 프로그램 상세 훅
 */
export function useProgram(
  id: string | undefined,
  includeDeleted: boolean = false
): UseProgramReturn {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'program', id, includeDeleted],
    queryFn: () => getProgram(id!, includeDeleted),
    enabled: !!id,
    staleTime: 30 * 1000, // 30초
  });

  return {
    program: data ?? null,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}
