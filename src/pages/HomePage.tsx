/**
 * HomePage - 메인 홈 페이지
 * mybokji 앱의 랜딩 페이지
 */

import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 헤더 */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-blue-600">mybokji</h1>
            <nav className="flex gap-4">
              <Link
                to="/search"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                복지 검색
              </Link>
              <Link
                to="/favorites"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                즐겨찾기
              </Link>
              <Link
                to="/analytics"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                분석 리포트
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* 히어로 섹션 */}
      <main className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            모든 복지를
            <span className="text-blue-600"> 놓치지 않고</span>
          </h2>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            나에게 맞는 복지 혜택을 자동으로 추천받고, 쉽게 관리하세요.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link
              to="/search"
              className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
            >
              복지 검색하기
            </Link>
            <Link
              to="/analytics"
              className="px-8 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-gray-50 transition-colors shadow border border-blue-200"
            >
              내 분석 보기
            </Link>
          </div>
        </div>

        {/* 기능 소개 카드 */}
        <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* 카드 1 */}
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">복지 검색</h3>
            <p className="mt-2 text-gray-500">
              키워드로 원하는 복지 혜택을 빠르게 검색하세요.
            </p>
          </div>

          {/* 카드 2 */}
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">즐겨찾기</h3>
            <p className="mt-2 text-gray-500">
              관심 있는 복지 혜택을 저장하고 관리하세요.
            </p>
          </div>

          {/* 카드 3 */}
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">분석 리포트</h3>
            <p className="mt-2 text-gray-500">
              나의 복지 이용 현황을 한눈에 확인하세요.
            </p>
          </div>
        </div>
      </main>

      {/* 푸터 */}
      <footer className="bg-white border-t mt-20">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-center text-gray-400 text-sm">
            © 2026 mybokji. 모든 권리 보유.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
