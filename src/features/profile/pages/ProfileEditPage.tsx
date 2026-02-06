/**
 * ProfileEditPage 컴포넌트
 * 프로필 등록/수정 페이지
 */

import React from 'react';
import { useProfile } from '../hooks/useProfile';
import { ProfileForm } from '../components/ProfileForm';

/**
 * 프로필 등록/수정 페이지
 */
export const ProfileEditPage: React.FC = () => {
  const { profile, isLoading, hasProfile } = useProfile();

  // 로딩 중
  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-8" />
          <div className="h-2 bg-gray-200 rounded w-full mb-8" />
          <div className="flex justify-between mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-10 h-10 bg-gray-200 rounded-full mb-2" />
                <div className="w-16 h-4 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
          <div className="bg-white shadow-sm rounded-xl p-6">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-6" />
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="mb-4">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
                <div className="h-10 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 수정 모드인 경우 기존 데이터를 초기값으로 변환
  const initialData = hasProfile && profile ? {
    basicInfo: {
      name: '',  // 마스킹된 데이터이므로 빈값 (재입력 필요)
      birthDate: profile.birthDate || '',
      gender: profile.gender || '',
      phone: '',  // 마스킹된 데이터이므로 빈값
      email: profile.email || '',
    },
    income: {
      type: profile.incomeType || '',
      annualAmount: 0,  // 마스킹된 데이터
    },
    address: {
      zipCode: '',
      sido: profile.sido || '',
      sigungu: profile.sigungu || '',
      roadAddress: '',  // 마스킹된 데이터
      jibunAddress: '',
      detail: '',
      buildingName: '',
    },
    household: {
      size: profile.householdSize || 1,
      members: profile.householdMembers || [],
    },
  } : undefined;

  return (
    <div className="py-8 px-4">
      <ProfileForm
        initialData={initialData}
        redirectTo="/profile"
      />

      {/* 안내 문구 (수정 모드) */}
      {hasProfile && (
        <div className="max-w-2xl mx-auto mt-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-yellow-800 mb-1">
              ⚠️ 개인정보 보호 안내
            </h4>
            <p className="text-sm text-yellow-700">
              개인정보 보호를 위해 이름, 연락처, 주소, 소득 정보는 마스킹 처리되어 표시됩니다.
              수정이 필요한 항목은 새로 입력해주세요.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileEditPage;
