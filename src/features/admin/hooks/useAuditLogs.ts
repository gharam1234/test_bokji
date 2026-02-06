/**
 * 감사 로그 훅
 * 감사 로그 목록 조회
 */

import { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { AuditLog, AuditLogParams, PaginationMeta, EntityType } from '../types';
import { getAuditLogs, getEntityAuditLogs } from '../api/auditLogApi';

/** 기본 파라미터 */
const DEFAULT_PARAMS: AuditLogParams = {
  page: 1,
  limit: 20,
};

/** useAuditLogs 옵션 */
export interface UseAuditLogsOptions {
  entityId?: string;
  entityType?: EntityType;
  initialParams?: Partial<AuditLogParams>;
}

/** useAuditLogs 반환 타입 */
export interface UseAuditLogsReturn {
  logs: AuditLog[];
  meta: PaginationMeta | null;
  isLoading: boolean;
  error: Error | null;
  params: AuditLogParams;
  setParams: (params: Partial<AuditLogParams>) => void;
  refetch: () => void;
}

/**
 * 감사 로그 훅
 */
export function useAuditLogs(options: UseAuditLogsOptions = {}): UseAuditLogsReturn {
  const { entityId, entityType, initialParams = {} } = options;
  
  const [params, setParamsState] = useState<AuditLogParams>({
    ...DEFAULT_PARAMS,
    ...initialParams,
    entityId,
    entityType,
  });

  // 쿼리 키 생성
  const queryKey = useMemo(
    () => ['admin', 'audit-logs', params],
    [params]
  );

  // 감사 로그 조회
  const { data, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: () => getAuditLogs(params),
    staleTime: 30 * 1000, // 30초
  });

  /**
   * 파라미터 업데이트
   */
  const setParams = useCallback((newParams: Partial<AuditLogParams>) => {
    setParamsState((prev) => ({
      ...prev,
      ...newParams,
    }));
  }, []);

  return {
    logs: data?.data ?? [],
    meta: data?.meta ?? null,
    isLoading,
    error: error as Error | null,
    params,
    setParams,
    refetch,
  };
}

/**
 * 특정 엔티티의 감사 로그 훅
 */
export function useEntityAuditLogs(
  entityType: string,
  entityId: string | undefined
) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'audit-logs', 'entity', entityType, entityId],
    queryFn: () => getEntityAuditLogs(entityType, entityId!),
    enabled: !!entityId,
    staleTime: 30 * 1000,
  });

  return {
    logs: data ?? [],
    isLoading,
    error: error as Error | null,
    refetch,
  };
}
