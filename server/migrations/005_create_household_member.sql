-- ============================================
-- 005: 가구원 테이블 생성
-- 작성일: 2026-02-03
-- 설명: 프로필에 연결된 가구원 정보 저장
-- ============================================

-- 가구원 테이블
CREATE TABLE IF NOT EXISTS household_member (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES user_profile(id) ON DELETE CASCADE,
    
    -- 가구원 정보
    relation VARCHAR(20) NOT NULL,
    name_encrypted BYTEA NOT NULL,
    birth_date DATE NOT NULL,
    gender VARCHAR(10) NOT NULL,
    has_disability BOOLEAN DEFAULT FALSE,
    has_income BOOLEAN DEFAULT FALSE,
    display_order INTEGER NOT NULL DEFAULT 0,
    
    -- 타임스탬프
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 제약 조건
    CONSTRAINT valid_member_relation CHECK (
        relation IN ('self', 'spouse', 'child', 'parent', 'grandparent', 'sibling', 'other')
    ),
    CONSTRAINT valid_member_gender CHECK (gender IN ('male', 'female', 'other'))
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_household_profile_id ON household_member(profile_id);
CREATE INDEX IF NOT EXISTS idx_household_relation ON household_member(relation);
CREATE INDEX IF NOT EXISTS idx_household_order ON household_member(profile_id, display_order);

-- 업데이트 트리거
DROP TRIGGER IF EXISTS household_updated ON household_member;
CREATE TRIGGER household_updated
    BEFORE UPDATE ON household_member
    FOR EACH ROW
    EXECUTE FUNCTION update_profile_timestamp();

-- 주석 추가
COMMENT ON TABLE household_member IS '가구원 정보';
COMMENT ON COLUMN household_member.relation IS '가구주와의 관계';
COMMENT ON COLUMN household_member.name_encrypted IS '암호화된 이름';
COMMENT ON COLUMN household_member.has_disability IS '장애 여부';
COMMENT ON COLUMN household_member.has_income IS '소득 유무';
COMMENT ON COLUMN household_member.display_order IS '표시 순서';
