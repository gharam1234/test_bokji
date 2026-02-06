-- ============================================
-- 004: 사용자 프로필 테이블 생성
-- 작성일: 2026-02-03
-- 설명: 사용자 기본 정보, 소득, 주소 정보 저장
-- ============================================

-- 사용자 프로필 테이블
CREATE TABLE IF NOT EXISTS user_profile (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    
    -- 기본 정보 (암호화 필드는 bytea 타입)
    name_encrypted BYTEA NOT NULL,
    name_hash VARCHAR(64) NOT NULL,  -- 검색용 해시
    birth_date DATE NOT NULL,
    gender VARCHAR(10) NOT NULL,
    phone_encrypted BYTEA NOT NULL,
    phone_hash VARCHAR(64) NOT NULL,
    email VARCHAR(255),
    
    -- 주소 정보
    zip_code VARCHAR(10) NOT NULL,
    sido VARCHAR(20) NOT NULL,
    sigungu VARCHAR(50) NOT NULL,
    road_address VARCHAR(200) NOT NULL,
    jibun_address VARCHAR(200),
    detail_encrypted BYTEA NOT NULL,
    building_name VARCHAR(100),
    
    -- 소득 정보
    income_type VARCHAR(20) NOT NULL,
    annual_amount_encrypted BYTEA NOT NULL,
    income_bracket VARCHAR(20) NOT NULL,
    has_income_verification BOOLEAN DEFAULT FALSE,
    
    -- 가구 정보
    household_size INTEGER NOT NULL DEFAULT 1,
    
    -- 메타 정보
    completion_rate INTEGER DEFAULT 0,
    current_step VARCHAR(20) DEFAULT 'basic_info',
    is_complete BOOLEAN DEFAULT FALSE,
    
    -- 타임스탬프
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 제약 조건
    CONSTRAINT valid_gender CHECK (gender IN ('male', 'female', 'other')),
    CONSTRAINT valid_income_type CHECK (
        income_type IN ('employment', 'business', 'property', 'pension', 'other', 'none')
    ),
    CONSTRAINT valid_income_bracket CHECK (
        income_bracket IN ('below_50', 'below_75', 'below_100', 'below_150', 'above_150')
    ),
    CONSTRAINT valid_completion_rate CHECK (completion_rate >= 0 AND completion_rate <= 100),
    CONSTRAINT valid_household_size CHECK (household_size >= 1 AND household_size <= 20),
    CONSTRAINT valid_current_step CHECK (
        current_step IN ('basic_info', 'income', 'address', 'household', 'complete')
    )
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_profile_user_id ON user_profile(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_name_hash ON user_profile(name_hash);
CREATE INDEX IF NOT EXISTS idx_profile_phone_hash ON user_profile(phone_hash);
CREATE INDEX IF NOT EXISTS idx_profile_sido ON user_profile(sido);
CREATE INDEX IF NOT EXISTS idx_profile_sigungu ON user_profile(sido, sigungu);
CREATE INDEX IF NOT EXISTS idx_profile_income_bracket ON user_profile(income_bracket);
CREATE INDEX IF NOT EXISTS idx_profile_complete ON user_profile(is_complete);
CREATE INDEX IF NOT EXISTS idx_profile_created_at ON user_profile(created_at);

-- 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_profile_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 업데이트 트리거
DROP TRIGGER IF EXISTS profile_updated ON user_profile;
CREATE TRIGGER profile_updated
    BEFORE UPDATE ON user_profile
    FOR EACH ROW
    EXECUTE FUNCTION update_profile_timestamp();

-- 주석 추가
COMMENT ON TABLE user_profile IS '사용자 프로필 정보';
COMMENT ON COLUMN user_profile.name_encrypted IS '암호화된 이름';
COMMENT ON COLUMN user_profile.name_hash IS '이름 검색용 해시';
COMMENT ON COLUMN user_profile.income_bracket IS '기준 중위소득 대비 소득 구간';
COMMENT ON COLUMN user_profile.completion_rate IS '프로필 완성도 (0-100%)';
COMMENT ON COLUMN user_profile.current_step IS '현재 입력 단계';
