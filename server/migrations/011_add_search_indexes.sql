-- =====================================================
-- 검색 최적화 인덱스 마이그레이션
-- Full-Text Search 및 필터/정렬 인덱스 추가
-- =====================================================

-- 1. Full-Text Search 인덱스 (GIN)
-- 한글 검색을 위해 'simple' 설정 사용
DROP INDEX IF EXISTS idx_welfare_program_search;

CREATE INDEX idx_welfare_program_search 
ON welfare_program 
USING GIN(
  to_tsvector('simple', 
    COALESCE(name, '') || ' ' || 
    COALESCE(summary, '') || ' ' || 
    COALESCE(managing_organization, '')
  )
);

-- 2. ILIKE 검색용 trigram 인덱스 (선택)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

DROP INDEX IF EXISTS idx_welfare_program_name_trgm;

CREATE INDEX idx_welfare_program_name_trgm 
ON welfare_program 
USING GIN(name gin_trgm_ops);

DROP INDEX IF EXISTS idx_welfare_program_summary_trgm;

CREATE INDEX idx_welfare_program_summary_trgm 
ON welfare_program 
USING GIN(summary gin_trgm_ops);

-- 3. 카테고리 인덱스
DROP INDEX IF EXISTS idx_welfare_program_category;

CREATE INDEX idx_welfare_program_category 
ON welfare_program(category);

-- 4. 지역 코드 인덱스 (eligibility_criteria JSONB 내 region 필드)
DROP INDEX IF EXISTS idx_welfare_program_region;

CREATE INDEX idx_welfare_program_region 
ON welfare_program USING GIN((eligibility_criteria -> 'region'));

-- 5. 카테고리 + 활성화 복합 인덱스
DROP INDEX IF EXISTS idx_welfare_program_filter;

CREATE INDEX idx_welfare_program_filter 
ON welfare_program(category, is_active);

-- 6. 마감일 정렬용 인덱스
DROP INDEX IF EXISTS idx_welfare_program_deadline;

CREATE INDEX idx_welfare_program_deadline 
ON welfare_program(application_end_date NULLS LAST) 
WHERE is_active = TRUE;

-- 7. 최신순 정렬용 인덱스
DROP INDEX IF EXISTS idx_welfare_program_created;

CREATE INDEX idx_welfare_program_created 
ON welfare_program(created_at DESC) 
WHERE is_active = TRUE;

-- 8. 인기순(조회수) 정렬용 인덱스
DROP INDEX IF EXISTS idx_welfare_program_views;

CREATE INDEX idx_welfare_program_views 
ON welfare_program(view_count DESC) 
WHERE is_active = TRUE;

-- 9. 활성화 상태 인덱스
DROP INDEX IF EXISTS idx_welfare_program_active;

CREATE INDEX idx_welfare_program_active 
ON welfare_program(is_active);

-- =====================================================
-- 검색 함수 생성 (Full-Text Search 헬퍼)
-- =====================================================

-- 검색 결과 랭킹 함수
CREATE OR REPLACE FUNCTION search_welfare_programs(
  search_keyword TEXT,
  filter_category VARCHAR(50) DEFAULT NULL,
  filter_region VARCHAR(10) DEFAULT NULL,
  sort_by VARCHAR(20) DEFAULT 'relevance',
  sort_order VARCHAR(4) DEFAULT 'desc',
  page_num INTEGER DEFAULT 1,
  page_size INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  name VARCHAR(200),
  summary VARCHAR(500),
  description TEXT,
  category VARCHAR(50),
  managing_organization VARCHAR(200),
  eligibility_criteria JSONB,
  benefits TEXT,
  application_end_date DATE,
  view_count INTEGER,
  created_at TIMESTAMP,
  relevance_score REAL,
  total_count BIGINT
) AS $$
DECLARE
  search_vector tsvector;
  search_query tsquery;
  offset_val INTEGER;
BEGIN
  offset_val := (page_num - 1) * page_size;
  
  -- 검색어가 없으면 빈 tsquery 사용
  IF search_keyword IS NOT NULL AND search_keyword != '' THEN
    search_query := plainto_tsquery('simple', search_keyword);
  END IF;

  RETURN QUERY
  WITH filtered_programs AS (
    SELECT 
      wp.*,
      CASE 
        WHEN search_keyword IS NOT NULL AND search_keyword != '' THEN
          ts_rank(
            to_tsvector('simple', 
              COALESCE(wp.name, '') || ' ' || 
              COALESCE(wp.summary, '') || ' ' || 
              COALESCE(wp.managing_organization, '')
            ),
            search_query
          )
        ELSE 1.0
      END AS rank_score
    FROM welfare_program wp
    WHERE wp.is_active = TRUE
      AND (
        search_keyword IS NULL 
        OR search_keyword = ''
        OR to_tsvector('simple', 
            COALESCE(wp.name, '') || ' ' || 
            COALESCE(wp.summary, '') || ' ' || 
            COALESCE(wp.managing_organization, '')
          ) @@ search_query
        OR wp.name ILIKE '%' || search_keyword || '%'
        OR wp.summary ILIKE '%' || search_keyword || '%'
      )
      AND (filter_category IS NULL OR wp.category = filter_category)
      AND (
        filter_region IS NULL 
        OR wp.eligibility_criteria -> 'region' ? filter_region
        OR wp.eligibility_criteria -> 'region' ? '00'  -- 전국
      )
  ),
  counted AS (
    SELECT COUNT(*) AS cnt FROM filtered_programs
  )
  SELECT 
    fp.id,
    fp.name,
    fp.summary,
    fp.description,
    fp.category,
    fp.managing_organization,
    fp.eligibility_criteria,
    fp.benefits,
    fp.application_end_date,
    fp.view_count,
    fp.created_at,
    fp.rank_score::REAL AS relevance_score,
    c.cnt AS total_count
  FROM filtered_programs fp, counted c
  ORDER BY
    CASE WHEN sort_by = 'relevance' AND sort_order = 'desc' THEN fp.rank_score END DESC NULLS LAST,
    CASE WHEN sort_by = 'relevance' AND sort_order = 'asc' THEN fp.rank_score END ASC NULLS LAST,
    CASE WHEN sort_by = 'deadline' AND sort_order = 'asc' THEN fp.application_end_date END ASC NULLS LAST,
    CASE WHEN sort_by = 'deadline' AND sort_order = 'desc' THEN fp.application_end_date END DESC NULLS LAST,
    CASE WHEN sort_by = 'latest' AND sort_order = 'desc' THEN fp.created_at END DESC,
    CASE WHEN sort_by = 'latest' AND sort_order = 'asc' THEN fp.created_at END ASC,
    CASE WHEN sort_by = 'popular' AND sort_order = 'desc' THEN fp.view_count END DESC,
    CASE WHEN sort_by = 'popular' AND sort_order = 'asc' THEN fp.view_count END ASC,
    fp.created_at DESC
  LIMIT page_size
  OFFSET offset_val;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 완료 메시지
-- =====================================================
-- 마이그레이션 완료: 검색 인덱스 및 함수 생성됨
