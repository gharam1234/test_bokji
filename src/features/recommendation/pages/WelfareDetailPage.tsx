/**
 * 페이지 - 복지 상세
 */

import React, { useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWelfareDetail, useBookmark } from '../hooks';
import { 
  WelfareDetailHeader,
  WelfareDetailSummary,
  WelfareDetailEligibility,
  WelfareDetailApplication,
  WelfareDetailContact,
  RelatedPrograms,
} from '../components';

export function WelfareDetailPage() {
  const { programId } = useParams<{ programId: string }>();
  const navigate = useNavigate();
  
  const { program, relatedPrograms, isLoading, error } = useWelfareDetail(programId || '');
  const { isBookmarked, toggle: toggleBookmark } = useBookmark(programId || '');
  
  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);
  
  const handleShare = useCallback(async () => {
    if (!program) return;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: program.name,
          text: program.summary,
          url: window.location.href,
        });
      } else {
        // Fallback: 클립보드에 복사
        await navigator.clipboard.writeText(window.location.href);
        alert('링크가 복사되었습니다.');
      }
    } catch (err) {
      console.error('공유 실패:', err);
    }
  }, [program]);
  
  const handleApply = useCallback(() => {
    if (!program) return;

    const legacyOnlineUrl =
      program.applicationMethods?.find((m) => m.type === 'online' && m.url)?.url;
    const onlineUrl = legacyOnlineUrl || program.applicationMethod?.online?.url;

    if (onlineUrl) {
      window.open(onlineUrl, '_blank');
    }
  }, [program]);

  const handleRelatedProgramClick = useCallback((relatedProgramId: string) => {
    navigate(`/welfare/${relatedProgramId}`);
  }, [navigate]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="animate-pulse">
          {/* 헤더 스켈레톤 */}
          <div className="bg-white px-4 py-6">
            <div className="mb-4 h-8 w-20 rounded bg-gray-200" />
            <div className="mb-3 flex gap-2">
              <div className="h-6 w-16 rounded-full bg-gray-200" />
              <div className="h-6 w-14 rounded-full bg-gray-200" />
            </div>
            <div className="mb-2 h-8 w-3/4 rounded bg-gray-200" />
            <div className="h-4 w-1/3 rounded bg-gray-200" />
          </div>
          
          {/* 요약 스켈레톤 */}
          <div className="mt-2 bg-white px-4 py-6">
            <div className="mb-4 h-6 w-20 rounded bg-gray-200" />
            <div className="space-y-2">
              <div className="h-4 w-full rounded bg-gray-200" />
              <div className="h-4 w-5/6 rounded bg-gray-200" />
              <div className="h-4 w-4/6 rounded bg-gray-200" />
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !program) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-4 text-5xl">😢</div>
          <h2 className="mb-2 text-lg font-semibold text-gray-900">
            복지 서비스를 찾을 수 없습니다
          </h2>
          <p className="mb-6 text-sm text-gray-500">
            {error?.message || '해당 복지 서비스 정보가 존재하지 않습니다.'}
          </p>
          <button
            onClick={handleBack}
            className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }
  
  const hasOnlineApplication = Boolean(
    program?.applicationMethods?.some((m) => m.type === 'online' && m.url) ||
      program?.applicationMethod?.online?.url,
  );
  
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* 상세 컨텐츠 */}
      <WelfareDetailHeader 
        program={program} 
        onBack={handleBack}
        onShare={handleShare}
      />
      <WelfareDetailSummary program={program} />
      <WelfareDetailEligibility program={program} />
      <WelfareDetailApplication program={program} />
      <WelfareDetailContact program={program} />
      
      {/* 관련 복지 서비스 */}
      {relatedPrograms && relatedPrograms.length > 0 && (
        <RelatedPrograms
          programs={relatedPrograms}
          onProgramClick={handleRelatedProgramClick}
          maxItems={5}
        />
      )}
      
      {/* 하단 고정 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white px-4 py-3">
        <div className="flex gap-3">
          <button
            onClick={() => toggleBookmark()}
            className={`
              flex items-center justify-center gap-2 rounded-lg border px-4 py-3
              font-medium transition-colors duration-200
              ${isBookmarked
                ? 'border-yellow-400 bg-yellow-50 text-yellow-600'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }
            `}
          >
            <svg 
              className="h-5 w-5" 
              fill={isBookmarked ? 'currentColor' : 'none'} 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth={2}
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" 
              />
            </svg>
            <span>{isBookmarked ? '저장됨' : '저장'}</span>
          </button>
          
          {hasOnlineApplication ? (
            <button
              onClick={handleApply}
              className="flex-1 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
            >
              온라인 신청하기
            </button>
          ) : (
            <button
              disabled
              className="flex-1 cursor-not-allowed rounded-lg bg-gray-300 px-6 py-3 font-medium text-gray-500"
            >
              오프라인 신청만 가능
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
