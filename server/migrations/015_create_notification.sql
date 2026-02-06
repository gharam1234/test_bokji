-- ============================================
-- 015_create_notification.sql
-- 알림 테이블 생성
-- ============================================

-- 알림 테이블
CREATE TABLE notification (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profile(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    link_url VARCHAR(500),
    metadata JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
-- 사용자별 알림 조회 최적화
CREATE INDEX idx_notification_user_id ON notification(user_id);

-- 사용자별 읽지 않은 알림 조회 최적화
CREATE INDEX idx_notification_user_unread ON notification(user_id, is_read) WHERE is_read = FALSE;

-- 사용자별 최신순 정렬 조회 최적화
CREATE INDEX idx_notification_user_created ON notification(user_id, created_at DESC);

-- 알림 유형별 조회 최적화
CREATE INDEX idx_notification_type ON notification(type);

-- 코멘트 추가
COMMENT ON TABLE notification IS '사용자 알림 정보를 저장하는 테이블';
COMMENT ON COLUMN notification.id IS '알림 고유 식별자';
COMMENT ON COLUMN notification.user_id IS '알림 대상 사용자 ID';
COMMENT ON COLUMN notification.type IS '알림 유형 (new_welfare, deadline_alert, profile_match, recommendation, system)';
COMMENT ON COLUMN notification.title IS '알림 제목';
COMMENT ON COLUMN notification.message IS '알림 본문';
COMMENT ON COLUMN notification.link_url IS '클릭 시 이동할 URL';
COMMENT ON COLUMN notification.metadata IS '추가 메타데이터 (JSON)';
COMMENT ON COLUMN notification.is_read IS '읽음 여부';
COMMENT ON COLUMN notification.read_at IS '읽은 시각';
COMMENT ON COLUMN notification.created_at IS '생성 시각';
