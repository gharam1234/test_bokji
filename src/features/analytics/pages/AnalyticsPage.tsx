/**
 * AnalyticsPage 컴포넌트
 * 분석 리포트 페이지
 */

import React from 'react';
import { AnalyticsDashboard } from '../components/AnalyticsDashboard';

/**
 * 분석 리포트 메인 페이지
 * /analytics 경로에서 렌더링
 */
export const AnalyticsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 페이지 컨테이너 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 페이지 설명 */}
        <div className="mb-6">
          <p className="text-gray-600">
            복지 서비스 이용 현황을 한눈에 확인하고, 맞춤 인사이트를 통해
            더 많은 혜택을 발견하세요.
          </p>
        </div>

        {/* 대시보드 */}
        <AnalyticsDashboard initialPeriod="month" />
      </div>
    </div>
  );
};

export default AnalyticsPage;
