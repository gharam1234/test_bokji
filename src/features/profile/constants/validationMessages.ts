/**
 * 유효성 검증 메시지 정의
 */

/** 기본 정보 검증 메시지 */
export const BASIC_INFO_MESSAGES = {
  name: {
    required: '이름을 입력해주세요',
    minLength: '이름은 2자 이상이어야 합니다',
    maxLength: '이름은 50자 이하여야 합니다',
    pattern: '이름은 한글 또는 영문만 입력 가능합니다',
  },
  birthDate: {
    required: '생년월일을 입력해주세요',
    invalid: '올바른 날짜 형식이 아닙니다',
    future: '미래 날짜는 입력할 수 없습니다',
    tooOld: '올바른 생년월일을 입력해주세요',
  },
  gender: {
    required: '성별을 선택해주세요',
  },
  phone: {
    required: '전화번호를 입력해주세요',
    invalid: '올바른 전화번호 형식이 아닙니다',
  },
  email: {
    invalid: '올바른 이메일 형식이 아닙니다',
  },
} as const;

/** 소득 정보 검증 메시지 */
export const INCOME_MESSAGES = {
  type: {
    required: '소득 유형을 선택해주세요',
  },
  annualAmount: {
    required: '연간 소득을 입력해주세요',
    min: '소득은 0 이상이어야 합니다',
    max: '올바른 소득 금액을 입력해주세요',
  },
} as const;

/** 주소 정보 검증 메시지 */
export const ADDRESS_MESSAGES = {
  zipCode: {
    required: '우편번호를 입력해주세요',
    invalid: '올바른 우편번호 형식이 아닙니다',
  },
  sido: {
    required: '시/도를 선택해주세요',
  },
  sigungu: {
    required: '시/군/구를 선택해주세요',
  },
  roadAddress: {
    required: '도로명 주소를 입력해주세요',
  },
  detail: {
    required: '상세 주소를 입력해주세요',
    maxLength: '상세 주소는 200자 이하여야 합니다',
  },
} as const;

/** 가구원 정보 검증 메시지 */
export const HOUSEHOLD_MESSAGES = {
  size: {
    required: '가구원 수를 입력해주세요',
    min: '가구원 수는 1명 이상이어야 합니다',
    max: '가구원 수는 20명 이하여야 합니다',
  },
  member: {
    relation: {
      required: '관계를 선택해주세요',
    },
    name: {
      required: '이름을 입력해주세요',
      minLength: '이름은 2자 이상이어야 합니다',
      maxLength: '이름은 50자 이하여야 합니다',
    },
    birthDate: {
      required: '생년월일을 입력해주세요',
      invalid: '올바른 날짜 형식이 아닙니다',
    },
    gender: {
      required: '성별을 선택해주세요',
    },
  },
} as const;

/** 공통 에러 메시지 */
export const COMMON_MESSAGES = {
  networkError: '네트워크 오류가 발생했습니다. 다시 시도해주세요.',
  serverError: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  unknownError: '알 수 없는 오류가 발생했습니다.',
  saveFailed: '저장에 실패했습니다. 다시 시도해주세요.',
  loadFailed: '데이터를 불러오는데 실패했습니다.',
} as const;
