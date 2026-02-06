/**
 * 관리자 로그인 페이지
 */

import { useState, FormEvent } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { ADMIN_ROUTES } from '../../constants/routes';

/**
 * 관리자 로그인 페이지 컴포넌트
 */
export function AdminLoginPage() {
  const location = useLocation();
  const { admin, login, isLoading } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 이미 로그인된 경우 대시보드로 리다이렉트
  if (admin) {
    const from = (location.state as { from?: string })?.from || ADMIN_ROUTES.DASHBOARD;
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      await login({ email, password });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('로그인에 실패했습니다. 다시 시도해주세요.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* 로고/타이틀 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">🏛️</h1>
          <h2 className="mt-4 text-2xl font-bold text-gray-900">
            관리자 로그인
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            복지 프로그램 관리 시스템
          </p>
        </div>

        {/* 로그인 폼 */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 에러 메시지 */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* 이메일 */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                이메일
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="admin@example.com"
                autoComplete="email"
                disabled={isSubmitting}
              />
            </div>

            {/* 비밀번호 */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                비밀번호
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={isSubmitting}
              />
            </div>

            {/* 로그인 버튼 */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  로그인 중...
                </span>
              ) : (
                '로그인'
              )}
            </button>
          </form>

          {/* 안내 메시지 */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              로그인에 문제가 있으시면 시스템 관리자에게 문의하세요.
            </p>
          </div>
        </div>

        {/* 보안 안내 */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            🔒 모든 로그인 시도는 기록됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AdminLoginPage;
