-- ============================================
-- 018_create_notification_log.sql
-- 알림 발송 로그 테이블 생성
-- ============================================

-- 발송 로그 테이블
CREATE TABLE notification_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_id UUID NOT NULL REFERENCES notification(id) ON DELETE CASCADE,
    channel VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    error_message TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX idx_notification_log_notification ON notification_log(notification_id);
CREATE INDEX idx_notification_log_status ON notification_log(status, created_at);

-- 코멘트 추가
COMMENT ON TABLE notification_log IS '알림 발송 결과를 기록하는 로그 테이블';
COMMENT ON COLUMN notification_log.id IS '로그 고유 식별자';
COMMENT ON COLUMN notification_log.notification_id IS '알림 ID';
COMMENT ON COLUMN notification_log.channel IS '발송 채널';
COMMENT ON COLUMN notification_log.status IS '발송 상태 (pending, sent, failed, cancelled)';
COMMENT ON COLUMN notification_log.error_message IS '실패 시 오류 메시지';
COMMENT ON COLUMN notification_log.sent_at IS '발송 완료 시각';
