-- =====================================================
-- 관리자 계정 테이블 마이그레이션
-- 관리자 대시보드 인증용 테이블
-- =====================================================

-- 관리자 계정 테이블
CREATE TABLE IF NOT EXISTS admin_user (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- 인증 정보
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    
    -- 기본 정보
    name            VARCHAR(100) NOT NULL,
    role            VARCHAR(50) NOT NULL DEFAULT 'admin',
    
    -- 상태
    is_active       BOOLEAN DEFAULT TRUE,
    
    -- 로그인 관련
    last_login_at   TIMESTAMP WITH TIME ZONE,
    login_attempts  INTEGER DEFAULT 0,
    locked_until    TIMESTAMP WITH TIME ZONE,
    
    -- 타임스탬프
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==================== 인덱스 ====================

-- 이메일 유니크 인덱스
CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_user_email 
ON admin_user(email);

-- 활성 상태 인덱스 (활성 관리자만 조회 시 사용)
CREATE INDEX IF NOT EXISTS idx_admin_user_active 
ON admin_user(is_active) WHERE is_active = TRUE;

-- ==================== 트리거 ====================

-- updated_at 자동 갱신 트리거 함수
CREATE OR REPLACE FUNCTION update_admin_user_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
DROP TRIGGER IF EXISTS trigger_admin_user_updated_at ON admin_user;
CREATE TRIGGER trigger_admin_user_updated_at
    BEFORE UPDATE ON admin_user
    FOR EACH ROW
    EXECUTE FUNCTION update_admin_user_timestamp();

-- ==================== 초기 데이터 ====================

-- 기본 관리자 계정 생성 (비밀번호: admin123! - bcrypt 해시)
-- 실제 운영 시 반드시 변경 필요
INSERT INTO admin_user (email, password_hash, name, role)
VALUES (
    'admin@example.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4WwuG.VqVzjXK6Gy',
    '시스템 관리자',
    'super_admin'
) ON CONFLICT (email) DO NOTHING;

-- ==================== 코멘트 ====================

COMMENT ON TABLE admin_user IS '관리자 계정 테이블';
COMMENT ON COLUMN admin_user.email IS '관리자 이메일 (로그인 ID)';
COMMENT ON COLUMN admin_user.password_hash IS 'bcrypt 해시된 비밀번호';
COMMENT ON COLUMN admin_user.name IS '관리자 이름';
COMMENT ON COLUMN admin_user.role IS '관리자 역할 (admin, super_admin)';
COMMENT ON COLUMN admin_user.is_active IS '계정 활성 상태';
COMMENT ON COLUMN admin_user.login_attempts IS '연속 로그인 실패 횟수';
COMMENT ON COLUMN admin_user.locked_until IS '계정 잠금 해제 시간';
