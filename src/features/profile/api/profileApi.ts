/**
 * Profile API 클라이언트
 * 프로필 관련 API 호출 함수
 */

import {
  CreateProfileRequest,
  UpdateProfileRequest,
  SaveBasicInfoRequest,
  SaveIncomeRequest,
  SaveAddressRequest,
  SaveHouseholdRequest,
  SaveDraftRequest,
  CreateMemberRequest,
  UpdateMemberRequest,
  ProfileResponse,
  ProfileCompletionResponse,
  ProfileSuccessResponse,
  ProfileDraftResponse,
  HouseholdMemberResponse,
} from './profileApi.types';

// API 기본 URL (환경변수에서 가져오기)
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * API 요청 헬퍼 함수
 */
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `API Error: ${response.status}`);
  }

  // 204 No Content 처리
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// ==================== 프로필 CRUD API ====================

/**
 * 프로필 생성
 * POST /api/profile
 */
export async function createProfile(
  data: CreateProfileRequest,
): Promise<ProfileResponse> {
  return fetchApi<ProfileResponse>('/profile', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * 내 프로필 조회
 * GET /api/profile
 */
export async function getMyProfile(): Promise<ProfileResponse> {
  return fetchApi<ProfileResponse>('/profile');
}

/**
 * 특정 사용자 프로필 조회 (관리자용)
 * GET /api/profile/:userId
 */
export async function getProfileByUserId(
  userId: string,
): Promise<ProfileResponse> {
  return fetchApi<ProfileResponse>(`/profile/${userId}`);
}

/**
 * 프로필 전체 수정
 * PUT /api/profile
 */
export async function updateProfile(
  data: UpdateProfileRequest,
): Promise<ProfileResponse> {
  return fetchApi<ProfileResponse>('/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * 프로필 부분 수정
 * PATCH /api/profile
 */
export async function patchProfile(
  data: UpdateProfileRequest,
): Promise<ProfileResponse> {
  return fetchApi<ProfileResponse>('/profile', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/**
 * 프로필 삭제
 * DELETE /api/profile
 */
export async function deleteProfile(): Promise<{ success: boolean }> {
  return fetchApi<{ success: boolean }>('/profile', {
    method: 'DELETE',
  });
}

// ==================== 단계별 저장 API ====================

/**
 * 기본 정보 저장
 * PUT /api/profile/basic-info
 */
export async function saveBasicInfo(
  data: SaveBasicInfoRequest,
): Promise<ProfileSuccessResponse> {
  return fetchApi<ProfileSuccessResponse>('/profile/basic-info', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * 소득 정보 저장
 * PUT /api/profile/income
 */
export async function saveIncome(
  data: SaveIncomeRequest,
): Promise<ProfileSuccessResponse> {
  return fetchApi<ProfileSuccessResponse>('/profile/income', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * 주소 정보 저장
 * PUT /api/profile/address
 */
export async function saveAddress(
  data: SaveAddressRequest,
): Promise<ProfileSuccessResponse> {
  return fetchApi<ProfileSuccessResponse>('/profile/address', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * 가구원 정보 저장
 * PUT /api/profile/household
 */
export async function saveHousehold(
  data: SaveHouseholdRequest,
): Promise<ProfileSuccessResponse> {
  return fetchApi<ProfileSuccessResponse>('/profile/household', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// ==================== 완성도 API ====================

/**
 * 프로필 완성도 조회
 * GET /api/profile/completion
 */
export async function getCompletion(): Promise<ProfileCompletionResponse> {
  return fetchApi<ProfileCompletionResponse>('/profile/completion');
}

// ==================== 임시 저장 API ====================

/**
 * 임시 저장 데이터 조회
 * GET /api/profile/draft
 */
export async function getDraft(): Promise<ProfileDraftResponse | null> {
  try {
    return await fetchApi<ProfileDraftResponse>('/profile/draft');
  } catch {
    return null;
  }
}

/**
 * 임시 저장
 * POST /api/profile/draft
 */
export async function saveDraft(
  data: SaveDraftRequest,
): Promise<{ success: boolean; savedAt: string }> {
  return fetchApi<{ success: boolean; savedAt: string }>('/profile/draft', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * 임시 저장 삭제
 * DELETE /api/profile/draft
 */
export async function deleteDraft(): Promise<{ success: boolean }> {
  return fetchApi<{ success: boolean }>('/profile/draft', {
    method: 'DELETE',
  });
}

// ==================== 가구원 관리 API ====================

/**
 * 가구원 추가
 * POST /api/profile/household/member
 */
export async function addHouseholdMember(
  data: CreateMemberRequest,
): Promise<HouseholdMemberResponse> {
  return fetchApi<HouseholdMemberResponse>('/profile/household/member', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * 가구원 수정
 * PUT /api/profile/household/member/:id
 */
export async function updateHouseholdMember(
  memberId: string,
  data: UpdateMemberRequest,
): Promise<HouseholdMemberResponse> {
  return fetchApi<HouseholdMemberResponse>(`/profile/household/member/${memberId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * 가구원 삭제
 * DELETE /api/profile/household/member/:id
 */
export async function deleteHouseholdMember(
  memberId: string,
): Promise<{ success: boolean }> {
  return fetchApi<{ success: boolean }>(`/profile/household/member/${memberId}`, {
    method: 'DELETE',
  });
}

// ==================== API 객체로 내보내기 ====================

export const profileApi = {
  // 프로필 CRUD
  createProfile,
  getMyProfile,
  getProfileByUserId,
  updateProfile,
  patchProfile,
  deleteProfile,
  // 단계별 저장
  saveBasicInfo,
  saveIncome,
  saveAddress,
  saveHousehold,
  // 완성도
  getCompletion,
  // 임시 저장
  getDraft,
  saveDraft,
  deleteDraft,
  // 가구원 관리
  addHouseholdMember,
  updateHouseholdMember,
  deleteHouseholdMember,
};
