/**
 * 관리자 레이아웃 컴포넌트
 */

import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from '../AdminSidebar';
import { AdminHeader } from '../AdminHeader';
import { AdminGuard } from '../../guards/AdminGuard';

/**
 * 관리자 레이아웃 컴포넌트
 * 사이드바, 헤더, 메인 콘텐츠 영역 포함
 */
export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50 flex">
        {/* 사이드바 */}
        <AdminSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* 메인 영역 */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* 헤더 */}
          <AdminHeader onMenuToggle={() => setSidebarOpen(true)} />

          {/* 콘텐츠 */}
          <main className="flex-1 p-4 lg:p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}

export default AdminLayout;
