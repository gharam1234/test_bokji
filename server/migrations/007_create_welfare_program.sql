-- =====================================================
-- 복지 프로그램 테이블 마이그레이션
-- 복지 추천 기능의 핵심 데이터 테이블
-- =====================================================

-- 복지 프로그램 테이블
CREATE TABLE IF NOT EXISTS welfare_program (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- 기본 정보
    name VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    summary VARCHAR(500) NOT NULL,
    
    -- 분류
    category VARCHAR(50) NOT NULL,
    target_groups VARCHAR(50)[] NOT NULL DEFAULT '{}',
    
    -- 자격 조건 (JSON)
    eligibility_criteria JSONB NOT NULL,
    
    -- 신청 정보
    application_method JSONB NOT NULL,
    required_documents JSONB NOT NULL DEFAULT '[]',
    
    -- 연락처 및 관리 기관
    contact_info JSONB,
    managing_organization VARCHAR(200) NOT NULL,
    
    -- 지원 내용
    benefits TEXT NOT NULL,
    benefit_amount VARCHAR(200),
    
    -- 신청 기간
    application_start_date DATE,
    application_end_date DATE,
    is_always_open BOOLEAN DEFAULT FALSE,
    
    -- 기타 정보
    source_url VARCHAR(500),
    tags VARCHAR(50)[] DEFAULT '{}',
    
    -- 통계
    view_count INTEGER DEFAULT 0,
    bookmark_count INTEGER DEFAULT 0,
    
    -- 상태
    is_active BOOLEAN DEFAULT TRUE,
    
    -- 타임스탬프
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==================== 인덱스 ====================

-- 카테고리 인덱스
CREATE INDEX IF NOT EXISTS idx_welfare_program_category 
ON welfare_program(category);

-- 활성 상태 인덱스
CREATE INDEX IF NOT EXISTS idx_welfare_program_is_active 
ON welfare_program(is_active);

-- 대상 그룹 GIN 인덱스 (배열 검색용)
CREATE INDEX IF NOT EXISTS idx_welfare_program_target_groups 
ON welfare_program USING GIN(target_groups);

-- 태그 GIN 인덱스
CREATE INDEX IF NOT EXISTS idx_welfare_program_tags 
ON welfare_program USING GIN(tags);

-- 자격 조건 GIN 인덱스 (JSONB 검색용)
CREATE INDEX IF NOT EXISTS idx_welfare_program_eligibility 
ON welfare_program USING GIN(eligibility_criteria);

-- 신청 마감일 인덱스
CREATE INDEX IF NOT EXISTS idx_welfare_program_deadline 
ON welfare_program(application_end_date) 
WHERE application_end_date IS NOT NULL;

-- 복합 인덱스: 활성 + 카테고리
CREATE INDEX IF NOT EXISTS idx_welfare_program_active_category 
ON welfare_program(is_active, category);

-- ==================== 트리거 ====================

-- updated_at 자동 갱신 트리거 함수
CREATE OR REPLACE FUNCTION update_welfare_program_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
DROP TRIGGER IF EXISTS trigger_welfare_program_updated_at ON welfare_program;
CREATE TRIGGER trigger_welfare_program_updated_at
    BEFORE UPDATE ON welfare_program
    FOR EACH ROW
    EXECUTE FUNCTION update_welfare_program_timestamp();

-- ==================== 샘플 데이터 ====================

INSERT INTO welfare_program (
    name, description, summary, category, target_groups,
    eligibility_criteria, application_method, required_documents,
    contact_info, managing_organization, benefits, benefit_amount,
    is_always_open, tags
) VALUES
-- 1. 청년 월세 지원
(
    '청년 월세 지원',
    '청년의 주거비 부담을 완화하기 위해 월세를 지원하는 사업입니다. 무주택 청년을 대상으로 월 최대 20만원까지 지원합니다.',
    '청년의 주거비 부담 완화를 위한 월세 지원',
    'housing',
    ARRAY['youth', 'low_income'],
    '{
        "ageMin": 19,
        "ageMax": 34,
        "incomeLevels": [1, 2, 3, 4, 5],
        "regions": [],
        "householdTypes": ["single"],
        "specialConditions": [
            {"key": "is_renter", "label": "무주택 임차인", "value": true, "isRequired": true}
        ]
    }'::JSONB,
    '{
        "online": {
            "url": "https://www.myhome.go.kr",
            "siteName": "마이홈 포털",
            "instructions": "마이홈 포털에서 온라인 신청"
        },
        "offline": {
            "location": "주민센터",
            "address": "거주지 관할 주민센터",
            "instructions": "신분증 지참 후 방문"
        }
    }'::JSONB,
    '[
        {"name": "주민등록등본", "isRequired": true},
        {"name": "소득증명서", "isRequired": true},
        {"name": "임대차계약서 사본", "isRequired": true},
        {"name": "통장 사본", "isRequired": true}
    ]'::JSONB,
    '{"phone": "1600-1004", "website": "https://www.myhome.go.kr"}'::JSONB,
    '국토교통부',
    '월 최대 20만원 지원 (최대 12개월)',
    '월 20만원',
    false,
    ARRAY['청년', '주거', '월세', '임대']
),
-- 2. 기초연금
(
    '기초연금',
    '만 65세 이상 어르신 중 소득인정액이 선정기준액 이하인 분들께 매월 기초연금을 지급합니다.',
    '65세 이상 어르신 대상 기초연금 지급',
    'living_support',
    ARRAY['senior', 'low_income'],
    '{
        "ageMin": 65,
        "ageMax": null,
        "incomeLevels": [1, 2, 3, 4],
        "regions": [],
        "householdTypes": [],
        "specialConditions": []
    }'::JSONB,
    '{
        "online": {
            "url": "https://www.bokjiro.go.kr",
            "siteName": "복지로",
            "instructions": "복지로 온라인 신청"
        },
        "offline": {
            "location": "국민연금공단 지사",
            "address": "가까운 국민연금공단 지사",
            "instructions": "신분증 및 통장 지참"
        }
    }'::JSONB,
    '[
        {"name": "신분증", "isRequired": true},
        {"name": "통장 사본", "isRequired": true},
        {"name": "소득재산 신고서", "isRequired": true}
    ]'::JSONB,
    '{"phone": "1355", "website": "https://www.bokjiro.go.kr"}'::JSONB,
    '보건복지부',
    '월 최대 334,810원 (단독가구 기준, 2026년)',
    '월 최대 33만원',
    true,
    ARRAY['노인', '연금', '기초생활']
),
-- 3. 다자녀 가구 지원
(
    '다자녀 가구 우대 지원',
    '3자녀 이상 다자녀 가구를 대상으로 다양한 혜택을 제공합니다. 전기료, 도시가스료, 통신비 할인 등의 지원을 받을 수 있습니다.',
    '다자녀 가구 대상 각종 할인 및 지원',
    'living_support',
    ARRAY['general'],
    '{
        "ageMin": null,
        "ageMax": null,
        "incomeLevels": [],
        "regions": [],
        "householdTypes": ["multi_child"],
        "specialConditions": [
            {"key": "child_count", "label": "자녀 3명 이상", "value": 3, "isRequired": true}
        ]
    }'::JSONB,
    '{
        "online": {
            "url": "https://www.gov.kr",
            "siteName": "정부24",
            "instructions": "정부24 다자녀 우대 신청"
        }
    }'::JSONB,
    '[
        {"name": "주민등록등본", "isRequired": true},
        {"name": "가족관계증명서", "isRequired": true}
    ]'::JSONB,
    '{"phone": "110", "website": "https://www.gov.kr"}'::JSONB,
    '행정안전부',
    '전기료 30% 할인, 도시가스료 할인, 통신비 할인 등',
    NULL,
    true,
    ARRAY['다자녀', '가족', '할인', '공과금']
),
-- 4. 장애인 활동지원 서비스
(
    '장애인 활동지원 서비스',
    '만 6세 이상 만 65세 미만 장애인에게 활동보조, 방문목욕, 방문간호 등 서비스를 제공합니다.',
    '장애인 대상 활동보조 서비스 지원',
    'medical',
    ARRAY['disabled'],
    '{
        "ageMin": 6,
        "ageMax": 64,
        "incomeLevels": [],
        "regions": [],
        "householdTypes": [],
        "specialConditions": [
            {"key": "has_disability", "label": "등록 장애인", "value": true, "isRequired": true}
        ]
    }'::JSONB,
    '{
        "offline": {
            "location": "국민연금공단 지사",
            "address": "가까운 국민연금공단 지사",
            "instructions": "장애인 활동지원 신청서 제출"
        }
    }'::JSONB,
    '[
        {"name": "사회보장급여 신청서", "isRequired": true},
        {"name": "장애인등록증 사본", "isRequired": true},
        {"name": "소득재산 신고서", "isRequired": true}
    ]'::JSONB,
    '{"phone": "1644-8000", "website": "https://www.nps.or.kr"}'::JSONB,
    '보건복지부',
    '월 최대 622시간 활동보조 서비스 (장애 정도에 따라 차등)',
    NULL,
    true,
    ARRAY['장애인', '활동보조', '돌봄']
),
-- 5. 국민취업지원제도
(
    '국민취업지원제도',
    '취업을 원하는 사람에게 취업지원 서비스와 생활안정을 위한 구직촉진수당을 지원합니다.',
    '구직자 대상 취업지원 및 수당 지급',
    'employment',
    ARRAY['youth', 'middle_aged', 'low_income'],
    '{
        "ageMin": 15,
        "ageMax": 69,
        "incomeLevels": [1, 2, 3, 4, 5, 6],
        "regions": [],
        "householdTypes": [],
        "specialConditions": [
            {"key": "is_unemployed", "label": "실업/미취업 상태", "value": true, "isRequired": true}
        ]
    }'::JSONB,
    '{
        "online": {
            "url": "https://www.work.go.kr",
            "siteName": "워크넷",
            "instructions": "워크넷에서 온라인 신청"
        },
        "offline": {
            "location": "고용센터",
            "address": "가까운 고용센터",
            "instructions": "신분증 지참 후 방문 상담"
        }
    }'::JSONB,
    '[
        {"name": "신분증", "isRequired": true},
        {"name": "소득증명서", "isRequired": true},
        {"name": "가족관계증명서", "isRequired": true}
    ]'::JSONB,
    '{"phone": "1350", "website": "https://www.work.go.kr"}'::JSONB,
    '고용노동부',
    '구직촉진수당 월 50만원 (최대 6개월) + 취업지원 서비스',
    '월 50만원',
    true,
    ARRAY['취업', '구직', '청년', '실업']
),
-- 6. 한부모가족 지원
(
    '한부모가족 복지급여',
    '저소득 한부모가족의 생활 안정과 자녀 양육을 위해 아동양육비, 추가 아동양육비 등을 지원합니다.',
    '저소득 한부모가족 대상 양육비 지원',
    'childcare',
    ARRAY['single_parent', 'low_income'],
    '{
        "ageMin": null,
        "ageMax": null,
        "incomeLevels": [1, 2, 3, 4],
        "regions": [],
        "householdTypes": ["single_parent"],
        "specialConditions": []
    }'::JSONB,
    '{
        "online": {
            "url": "https://www.bokjiro.go.kr",
            "siteName": "복지로",
            "instructions": "복지로에서 온라인 신청"
        },
        "offline": {
            "location": "주민센터",
            "address": "거주지 관할 주민센터",
            "instructions": "신분증 및 구비서류 지참"
        }
    }'::JSONB,
    '[
        {"name": "사회보장급여 신청서", "isRequired": true},
        {"name": "소득재산 신고서", "isRequired": true},
        {"name": "한부모가족 증명서류", "isRequired": true}
    ]'::JSONB,
    '{"phone": "129", "website": "https://www.bokjiro.go.kr"}'::JSONB,
    '여성가족부',
    '아동양육비 월 20만원, 추가 아동양육비 월 5만원 등',
    '월 20만원~',
    true,
    ARRAY['한부모', '양육비', '아동', '가족']
),
-- 7. 교육급여
(
    '교육급여',
    '기초생활수급자 및 차상위 가구의 초·중·고등학생에게 교육활동지원비를 지원합니다.',
    '저소득층 학생 대상 교육비 지원',
    'education',
    ARRAY['child', 'low_income'],
    '{
        "ageMin": 6,
        "ageMax": 18,
        "incomeLevels": [1, 2, 3],
        "regions": [],
        "householdTypes": [],
        "specialConditions": [
            {"key": "is_student", "label": "초/중/고 재학생", "value": true, "isRequired": true}
        ]
    }'::JSONB,
    '{
        "online": {
            "url": "https://www.bokjiro.go.kr",
            "siteName": "복지로",
            "instructions": "복지로에서 온라인 신청"
        },
        "offline": {
            "location": "주민센터",
            "address": "거주지 관할 주민센터",
            "instructions": "재학증명서 지참"
        }
    }'::JSONB,
    '[
        {"name": "신청서", "isRequired": true},
        {"name": "재학증명서", "isRequired": true},
        {"name": "소득증명서", "isRequired": true}
    ]'::JSONB,
    '{"phone": "129", "website": "https://www.bokjiro.go.kr"}'::JSONB,
    '교육부',
    '교육활동지원비 연 461,000원~654,000원 (학교급별 차등)',
    '연 46만원~65만원',
    true,
    ARRAY['교육', '학생', '교육비', '기초생활']
),
-- 8. 긴급복지 지원
(
    '긴급복지 지원',
    '위기상황으로 생계유지가 곤란한 저소득 가구에 긴급하게 생계·의료·주거 등을 지원합니다.',
    '위기가구 대상 긴급 생계/의료/주거 지원',
    'living_support',
    ARRAY['low_income'],
    '{
        "ageMin": null,
        "ageMax": null,
        "incomeLevels": [1, 2, 3, 4],
        "regions": [],
        "householdTypes": [],
        "specialConditions": [
            {"key": "is_crisis", "label": "위기상황 해당", "value": true, "isRequired": true}
        ]
    }'::JSONB,
    '{
        "phone": "129",
        "offline": {
            "location": "주민센터 또는 시군구청",
            "address": "거주지 관할 주민센터",
            "instructions": "긴급복지 상담 요청"
        }
    }'::JSONB,
    '[
        {"name": "신분증", "isRequired": true},
        {"name": "위기상황 증빙서류", "isRequired": false}
    ]'::JSONB,
    '{"phone": "129", "website": "https://www.bokjiro.go.kr"}'::JSONB,
    '보건복지부',
    '생계지원 최대 1,899,200원, 의료지원 최대 300만원, 주거지원 등',
    NULL,
    true,
    ARRAY['긴급', '위기', '생계', '의료']
);

-- 완료 메시지
DO $$
BEGIN
    RAISE NOTICE '007_create_welfare_program.sql 마이그레이션 완료';
END $$;
