/**
 * Application Routes
 * 앱 전체 라우트 설정
 */

import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, RouteObject } from 'react-router-dom';
import HomePage from '../pages/HomePage';

// Lazy load pages for code splitting
const AnalyticsPage = lazy(
  () => import('../features/analytics/pages/AnalyticsPage'),
);

const FavoritesPage = lazy(
  () => import('../features/favorites/pages/FavoritesPage'),
);

const SearchPage = lazy(
  () => import('../features/search/pages/SearchPage'),
);

// Welfare Detail page
const WelfareDetailPage = lazy(
  () => import('../features/recommendation/pages/WelfareDetailPage').then((m) => ({ default: m.WelfareDetailPage })),
);

// Admin pages (lazy loaded)
const AdminLoginPage = lazy(
  () => import('../features/admin/pages/AdminLoginPage'),
);
const AdminDashboardPage = lazy(
  () => import('../features/admin/pages/AdminDashboardPage'),
);
const ProgramListPage = lazy(
  () => import('../features/admin/pages/ProgramListPage'),
);
const ProgramDetailPage = lazy(
  () => import('../features/admin/pages/ProgramDetailPage'),
);
const ProgramCreatePage = lazy(
  () => import('../features/admin/pages/ProgramCreatePage'),
);
const ProgramEditPage = lazy(
  () => import('../features/admin/pages/ProgramEditPage'),
);
const AuditLogPage = lazy(
  () => import('../features/admin/pages/AuditLogPage'),
);

// Admin components
const AdminLayout = lazy(
  () => import('../features/admin/components/AdminLayout/AdminLayout'),
);
const AdminGuard = lazy(
  () => import('../features/admin/guards/AdminGuard').then((m) => ({ default: m.AdminGuard })),
);

// 로딩 컴포넌트
const PageLoader: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
  </div>
);

// 라우트 메타 정보 타입
export interface RouteMeta {
  /** 인증 필요 여부 */
  requiresAuth?: boolean;
  /** 페이지 타이틀 */
  title?: string;
  /** 권한 요구사항 */
  roles?: string[];
}

// 확장된 라우트 타입
export interface AppRoute extends RouteObject {
  meta?: RouteMeta;
  children?: AppRoute[];
}

/**
 * 애플리케이션 라우트 정의
 */
export const routes: AppRoute[] = [
  // ==================== 공개 라우트 ====================
  {
    path: '/',
    element: <HomePage />,
    meta: {
      title: '홈',
      requiresAuth: false,
    },
  },

  // ==================== 인증 필요 라우트 ====================
  {
    path: '/analytics',
    element: (
      <Suspense fallback={<PageLoader />}>
        <AnalyticsPage />
      </Suspense>
    ),
    meta: {
      title: '분석 리포트',
      requiresAuth: true,
    },
  },
  {
    path: '/favorites',
    element: (
      <Suspense fallback={<PageLoader />}>
        <FavoritesPage />
      </Suspense>
    ),
    meta: {
      title: '내 즐겨찾기',
      requiresAuth: true,
    },
  },
  {
    path: '/search',
    element: (
      <Suspense fallback={<PageLoader />}>
        <SearchPage />
      </Suspense>
    ),
    meta: {
      title: '복지 검색',
      requiresAuth: false,
    },
  },
  {
    path: '/welfare/:programId',
    element: (
      <Suspense fallback={<PageLoader />}>
        <WelfareDetailPage />
      </Suspense>
    ),
    meta: {
      title: '복지 상세',
      requiresAuth: false,
    },
  },

  // ==================== 기타 라우트 (추후 추가) ====================
  // {
  //   path: '/search',
  //   element: <SearchWelfarePage />,
  //   meta: { title: '복지 검색', requiresAuth: false },
  // },
  // {
  //   path: '/recommendations',
  //   element: <RecommendationsPage />,
  //   meta: { title: '맞춤 추천', requiresAuth: true },
  // },
  // {
  //   path: '/profile',
  //   element: <ProfilePage />,
  //   meta: { title: '내 정보', requiresAuth: true },
  // },

  // ==================== 관리자 라우트 ====================
  {
    path: '/admin/login',
    element: (
      <Suspense fallback={<PageLoader />}>
        <AdminLoginPage />
      </Suspense>
    ),
    meta: {
      title: '관리자 로그인',
      requiresAuth: false,
    },
  },
  {
    path: '/admin',
    element: (
      <Suspense fallback={<PageLoader />}>
        <AdminGuard>
          <AdminLayout />
        </AdminGuard>
      </Suspense>
    ),
    meta: {
      title: '관리자',
      requiresAuth: true,
      roles: ['admin'],
    },
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<PageLoader />}>
            <AdminDashboardPage />
          </Suspense>
        ),
        meta: {
          title: '대시보드',
        },
      },
      {
        path: 'programs',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ProgramListPage />
          </Suspense>
        ),
        meta: {
          title: '프로그램 관리',
        },
      },
      {
        path: 'programs/new',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ProgramCreatePage />
          </Suspense>
        ),
        meta: {
          title: '프로그램 등록',
        },
      },
      {
        path: 'programs/:id',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ProgramDetailPage />
          </Suspense>
        ),
        meta: {
          title: '프로그램 상세',
        },
      },
      {
        path: 'programs/:id/edit',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ProgramEditPage />
          </Suspense>
        ),
        meta: {
          title: '프로그램 수정',
        },
      },
      {
        path: 'audit-logs',
        element: (
          <Suspense fallback={<PageLoader />}>
            <AuditLogPage />
          </Suspense>
        ),
        meta: {
          title: '감사 로그',
        },
      },
    ] as AppRoute[],
  },

  // ==================== 404 처리 ====================
  {
    path: '*',
    // element: <NotFoundPage />,
    meta: {
      title: '페이지를 찾을 수 없음',
      requiresAuth: false,
    },
  },
];

/**
 * 인증이 필요한 라우트인지 확인
 */
export function isProtectedRoute(pathname: string): boolean {
  const route = routes.find((r) => r.path === pathname);
  return route?.meta?.requiresAuth ?? false;
}

/**
 * 라우트에서 페이지 타이틀 가져오기
 */
export function getRouteTitle(pathname: string): string {
  const route = routes.find((r) => r.path === pathname);
  return route?.meta?.title ?? '복지 서비스';
}

/**
 * React Router용 라우터 생성
 */
export const router = createBrowserRouter(routes as RouteObject[]);

export default routes;
