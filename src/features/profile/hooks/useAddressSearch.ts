/**
 * useAddressSearch 훅
 * 주소 검색 기능 관리
 */

import { useState, useCallback } from 'react';
import { addressApi } from '../api';
import { AddressSearchResult } from '../types';

/** useAddressSearch 반환 타입 */
export interface UseAddressSearchReturn {
  /** 검색 결과 */
  address: AddressSearchResult | null;
  /** 검색 모달 열림 상태 */
  isModalOpen: boolean;
  /** 검색 중 상태 */
  isSearching: boolean;
  /** 에러 */
  error: Error | null;
  /** 검색 모달 열기 */
  openSearch: () => void;
  /** 검색 모달 닫기 */
  closeSearch: () => void;
  /** 팝업으로 검색 열기 */
  openSearchPopup: () => void;
  /** 주소 선택 완료 */
  selectAddress: (address: AddressSearchResult) => void;
  /** 주소 초기화 */
  clearAddress: () => void;
}

/**
 * 주소 검색 기능을 관리하는 커스텀 훅
 */
export function useAddressSearch(
  onSelect?: (address: AddressSearchResult) => void,
): UseAddressSearchReturn {
  // 상태
  const [address, setAddress] = useState<AddressSearchResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * 검색 모달 열기
   */
  const openSearch = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  /**
   * 검색 모달 닫기
   */
  const closeSearch = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  /**
   * 팝업으로 검색 열기
   */
  const openSearchPopup = useCallback(async () => {
    setIsSearching(true);
    setError(null);

    try {
      await addressApi.openAddressSearchPopup((result) => {
        setAddress(result);
        if (onSelect) {
          onSelect(result);
        }
        setIsSearching(false);
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('주소 검색 실패');
      setError(error);
      setIsSearching(false);
    }
  }, [onSelect]);

  /**
   * 주소 선택 완료
   */
  const selectAddress = useCallback(
    (selectedAddress: AddressSearchResult) => {
      setAddress(selectedAddress);
      setIsModalOpen(false);
      if (onSelect) {
        onSelect(selectedAddress);
      }
    },
    [onSelect],
  );

  /**
   * 주소 초기화
   */
  const clearAddress = useCallback(() => {
    setAddress(null);
  }, []);

  return {
    address,
    isModalOpen,
    isSearching,
    error,
    openSearch,
    closeSearch,
    openSearchPopup,
    selectAddress,
    clearAddress,
  };
}
