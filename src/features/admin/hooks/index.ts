/**
 * Hooks 모듈 진입점
 */

export { useAdminAuth, type UseAdminAuthReturn } from './useAdminAuth';
export { usePrograms, type UseProgramsOptions, type UseProgramsReturn } from './usePrograms';
export { useProgram, type UseProgramReturn } from './useProgram';
export { useProgramMutation } from './useProgramMutation';
export { useAuditLogs, useEntityAuditLogs, type UseAuditLogsOptions, type UseAuditLogsReturn } from './useAuditLogs';
export { useDashboardStats, useProgramStats } from './useDashboardStats';
