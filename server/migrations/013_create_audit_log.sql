-- =====================================================
-- 감사 로그 테이블 마이그레이션
-- 관리자 데이터 변경 이력 추적용
-- =====================================================

-- 감사 로그 테이블
CREATE TABLE IF NOT EXISTS audit_log (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- 관리자 정보
    admin_id        UUID NOT NULL REFERENCES admin_user(id),
    
    -- 액션 정보
    action          VARCHAR(50) NOT NULL,      -- 'CREATE', 'UPDATE', 'DELETE', 'RESTORE'
    entity_type     VARCHAR(100) NOT NULL,     -- 'welfare_program', 'admin_user'
    entity_id       VARCHAR(255) NOT NULL,
    
    -- 변경 데이터
    old_value       JSONB,                     -- 변경 전 데이터
    new_value       JSONB,                     -- 변경 후 데이터
    changes         JSONB,                     -- 변경된 필드 목록
    
    -- 요청 정보
    ip_address      VARCHAR(45),               -- IPv4/IPv6 지원
    user_agent      TEXT,
    
    -- 타임스탬프
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==================== 인덱스 ====================

-- 엔티티별 조회 인덱스
CREATE INDEX IF NOT EXISTS idx_audit_log_entity 
ON audit_log(entity_type, entity_id);

-- 관리자별 최근 활동 조회 인덱스
CREATE INDEX IF NOT EXISTS idx_audit_log_admin 
ON audit_log(admin_id, created_at DESC);

-- 시간순 조회 인덱스
CREATE INDEX IF NOT EXISTS idx_audit_log_created 
ON audit_log(created_at DESC);

-- 액션별 조회 인덱스
CREATE INDEX IF NOT EXISTS idx_audit_log_action 
ON audit_log(action);

-- 복합 인덱스: 엔티티 타입 + 시간
CREATE INDEX IF NOT EXISTS idx_audit_log_entity_time
ON audit_log(entity_type, created_at DESC);

-- ==================== 코멘트 ====================

COMMENT ON TABLE audit_log IS '관리자 데이터 변경 감사 로그';
COMMENT ON COLUMN audit_log.admin_id IS '작업 수행 관리자 ID';
COMMENT ON COLUMN audit_log.action IS '수행된 액션 (CREATE, UPDATE, DELETE, RESTORE)';
COMMENT ON COLUMN audit_log.entity_type IS '대상 엔티티 타입';
COMMENT ON COLUMN audit_log.entity_id IS '대상 엔티티 ID';
COMMENT ON COLUMN audit_log.old_value IS '변경 전 전체 데이터';
COMMENT ON COLUMN audit_log.new_value IS '변경 후 전체 데이터';
COMMENT ON COLUMN audit_log.changes IS '변경된 필드별 before/after 값';
COMMENT ON COLUMN audit_log.ip_address IS '요청 IP 주소';
COMMENT ON COLUMN audit_log.user_agent IS '요청 User-Agent';
