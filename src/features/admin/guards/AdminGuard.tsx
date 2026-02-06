/**
 * 관리자 인증 가드
 * 인증되지 않은 사용자를 로그인 페이지로 리다이렉트
 */

import { ReactNode, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ADMIN_ROUTES, ADMIN_STORAGE_KEYS } from '../constants/routes';

interface AdminGuardProps {
  children: ReactNode;
}

/**
 * 관리자 인증 가드 컴포넌트
 * 인증되지 않은 경우 로그인 페이지로 리다이렉트
 */
export function AdminGuard({ children }: AdminGuardProps) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem(ADMIN_STORAGE_KEYS.ACCESS_TOKEN);
    
    if (!token) {
      // 현재 경로를 저장하여 로그인 후 리다이렉트
      navigate(ADMIN_ROUTES.LOGIN, {
        replace: true,
        state: { from: location.pathname },
      });
    }
  }, [navigate, location]);

  // 토큰이 없으면 아무것도 렌더링하지 않음
  const token = localStorage.getItem(ADMIN_STORAGE_KEYS.ACCESS_TOKEN);
  if (!token) {
    return null;
  }

  return <>{children}</>;
}
