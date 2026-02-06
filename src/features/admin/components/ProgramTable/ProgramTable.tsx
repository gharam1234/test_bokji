/**
 * 프로그램 테이블 컴포넌트
 */

import { Link } from 'react-router-dom';
import type { WelfareProgram } from '../../types';
import { ADMIN_ROUTES } from '../../constants/routes';
import { getCategoryLabel, getCategoryIcon } from '../../constants/categories';
import { getTargetGroupLabel } from '../../constants/targetGroups';
import { formatDate, getActiveStatusLabel, getActiveStatusColorClass, truncateText } from '../../utils/formatters';

interface ProgramTableProps {
  programs: WelfareProgram[];
  isLoading: boolean;
  onDelete: (id: string, name: string) => void;
  onRestore?: (id: string) => void;
}

/**
 * 프로그램 테이블 컴포넌트
 */
export function ProgramTable({
  programs,
  isLoading,
  onDelete,
  onRestore,
}: ProgramTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          <span className="ml-3 text-gray-600">로딩 중...</span>
        </div>
      </div>
    );
  }

  if (programs.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="text-center text-gray-500">
          <span className="text-4xl block mb-2">📋</span>
          <p>프로그램이 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                프로그램명
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                카테고리
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                대상
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                상태
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                수정일
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                작업
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {programs.map((program) => (
              <ProgramTableRow
                key={program.id}
                program={program}
                onDelete={onDelete}
                onRestore={onRestore}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** 테이블 행 컴포넌트 */
function ProgramTableRow({
  program,
  onDelete,
  onRestore,
}: {
  program: WelfareProgram;
  onDelete: (id: string, name: string) => void;
  onRestore?: (id: string) => void;
}) {
  const isDeleted = !!program.deletedAt;

  return (
    <tr className={`hover:bg-gray-50 ${isDeleted ? 'bg-red-50' : ''}`}>
      {/* 프로그램명 */}
      <td className="px-4 py-4">
        <div className="flex flex-col">
          <Link
            to={ADMIN_ROUTES.PROGRAM_DETAIL(program.id)}
            className={`font-medium hover:text-blue-600 ${isDeleted ? 'text-gray-400 line-through' : 'text-gray-900'}`}
          >
            {truncateText(program.name, 40)}
          </Link>
          <span className="text-sm text-gray-500 mt-1">
            {truncateText(program.summary, 60)}
          </span>
        </div>
      </td>

      {/* 카테고리 */}
      <td className="px-4 py-4">
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-sm">
          {getCategoryIcon(program.category)} {getCategoryLabel(program.category)}
        </span>
      </td>

      {/* 대상 그룹 */}
      <td className="px-4 py-4">
        <div className="flex flex-wrap gap-1">
          {program.targetGroups.slice(0, 2).map((group) => (
            <span
              key={group}
              className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs"
            >
              {getTargetGroupLabel(group)}
            </span>
          ))}
          {program.targetGroups.length > 2 && (
            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
              +{program.targetGroups.length - 2}
            </span>
          )}
        </div>
      </td>

      {/* 상태 */}
      <td className="px-4 py-4">
        {isDeleted ? (
          <span className="inline-flex px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">
            삭제됨
          </span>
        ) : (
          <span
            className={`inline-flex px-2 py-1 rounded text-xs font-medium ${getActiveStatusColorClass(program.isActive)}`}
          >
            {getActiveStatusLabel(program.isActive)}
          </span>
        )}
      </td>

      {/* 수정일 */}
      <td className="px-4 py-4 text-sm text-gray-500">
        {formatDate(program.updatedAt)}
      </td>

      {/* 작업 */}
      <td className="px-4 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          {isDeleted ? (
            onRestore && (
              <button
                onClick={() => onRestore(program.id)}
                className="px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded"
              >
                복구
              </button>
            )
          ) : (
            <>
              <Link
                to={ADMIN_ROUTES.PROGRAM_EDIT(program.id)}
                className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
              >
                수정
              </Link>
              <button
                onClick={() => onDelete(program.id, program.name)}
                className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
              >
                삭제
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

export default ProgramTable;
