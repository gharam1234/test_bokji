-- =====================================================
-- 추천 결과 테이블 마이그레이션
-- 사용자별 복지 추천 결과 저장
-- =====================================================

-- 추천 결과 테이블
CREATE TABLE IF NOT EXISTS recommendation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- 관계
    user_id UUID NOT NULL,
    program_id UUID NOT NULL REFERENCES welfare_program(id) ON DELETE CASCADE,
    
    -- 매칭 정보
    match_score INTEGER NOT NULL CHECK (match_score >= 0 AND match_score <= 100),
    match_reasons JSONB NOT NULL DEFAULT '[]',
    
    -- 사용자 액션
    is_bookmarked BOOLEAN DEFAULT FALSE,
    viewed_at TIMESTAMP WITH TIME ZONE,
    
    -- 타임스탬프
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- 중복 방지: 사용자당 프로그램당 하나의 추천만 존재
    UNIQUE(user_id, program_id)
);

-- ==================== 인덱스 ====================

-- 사용자별 추천 조회
CREATE INDEX IF NOT EXISTS idx_recommendation_user_id 
ON recommendation(user_id);

-- 프로그램별 추천 조회
CREATE INDEX IF NOT EXISTS idx_recommendation_program_id 
ON recommendation(program_id);

-- 사용자별 매칭점수 정렬
CREATE INDEX IF NOT EXISTS idx_recommendation_user_score 
ON recommendation(user_id, match_score DESC);

-- 사용자별 북마크된 추천
CREATE INDEX IF NOT EXISTS idx_recommendation_bookmarked 
ON recommendation(user_id, is_bookmarked) 
WHERE is_bookmarked = TRUE;

-- 사용자별 최신순 정렬
CREATE INDEX IF NOT EXISTS idx_recommendation_user_created 
ON recommendation(user_id, created_at DESC);

-- ==================== 트리거 ====================

-- updated_at 자동 갱신 트리거 함수
CREATE OR REPLACE FUNCTION update_recommendation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
DROP TRIGGER IF EXISTS trigger_recommendation_updated_at ON recommendation;
CREATE TRIGGER trigger_recommendation_updated_at
    BEFORE UPDATE ON recommendation
    FOR EACH ROW
    EXECUTE FUNCTION update_recommendation_timestamp();

-- 완료 메시지
DO $$
BEGIN
    RAISE NOTICE '008_create_recommendation.sql 마이그레이션 완료';
END $$;
