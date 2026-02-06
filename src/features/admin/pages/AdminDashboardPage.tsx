/**
 * 관리자 대시보드 페이지
 */

import { Link } from 'react-router-dom';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import { useAuditLogs } from '../../hooks/useAuditLogs';
import { StatsCard, AuditLogTable } from '../../components';
import { ADMIN_ROUTES } from '../../constants/routes';

/**
 * 관리자 대시보드 페이지 컴포넌트
 */
export function AdminDashboardPage() {
  const { stats, isLoading: statsLoading, error: statsError } = useDashboardStats();
  const { data: auditData, isLoading: auditLoading } = useAuditLogs({
    page: 1,
    limit: 5,
  });

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
        <p className="mt-1 text-sm text-gray-500">
          복지 프로그램 관리 시스템 현황을 확인하세요.
        </p>
      </div>

      {/* 통계 카드 섹션 */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          프로그램 현황
        </h2>

        {statsError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-red-600">
              통계를 불러오는데 실패했습니다.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="전체 프로그램"
            value={statsLoading ? '-' : (stats?.totalPrograms ?? 0)}
            icon="📋"
            description="등록된 복지 프로그램"
            variant="default"
          />
          <StatsCard
            title="활성 프로그램"
            value={statsLoading ? '-' : (stats?.activePrograms ?? 0)}
            icon="✅"
            description="현재 운영 중"
            variant="success"
          />
          <StatsCard
            title="신청 가능"
            value={statsLoading ? '-' : (stats?.openPrograms ?? 0)}
            icon="📝"
            description="신청 접수 중"
            variant="primary"
          />
          <StatsCard
            title="곧 마감"
            value={statsLoading ? '-' : (stats?.expiringPrograms ?? 0)}
            icon="⏰"
            description="7일 내 마감"
            variant="warning"
          />
        </div>
      </section>

      {/* 카테고리별 현황 */}
      {stats?.byCategory && stats.byCategory.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            카테고리별 현황
          </h2>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      카테고리
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                      프로그램 수
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {stats.byCategory.map((item: { category: string; count: number }) => (
                    <tr key={item.category} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {item.category}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">
                        {item.count}개
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* 최근 활동 */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">최근 활동</h2>
          <Link
            to={ADMIN_ROUTES.AUDIT_LOGS}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            전체 보기 →
          </Link>
        </div>
        <AuditLogTable
          logs={auditData?.items ?? []}
          isLoading={auditLoading}
          showEntityName
        />
      </section>

      {/* 빠른 작업 */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">빠른 작업</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            to={ADMIN_ROUTES.PROGRAM_CREATE}
            className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <span className="text-2xl">➕</span>
            <div>
              <p className="font-medium text-gray-900">새 프로그램 등록</p>
              <p className="text-sm text-gray-500">
                복지 프로그램을 새로 등록합니다
              </p>
            </div>
          </Link>
          <Link
            to={ADMIN_ROUTES.PROGRAMS}
            className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <span className="text-2xl">📋</span>
            <div>
              <p className="font-medium text-gray-900">프로그램 관리</p>
              <p className="text-sm text-gray-500">
                등록된 프로그램을 관리합니다
              </p>
            </div>
          </Link>
          <Link
            to={ADMIN_ROUTES.AUDIT_LOGS}
            className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <span className="text-2xl">📝</span>
            <div>
              <p className="font-medium text-gray-900">감사 로그</p>
              <p className="text-sm text-gray-500">
                시스템 변경 이력을 확인합니다
              </p>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default AdminDashboardPage;
