/**
 * Navigation Configuration
 * 네비게이션 메뉴 설정
 */

import React from 'react';

// ==================== 아이콘 컴포넌트 ====================

export const HomeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
    />
  </svg>
);

export const SearchIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

export const StarIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
    />
  </svg>
);

export const ChartIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
    />
  </svg>
);

export const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
    />
  </svg>
);

export const UserIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
);

// ==================== 네비게이션 타입 정의 ====================

export interface NavigationItem {
  /** 라우트 경로 */
  path: string;
  /** 표시 레이블 */
  label: string;
  /** 아이콘 컴포넌트 */
  icon: React.FC<{ className?: string }>;
  /** 인증 필요 여부 */
  requiresAuth?: boolean;
  /** 뱃지 (새 기능 등) */
  badge?: string;
  /** 숨김 여부 */
  hidden?: boolean;
}

// ==================== 네비게이션 메뉴 설정 ====================

/**
 * 메인 네비게이션 메뉴 항목
 */
export const mainNavigation: NavigationItem[] = [
  {
    path: '/',
    label: '홈',
    icon: HomeIcon,
    requiresAuth: false,
  },
  {
    path: '/search',
    label: '복지 검색',
    icon: SearchIcon,
    requiresAuth: false,
  },
  {
    path: '/recommendations',
    label: '맞춤 추천',
    icon: SparklesIcon,
    requiresAuth: true,
  },
  {
    path: '/favorites',
    label: '즐겨찾기',
    icon: StarIcon,
    requiresAuth: true,
  },
  {
    path: '/analytics',
    label: '분석 리포트',
    icon: ChartIcon,
    requiresAuth: true,
    badge: 'NEW',
  },
];

/**
 * 사용자 메뉴 (드롭다운)
 */
export const userNavigation: NavigationItem[] = [
  {
    path: '/profile',
    label: '내 정보',
    icon: UserIcon,
    requiresAuth: true,
  },
];

// ==================== 헬퍼 함수 ====================

/**
 * 인증 상태에 따라 표시할 네비게이션 항목 필터링
 */
export function getVisibleNavigation(
  items: NavigationItem[],
  isAuthenticated: boolean,
): NavigationItem[] {
  return items.filter((item) => {
    if (item.hidden) return false;
    if (item.requiresAuth && !isAuthenticated) return false;
    return true;
  });
}

/**
 * 현재 경로가 활성화된 메뉴인지 확인
 */
export function isActiveRoute(itemPath: string, currentPath: string): boolean {
  if (itemPath === '/') {
    return currentPath === '/';
  }
  return currentPath.startsWith(itemPath);
}

/**
 * 네비게이션 항목 찾기
 */
export function findNavigationItem(path: string): NavigationItem | undefined {
  return [...mainNavigation, ...userNavigation].find(
    (item) => item.path === path,
  );
}

export default mainNavigation;
