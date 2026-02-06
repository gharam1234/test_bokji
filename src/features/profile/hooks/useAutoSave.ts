/**
 * useAutoSave 훅
 * 폼 자동 저장 기능
 */

import { useEffect, useRef, useCallback, useState } from 'react';

/** useAutoSave 옵션 */
export interface UseAutoSaveOptions<T> {
  /** 저장할 데이터 */
  data: T;
  /** 저장 함수 */
  onSave: (data: T) => Promise<boolean>;
  /** 저장 간격 (ms) */
  interval?: number;
  /** 활성화 여부 */
  enabled?: boolean;
  /** 데이터 변경 시에만 저장 */
  saveOnChange?: boolean;
}

/** useAutoSave 반환 타입 */
export interface UseAutoSaveReturn {
  /** 마지막 저장 시간 */
  lastSavedAt: Date | null;
  /** 저장 중 상태 */
  isSaving: boolean;
  /** 저장 트리거 */
  triggerSave: () => void;
}

/**
 * 자동 저장 기능을 제공하는 커스텀 훅
 */
export function useAutoSave<T>(options: UseAutoSaveOptions<T>): UseAutoSaveReturn {
  const {
    data,
    onSave,
    interval = 30000, // 기본 30초
    enabled = true,
    saveOnChange = true,
  } = options;

  // 상태
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastDataRef = useRef<string>(JSON.stringify(data));
  const pendingSave = useRef(false);

  /**
   * 데이터 저장 실행
   */
  const executeSave = useCallback(async () => {
    if (isSaving || !enabled) return;

    const currentData = JSON.stringify(data);

    // 변경 시에만 저장 옵션이 활성화되어 있고, 변경이 없으면 스킵
    if (saveOnChange && currentData === lastDataRef.current) {
      return;
    }

    setIsSaving(true);
    try {
      const success = await onSave(data);
      if (success) {
        setLastSavedAt(new Date());
        lastDataRef.current = currentData;
      }
    } catch (err) {
      console.error('자동 저장 실패:', err);
    } finally {
      setIsSaving(false);
      pendingSave.current = false;
    }
  }, [data, onSave, enabled, isSaving, saveOnChange]);

  /**
   * 저장 트리거 (디바운스 적용)
   */
  const triggerSave = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    pendingSave.current = true;
    timerRef.current = setTimeout(() => {
      executeSave();
    }, 1000); // 1초 디바운스
  }, [executeSave]);

  // 주기적 자동 저장
  useEffect(() => {
    if (!enabled) return;

    const intervalId = setInterval(() => {
      if (!pendingSave.current) {
        executeSave();
      }
    }, interval);

    return () => {
      clearInterval(intervalId);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [enabled, interval, executeSave]);

  // 언마운트 시 저장
  useEffect(() => {
    return () => {
      if (pendingSave.current && enabled) {
        // 동기적으로 저장 시도 (비동기는 언마운트 후 실행 안됨)
        // 실제로는 beforeunload 이벤트 등으로 처리해야 함
      }
    };
  }, [enabled]);

  return {
    lastSavedAt,
    isSaving,
    triggerSave,
  };
}
