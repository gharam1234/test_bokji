/**
 * 컴포넌트 - 복지 상세 연락처
 */

import React from 'react';
import { WelfareProgram } from '../../types';

interface WelfareDetailContactProps {
  program: WelfareProgram;
}

export function WelfareDetailContact({ program }: WelfareDetailContactProps) {
  const contact = program.contactInfo;
  
  if (!contact) {
    return null;
  }
  
  return (
    <div className="border-t border-gray-200 bg-white px-4 py-6">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">문의처</h2>
      
      <div className="space-y-3">
        {/* 전화번호 */}
        {contact.phone && (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <div>
              <div className="text-xs text-gray-500">전화번호</div>
              <a 
                href={`tel:${contact.phone}`}
                className="font-medium text-gray-900 hover:text-blue-600"
              >
                {contact.phone}
              </a>
            </div>
          </div>
        )}
        
        {/* 이메일 */}
        {contact.email && (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
              <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <div className="text-xs text-gray-500">이메일</div>
              <a 
                href={`mailto:${contact.email}`}
                className="font-medium text-gray-900 hover:text-blue-600"
              >
                {contact.email}
              </a>
            </div>
          </div>
        )}
        
        {/* 웹사이트 */}
        {contact.website && (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
              <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </div>
            <div>
              <div className="text-xs text-gray-500">웹사이트</div>
              <a 
                href={contact.website}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-gray-900 hover:text-blue-600"
              >
                바로가기 →
              </a>
            </div>
          </div>
        )}
        
        {/* 운영 시간 */}
        {contact.operatingHours && (
          <div className="mt-4 rounded-lg bg-gray-50 p-3">
            <div className="text-xs text-gray-500">운영 시간</div>
            <div className="mt-1 text-sm text-gray-700">
              {contact.operatingHours}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
