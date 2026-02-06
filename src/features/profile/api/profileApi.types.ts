/**
 * Profile API 타입 정의
 */

import {
  ProfileFormData,
  BasicInfoFormData,
  IncomeFormData,
  AddressFormData,
  HouseholdFormData,
  HouseholdMemberInput,
  ProfileStep,
} from '../types';

// ==================== 요청 타입 ====================

/** 프로필 생성/수정 요청 */
export type CreateProfileRequest = ProfileFormData;
export type UpdateProfileRequest = Partial<ProfileFormData>;

/** 단계별 저장 요청 */
export type SaveBasicInfoRequest = BasicInfoFormData;
export type SaveIncomeRequest = IncomeFormData;
export type SaveAddressRequest = AddressFormData;
export type SaveHouseholdRequest = HouseholdFormData;

/** 임시 저장 요청 */
export interface SaveDraftRequest {
  currentStep: ProfileStep;
  formData: Partial<ProfileFormData>;
}

/** 가구원 생성/수정 요청 */
export type CreateMemberRequest = HouseholdMemberInput;
export type UpdateMemberRequest = Partial<HouseholdMemberInput>;

// ==================== 응답 타입 재export ====================

export {
  ProfileResponse,
  ProfileCompletionResponse,
  ProfileSuccessResponse,
  ProfileDraftResponse,
  HouseholdMemberResponse,
} from '../types';

// ==================== API 에러 ====================

export interface ApiError {
  code: string;
  message: string;
  details?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiError;
}
