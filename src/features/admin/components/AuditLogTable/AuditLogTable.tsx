/**
 * 감사 로그 테이블 컴포넌트
 */

import { useState } from 'react';
import type { AuditLog } from '../../types';
import {
  formatRelativeTime,
  formatDateTime,
  getActionLabel,
  getActionColorClass,
} from '../../utils/formatters';

interface AuditLogTableProps {
  logs: AuditLog[];
  isLoading: boolean;
  showEntityName?: boolean;
}

/**
 * 감사 로그 테이블 컴포넌트
 */
export function AuditLogTable({
  logs,
  isLoading,
  showEntityName = true,
}: AuditLogTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

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

  if (logs.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="text-center text-gray-500">
          <span className="text-4xl block mb-2">📝</span>
          <p>감사 로그가 없습니다.</p>
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
                시간
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                관리자
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                액션
              </th>
              {showEntityName && (
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  대상
                </th>
              )}
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                상세
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {logs.map((log) => (
              <AuditLogRow
                key={log.id}
                log={log}
                isExpanded={expandedId === log.id}
                onToggle={() =>
                  setExpandedId(expandedId === log.id ? null : log.id)
                }
                showEntityName={showEntityName}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** 로그 행 컴포넌트 */
function AuditLogRow({
  log,
  isExpanded,
  onToggle,
  showEntityName,
}: {
  log: AuditLog;
  isExpanded: boolean;
  onToggle: () => void;
  showEntityName: boolean;
}) {
  return (
    <>
      <tr className="hover:bg-gray-50">
        {/* 시간 */}
        <td className="px-4 py-3">
          <div className="flex flex-col">
            <span className="text-sm text-gray-900">
              {formatRelativeTime(log.createdAt)}
            </span>
            <span className="text-xs text-gray-500">
              {formatDateTime(log.createdAt)}
            </span>
          </div>
        </td>

        {/* 관리자 */}
        <td className="px-4 py-3">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900">
              {log.adminName || '알 수 없음'}
            </span>
            {log.adminEmail && (
              <span className="text-xs text-gray-500">{log.adminEmail}</span>
            )}
          </div>
        </td>

        {/* 액션 */}
        <td className="px-4 py-3">
          <span
            className={`inline-flex px-2 py-1 rounded text-xs font-medium ${getActionColorClass(
              log.action
            )}`}
          >
            {getActionLabel(log.action)}
          </span>
        </td>

        {/* 대상 */}
        {showEntityName && (
          <td className="px-4 py-3">
            <div className="flex flex-col">
              <span className="text-sm text-gray-900">
                {log.entityName || log.entityId.slice(0, 8)}
              </span>
              <span className="text-xs text-gray-500">{log.entityType}</span>
            </div>
          </td>
        )}

        {/* 상세 버튼 */}
        <td className="px-4 py-3">
          {log.changes && log.changes.length > 0 && (
            <button
              onClick={onToggle}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {isExpanded ? '접기' : '변경 내역'}
            </button>
          )}
        </td>
      </tr>

      {/* 변경 내역 상세 */}
      {isExpanded && log.changes && (
        <tr>
          <td colSpan={showEntityName ? 5 : 4} className="px-4 py-3 bg-gray-50">
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">
                      필드
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">
                      이전 값
                    </th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">
                      변경 값
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {log.changes.map((change, index) => (
                    <tr key={index}>
                      <td className="px-3 py-2 font-medium text-gray-700">
                        {change.field}
                      </td>
                      <td className="px-3 py-2 text-red-600">
                        <code className="text-xs bg-red-50 px-1 py-0.5 rounded">
                          {formatValue(change.oldValue)}
                        </code>
                      </td>
                      <td className="px-3 py-2 text-green-600">
                        <code className="text-xs bg-green-50 px-1 py-0.5 rounded">
                          {formatValue(change.newValue)}
                        </code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

/** 값 포맷팅 */
function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '(없음)';
  if (typeof value === 'boolean') return value ? '예' : '아니오';
  if (Array.isArray(value)) return value.join(', ') || '(없음)';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

export default AuditLogTable;
