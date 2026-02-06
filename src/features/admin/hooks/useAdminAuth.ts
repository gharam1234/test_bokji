/**
 * 관리자 인증 훅
 * 로그인, 로그아웃, 인증 상태 관리
 */

import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AdminLoginRequest, AdminAuthState } from '../types';
import {
  adminLogin,
  adminLogout,
  getAdminMe,
  getStoredToken,
  getStoredAdmin,
} from '../api/adminAuthApi';
import { ADMIN_ROUTES } from '../constants/routes';

/** useAdminAuth 반환 타입 */
export interface UseAdminAuthReturn extends AdminAuthState {
  login: (credentials: AdminLoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

/**
 * 관리자 인증 훅
 */
export function useAdminAuth(): UseAdminAuthReturn {
  const navigate = useNavigate();
  const [state, setState] = useState<AdminAuthState>({
    admin: getStoredAdmin(),
    isAuthenticated: !!getStoredToken(),
    isLoading: true,
    error: null,
  });

  /**
   * 인증 상태 확인
   */
  const checkAuth = useCallback(async () => {
    const token = getStoredToken();
    
    if (!token) {
      setState({
        admin: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      return;
    }

    try {
      const admin = await getAdminMe();
      setState({
        admin,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      // 토큰이 유효하지 않으면 초기화
      setState({
        admin: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  }, []);

  /**
   * 로그인
   */
  const login = useCallback(async (credentials: AdminLoginRequest) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await adminLogin(credentials);
      setState({
        admin: response.admin,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      navigate(ADMIN_ROUTES.DASHBOARD);
    } catch (error) {
      const message = error instanceof Error ? error.message : '로그인에 실패했습니다.';
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      throw error;
    }
  }, [navigate]);

  /**
   * 로그아웃
   */
  const logout = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      await adminLogout();
    } finally {
      setState({
        admin: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      navigate(ADMIN_ROUTES.LOGIN);
    }
  }, [navigate]);

  // 초기 인증 상태 확인
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    ...state,
    login,
    logout,
    checkAuth,
  };
}
