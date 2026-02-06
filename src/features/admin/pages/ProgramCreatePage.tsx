/**
 * 프로그램 생성 페이지
 */

import { useNavigate, Link } from 'react-router-dom';
import { useProgramMutation } from '../../hooks/useProgramMutation';
import { ProgramForm } from '../../components';
import { ADMIN_ROUTES } from '../../constants/routes';
import type { ProgramFormData } from '../../types';

/**
 * 프로그램 생성 페이지 컴포넌트
 */
export function ProgramCreatePage() {
  const navigate = useNavigate();
  const { createProgram, isCreating, createError } = useProgramMutation();

  const handleSubmit = async (data: ProgramFormData) => {
    try {
      const result = await createProgram(data);
      navigate(ADMIN_ROUTES.PROGRAM_DETAIL.replace(':id', result.id));
    } catch (err) {
      // 에러는 mutation 훅에서 처리됨
      console.error('Create failed:', err);
    }
  };

  const handleCancel = () => {
    navigate(ADMIN_ROUTES.PROGRAMS);
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
          <span>새 프로그램</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">새 프로그램 등록</h1>
        <p className="mt-1 text-sm text-gray-500">
          새로운 복지 프로그램 정보를 입력합니다.
        </p>
      </div>

      {/* 에러 메시지 */}
      {createError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">
            {createError instanceof Error
              ? createError.message
              : '프로그램 생성에 실패했습니다.'}
          </p>
        </div>
      )}

      {/* 프로그램 폼 */}
      <ProgramForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isCreating}
      />
    </div>
  );
}

export default ProgramCreatePage;
