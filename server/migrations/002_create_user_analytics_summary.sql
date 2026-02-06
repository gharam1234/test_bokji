-- ============================================================
-- 002: 사용자 분석 요약 테이블 생성
-- 일별/주별/월별 집계 데이터를 저장하는 테이블
-- ============================================================

-- 사용자 분석 요약 테이블 (집계)
CREATE TABLE user_analytics_summary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    period_type VARCHAR(20) NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- 기본 카운트 메트릭
    total_searches INTEGER DEFAULT 0,
    total_views INTEGER DEFAULT 0,
    total_bookmarks INTEGER DEFAULT 0,
    recommendation_clicks INTEGER DEFAULT 0,
    recommendation_views INTEGER DEFAULT 0,
    
    -- 집계 데이터 (JSONB)
    top_categories JSONB DEFAULT '[]',
    top_programs JSONB DEFAULT '[]',
    conversion_rate JSONB DEFAULT '{}',
    
    -- 타임스탬프
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 기간 유형 제약조건
    CONSTRAINT valid_period_type CHECK (
        period_type IN ('daily', 'weekly', 'monthly', 'yearly')
    ),
    
    -- 유니크 제약조건: 사용자별 기간별 하나의 요약만 존재
    UNIQUE(user_id, period_type, period_start)
);

-- 성능 최적화를 위한 인덱스 생성
-- 사용자별 기간별 조회 (기본 쿼리)
CREATE INDEX idx_summary_user_period ON user_analytics_summary(user_id, period_type, period_start);

-- 기간별 조회 (배치 작업용)
CREATE INDEX idx_summary_period_start ON user_analytics_summary(period_start);

-- 기간 유형별 조회
CREATE INDEX idx_summary_period_type ON user_analytics_summary(period_type);

-- updated_at 트리거 함수
CREATE OR REPLACE FUNCTION update_analytics_summary_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- updated_at 자동 갱신 트리거
CREATE TRIGGER trigger_update_analytics_summary_updated_at
    BEFORE UPDATE ON user_analytics_summary
    FOR EACH ROW
    EXECUTE FUNCTION update_analytics_summary_updated_at();

-- 코멘트 추가
COMMENT ON TABLE user_analytics_summary IS '사용자 분석 요약 - 일별/주별/월별 집계 데이터';
COMMENT ON COLUMN user_analytics_summary.period_type IS '집계 기간 유형: daily, weekly, monthly, yearly';
COMMENT ON COLUMN user_analytics_summary.top_categories IS '상위 관심 카테고리 배열 [{category, count, percentage}]';
COMMENT ON COLUMN user_analytics_summary.top_programs IS '상위 조회 프로그램 배열 [{programId, programName, category, viewCount}]';
COMMENT ON COLUMN user_analytics_summary.conversion_rate IS '전환율 메트릭 {recommendationToView, viewToBookmark, recommendationToBookmark}';
