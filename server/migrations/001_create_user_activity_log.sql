-- ============================================================
-- 001: 사용자 활동 로그 테이블 생성
-- 사용자의 복지 서비스 이용 활동을 기록하는 테이블
-- ============================================================

-- 사용자 활동 로그 테이블
CREATE TABLE user_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL,
    target_id UUID,
    target_category VARCHAR(100),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 활동 유형 제약조건
    CONSTRAINT valid_activity_type CHECK (
        activity_type IN (
            'search', 
            'view', 
            'bookmark', 
            'unbookmark', 
            'recommendation_click', 
            'recommendation_view'
        )
    )
);

-- 성능 최적화를 위한 인덱스 생성
-- 사용자별 활동 조회
CREATE INDEX idx_activity_log_user_id ON user_activity_log(user_id);

-- 시간순 조회
CREATE INDEX idx_activity_log_created_at ON user_activity_log(created_at);

-- 사용자별 기간 조회 (가장 빈번한 쿼리 패턴)
CREATE INDEX idx_activity_log_user_date ON user_activity_log(user_id, created_at);

-- 활동 유형별 조회
CREATE INDEX idx_activity_log_type ON user_activity_log(activity_type);

-- 카테고리별 조회
CREATE INDEX idx_activity_log_category ON user_activity_log(target_category);

-- 복합 인덱스: 사용자 + 활동 유형 + 날짜
CREATE INDEX idx_activity_log_user_type_date ON user_activity_log(user_id, activity_type, created_at);

-- 코멘트 추가
COMMENT ON TABLE user_activity_log IS '사용자 활동 로그 - 검색, 조회, 즐겨찾기 등 모든 활동 기록';
COMMENT ON COLUMN user_activity_log.activity_type IS '활동 유형: search, view, bookmark, unbookmark, recommendation_click, recommendation_view';
COMMENT ON COLUMN user_activity_log.target_id IS '대상 복지 프로그램 ID (nullable: 검색의 경우 null 가능)';
COMMENT ON COLUMN user_activity_log.metadata IS '추가 정보: 검색어, 필터 조건, 유입 경로, 세션 ID 등';
