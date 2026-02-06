-- =====================================================
-- 추천 이력 테이블 마이그레이션
-- 추천 관련 사용자 행동 기록 (분석용)
-- =====================================================

-- 추천 이력 테이블
CREATE TABLE IF NOT EXISTS recommendation_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- 관계 (FK 없이 기록 - 삭제된 데이터도 이력 유지)
    user_id UUID NOT NULL,
    program_id UUID NOT NULL,
    
    -- 추천 정보
    match_score INTEGER NOT NULL,
    
    -- 액션 유형
    action VARCHAR(50) NOT NULL, -- 'generated', 'viewed', 'bookmarked', 'applied'
    
    -- 타임스탬프
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==================== 인덱스 ====================

-- 사용자별 이력 조회 (최신순)
CREATE INDEX IF NOT EXISTS idx_recommendation_history_user 
ON recommendation_history(user_id, created_at DESC);

-- 액션별 이력 조회
CREATE INDEX IF NOT EXISTS idx_recommendation_history_action 
ON recommendation_history(action, created_at);

-- 프로그램별 이력 조회
CREATE INDEX IF NOT EXISTS idx_recommendation_history_program 
ON recommendation_history(program_id, created_at DESC);

-- 날짜별 집계용
CREATE INDEX IF NOT EXISTS idx_recommendation_history_date 
ON recommendation_history(DATE(created_at), action);

-- ==================== 파티셔닝 고려사항 ====================
-- 대용량 데이터 처리를 위해 향후 월별 파티셔닝 적용 권장
-- ALTER TABLE recommendation_history PARTITION BY RANGE (created_at);

-- 완료 메시지
DO $$
BEGIN
    RAISE NOTICE '009_create_recommendation_history.sql 마이그레이션 완료';
END $$;
