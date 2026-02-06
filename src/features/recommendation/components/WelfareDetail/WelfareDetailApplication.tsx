/**
 * 컴포넌트 - 복지 상세 신청 방법
 */

import React from 'react';
import { WelfareProgram } from '../../types';

interface WelfareDetailApplicationProps {
  program: WelfareProgram;
}

const METHOD_ICONS: Record<string, string> = {
  online: '💻',
  visit: '🏢',
  phone: '📞',
  mail: '📮',
};

type DisplayApplicationMethod = {
  type: 'online' | 'visit' | 'phone' | 'mail' | string;
  name?: string;
  description?: string;
  url?: string;
};

export function WelfareDetailApplication({ program }: WelfareDetailApplicationProps) {
  const legacyMethods = program.applicationMethods || [];
  const methods: DisplayApplicationMethod[] =
    legacyMethods.length > 0
      ? legacyMethods
      : [
          ...(program.applicationMethod?.online
            ? [
                {
                  type: 'online',
                  name: program.applicationMethod.online.siteName,
                  description: program.applicationMethod.online.instructions,
                  url: program.applicationMethod.online.url,
                },
              ]
            : []),
          ...(program.applicationMethod?.offline
            ? [
                {
                  type: 'visit',
                  name: program.applicationMethod.offline.location,
                  description: program.applicationMethod.offline.instructions ||
                    [program.applicationMethod.offline.location, program.applicationMethod.offline.address]
                      .filter(Boolean)
                      .join(' · '),
                },
              ]
            : []),
          ...(program.applicationMethod?.phone
            ? [
                {
                  type: 'phone',
                  description: program.applicationMethod.phone,
                },
              ]
            : []),
        ];

  const documents =
    (program.requiredDocuments || []).map((doc) =>
      typeof doc === 'string' ? { name: doc, isRequired: false } : doc,
    );
  
  if (methods.length === 0 && documents.length === 0) {
    return null;
  }
  
  return (
    <div className="border-t border-gray-200 bg-white px-4 py-6">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">신청 방법</h2>
      
      {/* 신청 방법 */}
      {methods.length > 0 && (
        <div className="mb-6 space-y-3">
          {methods.map((method, index) => (
            <div 
              key={index}
              className="rounded-lg border border-gray-200 p-4"
            >
              <div className="mb-2 flex items-center gap-2">
                <span className="text-lg">
                  {METHOD_ICONS[method.type] || '📋'}
                </span>
                <span className="font-medium text-gray-900">
                  {method.type === 'online' && '온라인 신청'}
                  {method.type === 'visit' && '방문 신청'}
                  {method.type === 'phone' && '전화 신청'}
                  {method.type === 'mail' && '우편 신청'}
                </span>
              </div>
              
              {(method.description || method.name) && (
                <p className="mb-2 text-sm text-gray-600">
                  {method.description || method.name}
                </p>
              )}
              
              {method.url && (
                <a
                  href={method.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                >
                  바로가기
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* 필요 서류 */}
      {documents.length > 0 && (
        <div>
          <h3 className="mb-3 font-medium text-gray-900">필요 서류</h3>
          <ul className="space-y-2">
            {documents.map((doc, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="text-gray-400">•</span>
                <div>
                  <span className="text-gray-700">{doc.name}</span>
                  {doc.isRequired && (
                    <span className="ml-1 text-red-500">(필수)</span>
                  )}
                  {doc.description && (
                    <p className="mt-0.5 text-xs text-gray-500">
                      {doc.description}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
