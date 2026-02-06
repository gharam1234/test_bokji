/**
 * 프로그램 수정 페이지
 */

import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProgram } from '../../hooks/useProgram';
import { useProgramMutation } from '../../hooks/useProgramMutation';
import { ProgramForm } from '../../components';
import { ADMIN_ROUTES } from '../../constants/routes';
import type { ProgramFormData } from '../../types';

/**
 * 프로그램 수정 페이지 컴포넌트
 */
export function ProgramEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { program, isLoading, error } = useProgram(id!);
  const { updateProgram, isUpdating, updateError } = useProgramMutation();

  const handleSubmit = async (data: ProgramFormData) => {
    if (!id || !program) return;

    try {
      await updateProgram({
        id,
        data,
        version: program.version,
      });
      navigate(ADMIN_ROUTES.PROGRAM_DETAIL.replace(':id', id));
    } catch (err) {
      // 에러는 mutation 훅에서 처리됨
      console.error('Update failed:', err);
    }
  };

  const handleCancel = () => {
    if (id) {
      navigate(ADMIN_ROUTES.PROGRAM_DETAIL.replace(':id', id));
    } else {
      navigate(ADMIN_ROUTES.PROGRAMS);
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

  // 폼 초기값 변환
  const initialData: ProgramFormData = {
    name: program.name,
    description: program.description,
    category: program.category,
    targetGroup: program.targetGroup ?? [],
    region: program.region ?? [],
    minAge: program.minAge,
    maxAge: program.maxAge,
    applicationStartDate: program.applicationStartDate,
    applicationEndDate: program.applicationEndDate,
    applicationMethod: program.applicationMethod,
    applicationUrl: program.applicationUrl,
    requiredDocuments: program.requiredDocuments ?? [],
    organization: program.organization,
    contactInfo: program.contactInfo,
    status: program.status,
    isActive: program.isActive,
  };

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Link to={ADMIN_ROUTES.PROGRAMS} className="hover:text-blue-600">
            프로그램 관리
          </Link>
          <span>/</span>
          <Link
            to={ADMIN_ROUTES.PROGRAM_DETAIL.replace(':id', id!)}
            className="hover:text-blue-600"
          >
            {program.name}
          </Link>
          <span>/</span>
          <span>수정</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">프로그램 수정</h1>
        <p className="mt-1 text-sm text-gray-500">
          프로그램 정보를 수정합니다.
        </p>
      </div>

      {/* 에러 메시지 */}
      {updateError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">
            {updateError instanceof Error
              ? updateError.message
              : '프로그램 수정에 실패했습니다.'}
          </p>
        </div>
      )}

      {/* 프로그램 폼 */}
      <ProgramForm
        initialData={initialData}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isUpdating}
        submitLabel="저장"
      />
    </div>
  );
}

export default ProgramEditPage;
