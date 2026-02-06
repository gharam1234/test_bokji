-- =====================================================
-- 즐겨찾기 저장 시간 컬럼 추가 마이그레이션
-- bookmarked_at 컬럼으로 즐겨찾기 시간 추적
-- =====================================================

-- 1. bookmarked_at 컬럼 추가
ALTER TABLE recommendation 
ADD COLUMN IF NOT EXISTS bookmarked_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- 2. 기존 북마크 데이터의 bookmarked_at 초기화
-- is_bookmarked가 true인 기존 데이터는 updated_at 값으로 설정
UPDATE recommendation 
SET bookmarked_at = updated_at 
WHERE is_bookmarked = TRUE AND bookmarked_at IS NULL;

-- 3. 즐겨찾기 조회 최적화를 위한 복합 인덱스 추가
-- (기존 인덱스가 있다면 DROP 후 재생성)
DROP INDEX IF EXISTS idx_recommendation_user_bookmarked_at;

CREATE INDEX idx_recommendation_user_bookmarked_at 
ON recommendation(user_id, bookmarked_at DESC NULLS LAST) 
WHERE is_bookmarked = TRUE;

-- 4. 마감일 기준 즐겨찾기 조회를 위한 인덱스
-- (welfare_program의 deadline과 조인 최적화)
DROP INDEX IF EXISTS idx_recommendation_bookmarked_program;

CREATE INDEX idx_recommendation_bookmarked_program 
ON recommendation(program_id, is_bookmarked) 
WHERE is_bookmarked = TRUE;

-- ==================== 트리거 ====================

-- 5. 북마크 상태 변경 시 bookmarked_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_bookmarked_at()
RETURNS TRIGGER AS $$
BEGIN
    -- 북마크가 true로 변경되면 현재 시간 설정
    IF NEW.is_bookmarked = TRUE AND (OLD.is_bookmarked = FALSE OR OLD.is_bookmarked IS NULL) THEN
        NEW.bookmarked_at = CURRENT_TIMESTAMP;
    -- 북마크가 false로 변경되면 NULL로 설정
    ELSIF NEW.is_bookmarked = FALSE AND OLD.is_bookmarked = TRUE THEN
        NEW.bookmarked_at = NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 기존 트리거가 있다면 삭제
DROP TRIGGER IF EXISTS trigger_update_bookmarked_at ON recommendation;

-- 트리거 생성
CREATE TRIGGER trigger_update_bookmarked_at
    BEFORE UPDATE ON recommendation
    FOR EACH ROW
    WHEN (OLD.is_bookmarked IS DISTINCT FROM NEW.is_bookmarked)
    EXECUTE FUNCTION update_bookmarked_at();

-- ==================== 검증 ====================

-- 마이그레이션 검증 쿼리 (주석 처리됨, 수동 실행용)
-- SELECT 
--     COUNT(*) as total_bookmarks,
--     COUNT(bookmarked_at) as with_bookmarked_at,
--     COUNT(*) - COUNT(bookmarked_at) as without_bookmarked_at
-- FROM recommendation 
-- WHERE is_bookmarked = TRUE;

COMMENT ON COLUMN recommendation.bookmarked_at IS '즐겨찾기 추가 시간. is_bookmarked가 true일 때만 값이 존재함.';
