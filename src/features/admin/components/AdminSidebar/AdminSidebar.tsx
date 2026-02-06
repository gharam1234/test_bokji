/**
 * 관리자 사이드바 컴포넌트
 */

import { NavLink, useLocation } from 'react-router-dom';
import { ADMIN_ROUTES } from '../../constants/routes';

/** 사이드바 메뉴 아이템 */
interface SidebarItem {
  path: string;
  label: string;
  icon: string;
}

/** 사이드바 메뉴 목록 */
const SIDEBAR_ITEMS: SidebarItem[] = [
  {
    path: ADMIN_ROUTES.DASHBOARD,
    label: '대시보드',
    icon: '📊',
  },
  {
    path: ADMIN_ROUTES.PROGRAMS,
    label: '프로그램 관리',
    icon: '📋',
  },
  {
    path: ADMIN_ROUTES.AUDIT_LOGS,
    label: '감사 로그',
    icon: '📝',
  },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * 관리자 사이드바 컴포넌트
 */
export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const location = useLocation();

  return (
    <>
      {/* 모바일 오버레이 */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* 사이드바 */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:inset-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* 로고 */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏛️</span>
            <span className="font-bold text-lg">복지 관리자</span>
          </div>
          <button
            className="lg:hidden p-1 hover:bg-gray-800 rounded"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* 네비게이션 */}
        <nav className="mt-6 px-4">
          <ul className="space-y-2">
            {SIDEBAR_ITEMS.map((item) => {
              const isActive =
                item.path === ADMIN_ROUTES.DASHBOARD
                  ? location.pathname === item.path
                  : location.pathname.startsWith(item.path);

              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                      ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }
                    `}
                    onClick={() => onClose()}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* 하단 정보 */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
          <p className="text-xs text-gray-500 text-center">
            복지 관리 시스템 v1.0
          </p>
        </div>
      </aside>
    </>
  );
}

export default AdminSidebar;
