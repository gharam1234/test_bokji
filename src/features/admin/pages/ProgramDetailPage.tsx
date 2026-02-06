/**
 * 프로그램 상세 페이지
 */

import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProgram } from '../../hooks/useProgram';
import { useAuditLogs } from '../../hooks/useAuditLogs';
import { useProgramMutation } from '../../hooks/useProgramMutation';
import { ConfirmDialog, AuditLogTable } from '../../components';
import { ADMIN_ROUTES } from '../../constants/routes';
import {
  formatDate,
  formatDateTime,
  getStatusLabel,
  getStatusColorClass,
} from '../../utils/formatters';

/**
 * 프로그램 상세 페이지 컴포넌트
 */
export function ProgramDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { program, isLoading, error } = useProgram(id!);
  const { data: auditData, isLoading: auditLoading } = useAuditLogs({
    entityType: 'PROGRAM',
    entityId: id,
    page: 1,
    limit: 10,
  });
  const { deleteProgram, isDeleting } = useProgramMutation();

  const handleDelete = async () => {
    if (!id) return;

    try {
      await deleteProgram(id);
      navigate(ADMIN_ROUTES.PROGRAMS);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
        <p className="text-red-600 mb-4">프로그램을 찾을 수 없습니다.</p>
        <Link
          to={ADMIN_ROUTES.PROGRAMS}
          className="text-blue-600 hover:underline"
        >
          목록으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link
              to={ADMIN_ROUTES.PROGRAMS}
              className="hover:text-blue-600"
            >
              프로그램 관리
            </Link>
            <span>/</span>
            <span>상세</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{program.name}</h1>
          <div className="mt-2 flex items-center gap-2">
            <span
              className={`inline-flex px-2 py-1 rounded text-xs font-medium ${getStatusColorClass(
                program.status
              )}`}
            >
              {getStatusLabel(program.status)}
            </span>
            {!program.isActive && (
              <span className="inline-flex px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">
                비활성
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to={ADMIN_ROUTES.PROGRAM_EDIT.replace(':id', id!)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            수정
          </Link>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            삭제
          </button>
        </div>
      </div>

      {/* 기본 정보 */}
      <section className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">기본 정보</h2>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoItem label="프로그램명" value={program.name} />
          <InfoItem label="카테고리" value={program.category} />
          <InfoItem label="지원 대상" value={program.targetGroup?.join(', ')} />
          <InfoItem
            label="지역 제한"
            value={program.region?.join(', ') || '전국'}
          />
          <InfoItem
            label="최대 연령"
            value={program.maxAge ? `${program.maxAge}세` : '-'}
          />
          <InfoItem
            label="최소 연령"
            value={program.minAge ? `${program.minAge}세` : '-'}
          />
        </div>
        <div className="p-4 border-t border-gray-200">
          <InfoItem label="설명" value={program.description} fullWidth />
        </div>
      </section>

      {/* 신청 정보 */}
      <section className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">신청 정보</h2>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoItem
            label="신청 시작일"
            value={
              program.applicationStartDate
                ? formatDate(program.applicationStartDate)
                : '-'
            }
          />
          <InfoItem
            label="신청 마감일"
            value={
              program.applicationEndDate
                ? formatDate(program.applicationEndDate)
                : '-'
            }
          />
          <InfoItem
            label="신청 방법"
            value={program.applicationMethod}
            fullWidth
          />
          <InfoItem
            label="필요 서류"
            value={program.requiredDocuments?.join(', ')}
            fullWidth
          />
        </div>
        {program.applicationUrl && (
          <div className="p-4 border-t border-gray-200">
            <InfoItem
              label="신청 URL"
              value={
                <a
                  href={program.applicationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {program.applicationUrl}
                </a>
              }
              fullWidth
            />
          </div>
        )}
      </section>

      {/* 추가 정보 */}
      <section className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">추가 정보</h2>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoItem label="담당 기관" value={program.organization} />
          <InfoItem label="담당자 연락처" value={program.contactInfo} />
          <InfoItem
            label="등록일"
            value={formatDateTime(program.createdAt)}
          />
          <InfoItem
            label="최종 수정일"
            value={formatDateTime(program.updatedAt)}
          />
        </div>
      </section>

      {/* 변경 이력 */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">변경 이력</h2>
        <AuditLogTable
          logs={auditData?.items ?? []}
          isLoading={auditLoading}
          showEntityName={false}
        />
      </section>

      {/* 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="프로그램 삭제"
        message={`"${program.name}" 프로그램을 삭제하시겠습니까? 삭제된 프로그램은 복구할 수 없습니다.`}
        confirmLabel="삭제"
        confirmVariant="danger"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}

/** 정보 항목 컴포넌트 */
function InfoItem({
  label,
  value,
  fullWidth = false,
}: {
  label: string;
  value: React.ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <div className={fullWidth ? 'md:col-span-2' : ''}>
      <dt className="text-sm font-medium text-gray-500 mb-1">{label}</dt>
      <dd className="text-sm text-gray-900">{value || '-'}</dd>
    </div>
  );
}

export default ProgramDetailPage;
