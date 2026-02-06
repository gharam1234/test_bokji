/**
 * 주소 검색 API 클라이언트
 * 다음 우편번호 서비스 연동
 */

import { AddressSearchResult } from '../types';

// 다음 우편번호 스크립트 로드 상태
let daumPostcodeLoaded = false;

/**
 * 다음 우편번호 스크립트 로드
 */
export function loadDaumPostcodeScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (daumPostcodeLoaded) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.async = true;

    script.onload = () => {
      daumPostcodeLoaded = true;
      resolve();
    };

    script.onerror = () => {
      reject(new Error('다음 우편번호 스크립트 로드 실패'));
    };

    document.head.appendChild(script);
  });
}

/**
 * 다음 우편번호 검색 열기
 * @param onComplete 주소 선택 완료 콜백
 * @param onClose 닫기 콜백
 */
export async function openAddressSearch(
  onComplete: (address: AddressSearchResult) => void,
  onClose?: () => void,
): Promise<void> {
  await loadDaumPostcodeScript();

  // daum.postcode 타입 정의
  const daum = (window as any).daum;

  new daum.Postcode({
    oncomplete: (data: any) => {
      // 도로명 주소 or 지번 주소
      let roadAddress = data.roadAddress || '';
      let jibunAddress = data.jibunAddress || data.autoJibunAddress || '';

      // 건물명이 있으면 추가
      let extraAddress = '';
      if (data.bname !== '' && /[동|로|가]$/g.test(data.bname)) {
        extraAddress += data.bname;
      }
      if (data.buildingName !== '' && data.apartment === 'Y') {
        extraAddress += (extraAddress !== '' ? ', ' : '') + data.buildingName;
      }
      if (extraAddress !== '') {
        roadAddress += ` (${extraAddress})`;
      }

      const result: AddressSearchResult = {
        zipCode: data.zonecode,
        sido: data.sido,
        sigungu: data.sigungu,
        roadAddress: roadAddress,
        jibunAddress: jibunAddress,
        buildingName: data.buildingName || undefined,
      };

      onComplete(result);
    },
    onclose: () => {
      if (onClose) {
        onClose();
      }
    },
    width: '100%',
    height: '100%',
  }).open();
}

/**
 * 팝업 형태로 주소 검색 열기
 */
export async function openAddressSearchPopup(
  onComplete: (address: AddressSearchResult) => void,
): Promise<void> {
  await loadDaumPostcodeScript();

  const daum = (window as any).daum;

  new daum.Postcode({
    oncomplete: (data: any) => {
      let roadAddress = data.roadAddress || '';
      let jibunAddress = data.jibunAddress || data.autoJibunAddress || '';

      let extraAddress = '';
      if (data.bname !== '' && /[동|로|가]$/g.test(data.bname)) {
        extraAddress += data.bname;
      }
      if (data.buildingName !== '' && data.apartment === 'Y') {
        extraAddress += (extraAddress !== '' ? ', ' : '') + data.buildingName;
      }
      if (extraAddress !== '') {
        roadAddress += ` (${extraAddress})`;
      }

      const result: AddressSearchResult = {
        zipCode: data.zonecode,
        sido: data.sido,
        sigungu: data.sigungu,
        roadAddress: roadAddress,
        jibunAddress: jibunAddress,
        buildingName: data.buildingName || undefined,
      };

      onComplete(result);
    },
  }).open();
}

// 주소 API 내보내기
export const addressApi = {
  loadDaumPostcodeScript,
  openAddressSearch,
  openAddressSearchPopup,
};
