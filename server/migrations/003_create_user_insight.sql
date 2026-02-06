-- ============================================================
-- 003: 사용자 인사이트 테이블 생성
-- 개인화된 인사이트/팁을 저장하는 테이블
-- ============================================================

-- 사용자 인사이트 테이블
CREATE TABLE user_insight (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    insight_type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    related_data JSONB DEFAULT '{}',
    priority INTEGER DEFAULT 5,
    is_read BOOLEAN DEFAULT FALSE,
    valid_until DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 인사이트 유형 제약조건
    CONSTRAINT valid_insight_type CHECK (
        insight_type IN (
            'top_category',
            'activity_increase',
            'new_recommendation',
            'bookmark_reminder',
            'unused_benefit'
        )
    ),
    
    -- 우선순위 범위 제약조건
    CONSTRAINT valid_priority CHECK (
        priority >= 1 AND priority <= 10
    )
);

-- 성능 최적화를 위한 인덱스 생성
-- 사용자별 유효한 인사이트 조회
CREATE INDEX idx_insight_user_valid ON user_insight(user_id, valid_until);

-- 사용자별 읽지 않은 인사이트 조회 (부분 인덱스)
CREATE INDEX idx_insight_user_unread ON user_insight(user_id, is_read) 
    WHERE is_read = FALSE;

-- 우선순위순 정렬 조회
CREATE INDEX idx_insight_user_priority ON user_insight(user_id, priority DESC, created_at DESC);

-- 인사이트 유형별 조회
CREATE INDEX idx_insight_type ON user_insight(insight_type);

-- 만료된 인사이트 정리용 인덱스
CREATE INDEX idx_insight_valid_until ON user_insight(valid_until);

-- 코멘트 추가
COMMENT ON TABLE user_insight IS '사용자 인사이트 - 개인화된 복지 활용 팁/인사이트';
COMMENT ON COLUMN user_insight.insight_type IS '인사이트 유형: top_category, activity_increase, new_recommendation, bookmark_reminder, unused_benefit';
COMMENT ON COLUMN user_insight.priority IS '표시 우선순위 (1-10, 높을수록 우선)';
COMMENT ON COLUMN user_insight.related_data IS '관련 데이터 {categoryName, programIds, percentageChange, comparisonPeriod}';
COMMENT ON COLUMN user_insight.valid_until IS '인사이트 유효 기간 (null이면 무기한)';
