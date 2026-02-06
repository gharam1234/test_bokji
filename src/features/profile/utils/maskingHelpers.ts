/**
 * 마스킹 처리 유틸리티
 * 개인정보 보호를 위한 데이터 마스킹 함수들
 */

/**
 * 이름 마스킹
 * 예: 홍길동 → 홍*동, 김철수민 → 김**민
 */
export const maskName = (name: string): string => {
  if (!name || name.length === 0) return '';
  
  if (name.length === 1) {
    return '*';
  }
  
  if (name.length === 2) {
    return name[0] + '*';
  }
  
  const first = name[0];
  const last = name[name.length - 1];
  const middle = '*'.repeat(name.length - 2);
  
  return first + middle + last;
};

/**
 * 전화번호 마스킹
 * 예: 010-1234-5678 → 010-****-5678
 */
export const maskPhone = (phone: string): string => {
  if (!phone) return '';
  
  // 숫자만 추출
  const digits = phone.replace(/[^0-9]/g, '');
  
  if (digits.length < 10) return phone;
  
  // 010-****-1234 형식
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-****-${digits.slice(7)}`;
  }
  
  // 02-***-1234 또는 031-***-1234 형식
  if (digits.length === 10) {
    if (digits.startsWith('02')) {
      return `${digits.slice(0, 2)}-****-${digits.slice(6)}`;
    }
    return `${digits.slice(0, 3)}-***-${digits.slice(6)}`;
  }
  
  return phone;
};

/**
 * 이메일 마스킹
 * 예: example@gmail.com → exa****@gmail.com
 */
export const maskEmail = (email: string): string => {
  if (!email || !email.includes('@')) return email;
  
  const [localPart, domain] = email.split('@');
  
  if (localPart.length <= 3) {
    return localPart[0] + '***@' + domain;
  }
  
  const visible = localPart.slice(0, 3);
  return visible + '****@' + domain;
};

/**
 * 주소 마스킹
 * 예: 서울시 강남구 테헤란로 123 → 서울시 강남구 ***
 */
export const maskAddress = (address: string): string => {
  if (!address) return '';
  
  // 시/도 + 시/군/구까지만 표시
  const parts = address.split(' ');
  
  if (parts.length <= 2) {
    return address;
  }
  
  return parts.slice(0, 2).join(' ') + ' ***';
};

/**
 * 상세 주소 마스킹
 * 전체 마스킹 처리
 */
export const maskDetailAddress = (detail: string): string => {
  if (!detail) return '';
  return '***';
};

/**
 * 소득 금액 마스킹
 * 예: 50000000 → *****만원
 */
export const maskIncome = (income: number): string => {
  if (income === undefined || income === null) return '';
  
  // 만원 단위로 자릿수 계산
  const inManwon = Math.floor(income / 10000);
  const digits = inManwon.toString().length;
  
  return '*'.repeat(digits) + '만원';
};

/**
 * 생년월일 마스킹
 * 예: 1990-01-15 → 1990-**-**
 */
export const maskBirthDate = (birthDate: string): string => {
  if (!birthDate) return '';
  
  const parts = birthDate.split('-');
  if (parts.length !== 3) return birthDate;
  
  return `${parts[0]}-**-**`;
};

/**
 * 주민등록번호 마스킹
 * 예: 900115-1234567 → 900115-*******
 */
export const maskSSN = (ssn: string): string => {
  if (!ssn) return '';
  
  const digits = ssn.replace(/[^0-9]/g, '');
  
  if (digits.length !== 13) return ssn;
  
  return digits.slice(0, 6) + '-*******';
};

/**
 * 계좌번호 마스킹
 * 예: 123-456-789012 → ***-***-**9012
 */
export const maskAccountNumber = (accountNumber: string): string => {
  if (!accountNumber) return '';
  
  const digits = accountNumber.replace(/[^0-9]/g, '');
  
  if (digits.length < 4) return '****';
  
  return '*'.repeat(digits.length - 4) + digits.slice(-4);
};
