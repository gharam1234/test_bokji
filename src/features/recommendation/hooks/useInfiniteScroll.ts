/**
 * useInfiniteScroll 훅
 * 무한 스크롤 기능 구현
 */

import { useEffect, useRef, useCallback, useState } from 'react';

/** useInfiniteScroll 옵션 */
export interface UseInfiniteScrollOptions {
  /** 로드 더 콜백 */
  onLoadMore: () => void;
  /** 더 불러올 데이터 있음 */
  hasMore: boolean;
  /** 로딩 중 여부 */
  isLoading: boolean;
  /** 트리거 거리 (px) - 하단에서 얼마나 떨어져 있을 때 로드할지 */
  threshold?: number;
  /** 활성화 여부 */
  enabled?: boolean;
}

/** useInfiniteScroll 반환 타입 */
export interface UseInfiniteScrollReturn {
  /** 감시 대상 요소에 연결할 ref */
  sentinelRef: React.RefObject<HTMLDivElement>;
  /** 스크롤 컨테이너에 연결할 ref (optional) */
  containerRef: React.RefObject<HTMLDivElement>;
  /** 현재 로딩 중 여부 */
  isLoadingMore: boolean;
}

/**
 * 무한 스크롤을 위한 커스텀 훅
 * IntersectionObserver를 사용하여 효율적으로 스크롤 감지
 *
 * @example
 * ```tsx
 * const { sentinelRef } = useInfiniteScroll({
 *   onLoadMore: loadMoreItems,
 *   hasMore: hasNextPage,
 *   isLoading: isLoadingData,
 * });
 *
 * return (
 *   <div>
 *     {items.map(item => <Item key={item.id} />)}
 *     <div ref={sentinelRef} />
 *   </div>
 * );
 * ```
 */
export function useInfiniteScroll(
  options: UseInfiniteScrollOptions,
): UseInfiniteScrollReturn {
  const {
    onLoadMore,
    hasMore,
    isLoading,
    threshold = 100,
    enabled = true,
  } = options;

  const sentinelRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // 콜백을 ref로 저장하여 observer 재생성 방지
  const onLoadMoreRef = useRef(onLoadMore);
  onLoadMoreRef.current = onLoadMore;

  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;

      if (entry.isIntersecting && hasMore && !isLoading && enabled) {
        setIsLoadingMore(true);
        onLoadMoreRef.current();
      }
    },
    [hasMore, isLoading, enabled],
  );

  // 로딩 상태 동기화
  useEffect(() => {
    if (!isLoading) {
      setIsLoadingMore(false);
    }
  }, [isLoading]);

  // IntersectionObserver 설정
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !enabled) return;

    const observerOptions: IntersectionObserverInit = {
      root: containerRef.current || null,
      rootMargin: `0px 0px ${threshold}px 0px`,
      threshold: 0,
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);
    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [handleIntersect, threshold, enabled]);

  return {
    sentinelRef,
    containerRef,
    isLoadingMore,
  };
}

/**
 * 스크롤 위치 복원을 위한 훅
 */
export function useScrollRestoration(key: string) {
  const scrollPositionRef = useRef<number>(0);

  useEffect(() => {
    // 저장된 스크롤 위치 복원
    const savedPosition = sessionStorage.getItem(`scroll-${key}`);
    if (savedPosition) {
      window.scrollTo(0, parseInt(savedPosition, 10));
    }

    // 스크롤 위치 저장
    const handleScroll = () => {
      scrollPositionRef.current = window.scrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      sessionStorage.setItem(`scroll-${key}`, String(scrollPositionRef.current));
    };
  }, [key]);
}
