/**
 * Profile Feature 모듈
 *
 * 사용자 프로필 관리 기능을 제공합니다.
 * - 다단계 프로필 등록 폼
 * - 자동 저장 및 임시 저장
 * - 민감 정보 암호화
 * - 소득 구간 자동 계산
 * - 주소 검색 (다음 우편번호)
 * - 가구원 관리
 */

// Types
export * from './types';

// API
export { profileApi } from './api/profileApi';
export { addressApi } from './api/addressApi';

// Hooks
export { useProfile } from './hooks/useProfile';
export { useProfileForm } from './hooks/useProfileForm';
export { useAddressSearch } from './hooks/useAddressSearch';
export { useAutoSave } from './hooks/useAutoSave';
export { useIncomeBracket } from './hooks/useIncomeBracket';

// Components
export {
  StepIndicator,
  ProgressBar,
  BasicInfoForm,
  IncomeForm,
  AddressForm,
  HouseholdForm,
  ProfileForm,
  ProfileView,
} from './components';

// Pages
export { ProfilePage, ProfileEditPage } from './pages';

// Schemas (Zod validation)
export {
  basicInfoSchema,
  incomeSchema,
  addressSchema,
  householdMemberSchema,
  householdSchema,
  profileSchema,
} from './schemas/profileSchema';

// Constants
export * from './constants';

// Utils
export * from './utils';
