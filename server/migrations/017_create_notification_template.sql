-- ============================================
-- 017_create_notification_template.sql
-- 알림 템플릿 테이블 생성
-- ============================================

-- 알림 템플릿 테이블
CREATE TABLE notification_template (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL,
    channel VARCHAR(20) NOT NULL,
    title_template VARCHAR(200) NOT NULL,
    message_template TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- 유형+채널 조합은 유일해야 함
    UNIQUE(type, channel)
);

-- 인덱스 생성
CREATE INDEX idx_notification_template_type ON notification_template(type);
CREATE INDEX idx_notification_template_active ON notification_template(is_active) WHERE is_active = TRUE;

-- 코멘트 추가
COMMENT ON TABLE notification_template IS '알림 메시지 템플릿을 저장하는 테이블';
COMMENT ON COLUMN notification_template.id IS '템플릿 고유 식별자';
COMMENT ON COLUMN notification_template.type IS '알림 유형';
COMMENT ON COLUMN notification_template.channel IS '알림 채널 (in_app, push, email)';
COMMENT ON COLUMN notification_template.title_template IS '제목 템플릿 (Handlebars 형식)';
COMMENT ON COLUMN notification_template.message_template IS '본문 템플릿 (Handlebars 형식)';
COMMENT ON COLUMN notification_template.is_active IS '활성화 여부';
