/**
 * 관리자 헤더 컴포넌트
 */

import { useAdminAuth } from '../../hooks/useAdminAuth';

interface AdminHeaderProps {
  onMenuToggle: () => void;
}

/**
 * 관리자 헤더 컴포넌트
 */
export function AdminHeader({ onMenuToggle }: AdminHeaderProps) {
  const { admin, logout, isLoading } = useAdminAuth();

  const handleLogout = async () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      await logout();
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-6">
      {/* 좌측: 햄버거 메뉴 (모바일) */}
      <div className="flex items-center gap-4">
        <button
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
          onClick={onMenuToggle}
          aria-label="메뉴 열기"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        
        <h1 className="text-lg font-semibold text-gray-800 hidden sm:block">
          관리자 대시보드
        </h1>
      </div>

      {/* 우측: 관리자 정보 및 로그아웃 */}
      <div className="flex items-center gap-4">
        {admin && (
          <div className="flex items-center gap-3">
            {/* 관리자 정보 */}
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-medium text-gray-900">
                {admin.name}
              </span>
              <span className="text-xs text-gray-500">{admin.email}</span>
            </div>

            {/* 아바타 */}
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
              {admin.name.charAt(0).toUpperCase()}
            </div>

            {/* 로그아웃 버튼 */}
            <button
              onClick={handleLogout}
              disabled={isLoading}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? '...' : '로그아웃'}
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default AdminHeader;
