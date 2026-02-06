-- ============================================
-- 006: 프로필 임시 저장 테이블 생성
-- 작성일: 2026-02-03
-- 설명: 프로필 입력 중 임시 저장 데이터
-- ============================================

-- 프로필 임시 저장 테이블
CREATE TABLE IF NOT EXISTS profile_draft (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    
    -- 임시 저장 데이터
    current_step VARCHAR(20) NOT NULL,
    form_data JSONB NOT NULL,  -- 암호화된 상태로 저장
    
    -- 타임스탬프
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 제약 조건
    CONSTRAINT valid_draft_step CHECK (
        current_step IN ('basic_info', 'income', 'address', 'household', 'complete')
    )
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_draft_user_id ON profile_draft(user_id);
CREATE INDEX IF NOT EXISTS idx_draft_saved_at ON profile_draft(saved_at);

-- 자동 만료를 위한 TTL 인덱스 (7일 후 삭제)
-- 실제 삭제는 배치 작업이나 pg_cron 등으로 처리
CREATE INDEX IF NOT EXISTS idx_draft_expired ON profile_draft(saved_at)
    WHERE saved_at < NOW() - INTERVAL '7 days';

-- 주석 추가
COMMENT ON TABLE profile_draft IS '프로필 임시 저장 데이터';
COMMENT ON COLUMN profile_draft.current_step IS '현재 입력 단계';
COMMENT ON COLUMN profile_draft.form_data IS '임시 저장된 폼 데이터 (JSON)';
COMMENT ON COLUMN profile_draft.saved_at IS '마지막 저장 시간';
