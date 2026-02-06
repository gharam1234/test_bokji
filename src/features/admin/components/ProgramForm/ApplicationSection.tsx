/**
 * 신청 정보 섹션 컴포넌트
 * 프로그램 신청 방법 및 일정 입력 영역
 */

import type { CreateProgramRequest, ApplicationMethod } from '../../types';

interface ApplicationSectionProps {
  /** 폼 데이터 */
  formData: CreateProgramRequest;
  /** 필드 업데이트 함수 */
  onUpdateField: <K extends keyof CreateProgramRequest>(
    field: K,
    value: CreateProgramRequest[K]
  ) => void;
  /** 신청 방법 업데이트 함수 */
  onUpdateApplicationMethod: (method: ApplicationMethod) => void;
}

/**
 * 신청 정보 섹션
 */
export function ApplicationSection({
  formData,
  onUpdateField,
  onUpdateApplicationMethod,
}: ApplicationSectionProps) {
  const method = formData.applicationMethod || {};

  const updateMethod = <K extends keyof ApplicationMethod>(
    field: K,
    value: ApplicationMethod[K]
  ) => {
    onUpdateApplicationMethod({
      ...method,
      [field]: value,
    });
  };

  return (
    <div className="space-y-6">
      {/* 신청 기간 */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">신청 기간</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              신청 시작일
            </label>
            <input
              type="date"
              value={formData.applicationStartDate || ''}
              onChange={(e) =>
                onUpdateField('applicationStartDate', e.target.value || null)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              신청 마감일
            </label>
            <input
              type="date"
              value={formData.applicationEndDate || ''}
              onChange={(e) =>
                onUpdateField('applicationEndDate', e.target.value || null)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.isAlwaysOpen}
            onChange={(e) => onUpdateField('isAlwaysOpen', e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">상시 모집</span>
        </label>
      </div>

      {/* 온라인 신청 */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">온라인 신청</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              신청 URL
            </label>
            <input
              type="url"
              value={method.online?.url || ''}
              onChange={(e) =>
                updateMethod('online', {
                  ...method.online,
                  url: e.target.value || '',
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              신청 방법 설명
            </label>
            <input
              type="text"
              value={method.online?.description || ''}
              onChange={(e) =>
                updateMethod('online', {
                  url: method.online?.url || '',
                  description: e.target.value || undefined,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="예: 복지로 사이트에서 신청"
            />
          </div>
        </div>
      </div>

      {/* 오프라인 신청 */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">오프라인 신청</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              신청 장소 주소
            </label>
            <input
              type="text"
              value={method.offline?.address || ''}
              onChange={(e) =>
                updateMethod('offline', {
                  ...method.offline,
                  address: e.target.value || '',
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="예: 주민센터, 고용센터 등"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              운영 시간
            </label>
            <input
              type="text"
              value={method.offline?.hours || ''}
              onChange={(e) =>
                updateMethod('offline', {
                  address: method.offline?.address || '',
                  hours: e.target.value || undefined,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="예: 평일 09:00-18:00"
            />
          </div>
        </div>
      </div>

      {/* 전화 신청 */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">전화 신청</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              전화번호
            </label>
            <input
              type="tel"
              value={method.phone?.number || ''}
              onChange={(e) =>
                updateMethod('phone', {
                  ...method.phone,
                  number: e.target.value || '',
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="예: 1577-0000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              상담 시간
            </label>
            <input
              type="text"
              value={method.phone?.hours || ''}
              onChange={(e) =>
                updateMethod('phone', {
                  number: method.phone?.number || '',
                  hours: e.target.value || undefined,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="예: 평일 09:00-18:00"
            />
          </div>
        </div>
      </div>

      {/* 필요 서류 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          필요 서류 (줄 바꿈으로 구분)
        </label>
        <textarea
          value={method.documents?.join('\n') || ''}
          onChange={(e) => {
            const docs = e.target.value
              .split('\n')
              .map((d) => d.trim())
              .filter(Boolean);
            updateMethod('documents', docs.length > 0 ? docs : undefined);
          }}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="예: 신분증 사본&#10;주민등록등본&#10;소득금액증명원"
        />
        <p className="mt-1 text-sm text-gray-500">각 서류를 새 줄에 입력하세요</p>
      </div>

      {/* 출처 URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          출처/참고 URL
        </label>
        <input
          type="url"
          value={formData.sourceUrl || ''}
          onChange={(e) => onUpdateField('sourceUrl', e.target.value || null)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="https://..."
        />
        <p className="mt-1 text-sm text-gray-500">
          프로그램 정보의 원본 출처 링크
        </p>
      </div>
    </div>
  );
}

export default ApplicationSection;
