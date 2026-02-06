-- ============================================
-- 016_create_notification_setting.sql
-- 알림 설정 테이블 생성
-- ============================================

-- 알림 설정 테이블
CREATE TABLE notification_setting (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES user_profile(id) ON DELETE CASCADE,
    
    -- 채널별 설정
    in_app_enabled BOOLEAN DEFAULT TRUE,
    push_enabled BOOLEAN DEFAULT TRUE,
    email_enabled BOOLEAN DEFAULT TRUE,
    
    -- 유형별 설정
    new_welfare_enabled BOOLEAN DEFAULT TRUE,
    deadline_alert_enabled BOOLEAN DEFAULT TRUE,
    recommendation_enabled BOOLEAN DEFAULT TRUE,
    
    -- 방해금지 시간
    quiet_hours_enabled BOOLEAN DEFAULT FALSE,
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    
    -- 이메일 수신 빈도
    email_digest_frequency VARCHAR(20) DEFAULT 'daily',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX idx_notification_setting_user ON notification_setting(user_id);

-- 코멘트 추가
COMMENT ON TABLE notification_setting IS '사용자별 알림 설정을 저장하는 테이블';
COMMENT ON COLUMN notification_setting.id IS '설정 고유 식별자';
COMMENT ON COLUMN notification_setting.user_id IS '사용자 ID (1:1 관계)';
COMMENT ON COLUMN notification_setting.in_app_enabled IS '인앱 알림 활성화 여부';
COMMENT ON COLUMN notification_setting.push_enabled IS '푸시 알림 활성화 여부';
COMMENT ON COLUMN notification_setting.email_enabled IS '이메일 알림 활성화 여부';
COMMENT ON COLUMN notification_setting.new_welfare_enabled IS '새 복지 프로그램 알림 수신 여부';
COMMENT ON COLUMN notification_setting.deadline_alert_enabled IS '마감 임박 알림 수신 여부';
COMMENT ON COLUMN notification_setting.recommendation_enabled IS '추천 알림 수신 여부';
COMMENT ON COLUMN notification_setting.quiet_hours_enabled IS '방해금지 시간 활성화 여부';
COMMENT ON COLUMN notification_setting.quiet_hours_start IS '방해금지 시작 시간';
COMMENT ON COLUMN notification_setting.quiet_hours_end IS '방해금지 종료 시간';
COMMENT ON COLUMN notification_setting.email_digest_frequency IS '이메일 수신 빈도 (realtime, daily, weekly, none)';
