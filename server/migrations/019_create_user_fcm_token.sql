-- ============================================
-- 019_create_user_fcm_token.sql
-- FCM 토큰 테이블 생성
-- ============================================

-- FCM 토큰 테이블
CREATE TABLE user_fcm_token (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profile(id) ON DELETE CASCADE,
    token VARCHAR(500) NOT NULL UNIQUE,
    device_type VARCHAR(20) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX idx_fcm_token_user ON user_fcm_token(user_id);
CREATE INDEX idx_fcm_token_active ON user_fcm_token(user_id, is_active) WHERE is_active = TRUE;

-- 코멘트 추가
COMMENT ON TABLE user_fcm_token IS '사용자 FCM 푸시 토큰을 저장하는 테이블';
COMMENT ON COLUMN user_fcm_token.id IS '토큰 레코드 고유 식별자';
COMMENT ON COLUMN user_fcm_token.user_id IS '사용자 ID';
COMMENT ON COLUMN user_fcm_token.token IS 'FCM 토큰 문자열';
COMMENT ON COLUMN user_fcm_token.device_type IS '디바이스 유형 (web, android, ios)';
COMMENT ON COLUMN user_fcm_token.is_active IS '활성화 여부';
COMMENT ON COLUMN user_fcm_token.last_used_at IS '마지막 사용 시각';
