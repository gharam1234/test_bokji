/**
 * 포맷터 유틸리티
 */

/**
 * 전화번호 포맷팅
 * 예: 01012345678 → 010-1234-5678
 */
export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  
  const digits = phone.replace(/[^0-9]/g, '');
  
  // 휴대폰 번호 (010, 011, 016, 017, 018, 019)
  if (digits.length === 11 && digits.startsWith('01')) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }
  
  // 서울 지역번호 (02)
  if (digits.length === 9 && digits.startsWith('02')) {
    return `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5)}`;
  }
  if (digits.length === 10 && digits.startsWith('02')) {
    return `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  
  // 기타 지역번호 (031, 032, ...)
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }
  
  return phone;
};

/**
 * 금액 포맷팅 (원 단위)
 * 예: 50000000 → 50,000,000원
 */
export const formatCurrency = (amount: number, suffix = '원'): string => {
  if (amount === undefined || amount === null || isNaN(amount)) return '';
  
  return amount.toLocaleString('ko-KR') + suffix;
};

/**
 * 금액 포맷팅 (만원 단위)
 * 예: 50000000 → 5,000만원
 */
export const formatCurrencyInManwon = (amount: number): string => {
  if (amount === undefined || amount === null || isNaN(amount)) return '';
  
  const inManwon = Math.floor(amount / 10000);
  return inManwon.toLocaleString('ko-KR') + '만원';
};

/**
 * 금액 포맷팅 (억/만원 단위)
 * 예: 150000000 → 1억 5,000만원
 */
export const formatCurrencyReadable = (amount: number): string => {
  if (amount === undefined || amount === null || isNaN(amount)) return '';
  
  const eok = Math.floor(amount / 100000000);
  const manwon = Math.floor((amount % 100000000) / 10000);
  
  let result = '';
  if (eok > 0) {
    result += `${eok.toLocaleString('ko-KR')}억`;
  }
  if (manwon > 0) {
    if (result) result += ' ';
    result += `${manwon.toLocaleString('ko-KR')}만`;
  }
  
  return result ? result + '원' : '0원';
};

/**
 * 날짜 포맷팅
 * 예: 1990-01-15 → 1990년 1월 15일
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  return `${year}년 ${month}월 ${day}일`;
};

/**
 * 날짜를 ISO 형식으로 변환
 * 예: Date → 1990-01-15
 */
export const toISODateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * 나이 계산
 */
export const calculateAge = (birthDateString: string): number => {
  if (!birthDateString) return 0;
  
  const birthDate = new Date(birthDateString);
  const today = new Date();
  
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * 퍼센트 포맷팅
 * 예: 0.756 → 75.6%
 */
export const formatPercent = (value: number, decimals = 1): string => {
  if (value === undefined || value === null || isNaN(value)) return '';
  
  return `${(value * 100).toFixed(decimals)}%`;
};

/**
 * 가구원 수 포맷팅
 * 예: 4 → 4인 가구
 */
export const formatHouseholdSize = (size: number): string => {
  if (!size || size < 1) return '';
  
  return `${size}인 가구`;
};

/**
 * 우편번호 포맷팅
 * 예: 06234 → 06234 (5자리 유지)
 */
export const formatZipCode = (zipCode: string): string => {
  if (!zipCode) return '';
  
  const digits = zipCode.replace(/[^0-9]/g, '');
  return digits.padStart(5, '0').slice(0, 5);
};
