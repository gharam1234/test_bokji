-- ============================================
-- 020_create_scheduled_notification.sql
-- 예약 알림 테이블 생성
-- ============================================

-- 알림 예약 테이블
CREATE TABLE scheduled_notification (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profile(id) ON DELETE CASCADE,
    user_ids UUID[], -- 대량 발송용
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    link_url VARCHAR(500),
    metadata JSONB,
    priority VARCHAR(20) DEFAULT 'normal',
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
-- 처리 대기중인 예약 알림 조회 최적화
CREATE INDEX idx_scheduled_notification_status ON scheduled_notification(status, scheduled_at) 
    WHERE status = 'pending';

-- 코멘트 추가
COMMENT ON TABLE scheduled_notification IS '예약 발송 알림을 저장하는 테이블';
COMMENT ON COLUMN scheduled_notification.id IS '예약 알림 고유 식별자';
COMMENT ON COLUMN scheduled_notification.user_id IS '단일 대상 사용자 ID';
COMMENT ON COLUMN scheduled_notification.user_ids IS '대량 발송 대상 사용자 ID 배열';
COMMENT ON COLUMN scheduled_notification.type IS '알림 유형';
COMMENT ON COLUMN scheduled_notification.title IS '알림 제목';
COMMENT ON COLUMN scheduled_notification.message IS '알림 본문';
COMMENT ON COLUMN scheduled_notification.link_url IS '클릭 시 이동 URL';
COMMENT ON COLUMN scheduled_notification.metadata IS '추가 메타데이터';
COMMENT ON COLUMN scheduled_notification.priority IS '우선순위 (low, normal, high, urgent)';
COMMENT ON COLUMN scheduled_notification.scheduled_at IS '발송 예약 시각';
COMMENT ON COLUMN scheduled_notification.status IS '처리 상태 (pending, processed, cancelled)';
COMMENT ON COLUMN scheduled_notification.processed_at IS '처리 완료 시각';
