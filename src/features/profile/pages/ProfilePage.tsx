/**
 * ProfilePage 컴포넌트
 * 프로필 조회 페이지
 */

import React from 'react';
import { useProfile } from '../hooks/useProfile';
import { ProfileView } from '../components/ProfileView';

/**
 * 프로필 조회 페이지
 */
export const ProfilePage: React.FC = () => {
  const { profile, isLoading, error } = useProfile();

  // 에러 처리
  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <svg className="w-12 h-12 mx-auto text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-lg font-semibold text-red-800 mb-2">
            프로필을 불러올 수 없습니다
          </h2>
          <p className="text-red-600 mb-4">{error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4">
      <ProfileView
        profile={profile}
        isLoading={isLoading}
        editPath="/profile/edit"
      />
    </div>
  );
};

export default ProfilePage;
