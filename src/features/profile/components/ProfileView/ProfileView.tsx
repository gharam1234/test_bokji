/**
 * ProfileView 컴포넌트
 * 프로필 조회 화면
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  ProfileResponse,
  GENDER_LABELS,
  INCOME_TYPE_LABELS,
  INCOME_BRACKET_LABELS,
  RELATION_LABELS,
} from '../../types';
import { ProgressBar } from '../ProgressBar';
import { profileViewStyles as styles } from './ProfileView.styles';

interface ProfileViewProps {
  /** 프로필 데이터 */
  profile: ProfileResponse | null;
  /** 로딩 상태 */
  isLoading?: boolean;
  /** 수정 페이지 경로 */
  editPath?: string;
}

/**
 * 프로필 조회 컴포넌트
 */
export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  isLoading = false,
  editPath = '/profile/edit',
}) => {
  // 로딩 상태
  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-8" />
          <div className="bg-white shadow-sm rounded-xl p-6 mb-6">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4" />
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i}>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 프로필이 없는 경우
  if (!profile) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <svg className={styles.emptyIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <h2 className={styles.emptyTitle}>프로필이 등록되지 않았습니다</h2>
          <p className={styles.emptyDescription}>
            프로필을 등록하면 맞춤형 복지 서비스를 추천받을 수 있습니다.
          </p>
          <Link to={editPath} className={styles.createButton}>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            프로필 등록하기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* 헤더 */}
      <div className={styles.header}>
        <h1 className={styles.title}>내 프로필</h1>
        <Link to={editPath} className={styles.editButton}>
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          수정
        </Link>
      </div>

      {/* 프로필 완성도 */}
      <div className={styles.completionSection}>
        <h3 className={styles.completionTitle}>프로필 완성도</h3>
        <ProgressBar value={profile.completionRate} showLabel size="lg" />
        {profile.completionRate < 100 && (
          <div className={styles.infoBox}>
            <p className={styles.infoText}>
              💡 프로필을 완성하면 더 정확한 복지 서비스 추천을 받을 수 있습니다.
            </p>
          </div>
        )}
      </div>

      {/* 기본 정보 */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>기본 정보</h2>
        </div>
        <div className={styles.sectionContent}>
          <div className={styles.grid}>
            <div className={styles.field}>
              <span className={styles.label}>이름</span>
              <span className={`${styles.value} ${styles.maskedValue}`}>
                {profile.name || '-'}
              </span>
            </div>
            <div className={styles.field}>
              <span className={styles.label}>성별</span>
              <span className={styles.value}>
                {profile.gender ? GENDER_LABELS[profile.gender] : '-'}
              </span>
            </div>
            <div className={styles.field}>
              <span className={styles.label}>생년월일</span>
              <span className={styles.value}>
                {profile.birthDate || '-'}
              </span>
            </div>
            <div className={styles.field}>
              <span className={styles.label}>연락처</span>
              <span className={`${styles.value} ${styles.maskedValue}`}>
                {profile.phone || '-'}
              </span>
            </div>
            <div className={styles.field}>
              <span className={styles.label}>이메일</span>
              <span className={styles.value}>
                {profile.email || '-'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 소득 정보 */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>소득 정보</h2>
        </div>
        <div className={styles.sectionContent}>
          <div className={styles.grid}>
            <div className={styles.field}>
              <span className={styles.label}>소득 유형</span>
              <span className={styles.value}>
                {profile.incomeType ? INCOME_TYPE_LABELS[profile.incomeType] : '-'}
              </span>
            </div>
            <div className={styles.field}>
              <span className={styles.label}>연 소득</span>
              <span className={`${styles.value} ${styles.maskedValue}`}>
                {profile.annualIncome || '-'}
              </span>
            </div>
            <div className={styles.field}>
              <span className={styles.label}>소득 구간</span>
              <span className={styles.badge}>
                {profile.incomeBracket ? INCOME_BRACKET_LABELS[profile.incomeBracket] : '-'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 주소 정보 */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>주소 정보</h2>
        </div>
        <div className={styles.sectionContent}>
          <div className="space-y-4">
            <div className={styles.field}>
              <span className={styles.label}>주소</span>
              <span className={`${styles.value} ${styles.maskedValue}`}>
                {profile.address || '-'}
              </span>
            </div>
            <div className={styles.grid}>
              <div className={styles.field}>
                <span className={styles.label}>시/도</span>
                <span className={styles.value}>{profile.sido || '-'}</span>
              </div>
              <div className={styles.field}>
                <span className={styles.label}>시/군/구</span>
                <span className={styles.value}>{profile.sigungu || '-'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 가구원 정보 */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>가구원 정보</h2>
        </div>
        <div className={styles.sectionContent}>
          <div className="mb-4">
            <span className={styles.label}>가구원 수</span>
            <span className={styles.valueLarge}>{profile.householdSize}인 가구</span>
          </div>

          {profile.householdMembers && profile.householdMembers.length > 0 ? (
            <div className="space-y-3">
              <span className={styles.label}>가구원 목록</span>
              {profile.householdMembers.map((member, index) => (
                <div key={index} className={styles.memberCard}>
                  <div className={styles.memberInfo}>
                    <p className={styles.memberName}>{member.name}</p>
                    <p className={styles.memberDetails}>
                      <span className={styles.memberBadge}>
                        {RELATION_LABELS[member.relation]}
                      </span>
                      <span className={styles.memberBadge}>
                        {GENDER_LABELS[member.gender]}
                      </span>
                      {member.hasDisability && (
                        <span className={`${styles.memberBadge} bg-blue-100 text-blue-700`}>
                          장애
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : profile.householdSize > 1 ? (
            <p className="text-gray-500 text-sm">
              가구원 상세 정보가 등록되지 않았습니다.
            </p>
          ) : null}
        </div>
      </section>

      {/* 마지막 수정일 */}
      <p className="text-sm text-gray-500 text-center mt-8">
        마지막 수정: {new Date(profile.updatedAt).toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </p>
    </div>
  );
};

export default ProfileView;
