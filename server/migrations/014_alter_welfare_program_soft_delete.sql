-- =====================================================
-- 복지 프로그램 테이블 소프트 삭제 컬럼 추가
-- 관리자 대시보드 삭제/복구 기능 지원
-- =====================================================

-- 소프트 삭제 관련 컬럼 추가
ALTER TABLE welfare_program 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES admin_user(id),
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES admin_user(id),
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES admin_user(id),
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;

-- ==================== 인덱스 ====================

-- 소프트 삭제 필터링 인덱스 (삭제되지 않은 항목만)
CREATE INDEX IF NOT EXISTS idx_welfare_program_not_deleted 
ON welfare_program(id) WHERE deleted_at IS NULL;

-- 삭제된 항목 조회용 인덱스
CREATE INDEX IF NOT EXISTS idx_welfare_program_deleted 
ON welfare_program(deleted_at) WHERE deleted_at IS NOT NULL;

-- ==================== 코멘트 ====================

COMMENT ON COLUMN welfare_program.deleted_at IS '소프트 삭제 시간 (NULL이면 삭제되지 않음)';
COMMENT ON COLUMN welfare_program.deleted_by IS '삭제한 관리자 ID';
COMMENT ON COLUMN welfare_program.created_by IS '생성한 관리자 ID';
COMMENT ON COLUMN welfare_program.updated_by IS '마지막 수정 관리자 ID';
COMMENT ON COLUMN welfare_program.version IS 'Optimistic Locking용 버전 번호';
