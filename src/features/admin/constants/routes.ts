/**
 * 관리자 라우트 상수
 */

/** 관리자 라우트 경로 */
export const ADMIN_ROUTES = {
  /** 로그인 */
  LOGIN: '/admin/login',
  
  /** 대시보드 메인 */
  DASHBOARD: '/admin',
  
  /** 프로그램 관리 */
  PROGRAMS: '/admin/programs',
  PROGRAM_CREATE: '/admin/programs/new',
  PROGRAM_DETAIL: (id: string) => `/admin/programs/${id}`,
  PROGRAM_EDIT: (id: string) => `/admin/programs/${id}/edit`,
  
  /** 감사 로그 */
  AUDIT_LOGS: '/admin/audit-logs',
  
  /** 설정 (향후 확장) */
  SETTINGS: '/admin/settings',
} as const;

/** API 엔드포인트 */
export const ADMIN_API = {
  /** 인증 */
  AUTH: {
    LOGIN: '/api/admin/auth/login',
    LOGOUT: '/api/admin/auth/logout',
    ME: '/api/admin/auth/me',
    REFRESH: '/api/admin/auth/refresh',
  },
  
  /** 프로그램 관리 */
  PROGRAMS: {
    BASE: '/api/admin/programs',
    DETAIL: (id: string) => `/api/admin/programs/${id}`,
    RESTORE: (id: string) => `/api/admin/programs/${id}/restore`,
  },
  
  /** 감사 로그 */
  AUDIT_LOGS: {
    BASE: '/api/admin/audit-logs',
    ENTITY: (type: string, id: string) => `/api/admin/audit-logs/entity/${type}/${id}`,
    RECENT: '/api/admin/audit-logs/recent',
  },
  
  /** 통계 */
  STATS: {
    OVERVIEW: '/api/admin/stats/overview',
    PROGRAMS: '/api/admin/stats/programs',
  },
} as const;

/** 로컬 스토리지 키 */
export const ADMIN_STORAGE_KEYS = {
  ACCESS_TOKEN: 'admin_access_token',
  ADMIN_INFO: 'admin_info',
} as const;
