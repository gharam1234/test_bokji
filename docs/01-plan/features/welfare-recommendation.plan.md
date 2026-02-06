# 복지 추천 (Welfare Recommendation) - 기능 계획서

> 작성일: 2026-02-03
> 작성자: Unknown
> 우선순위: 높음

---

## 1. 개요

### 1.1 목적
사용자가 입력한 프로필 정보(나이, 소득수준, 거주지역, 가구 구성 등)를 기반으로 맞춤형 복지 혜택을 자동으로 추천하는 핵심 기능입니다. 복잡한 자격 조건을 분석하여 사용자가 받을 수 있는 복지 혜택을 놓치지 않도록 돕습니다.

### 1.2 배경
- 국내 복지 제도는 2,000개 이상으로, 일반 시민이 자신에게 해당하는 혜택을 파악하기 어려움
- 복지 사각지대 해소를 위한 능동적 정보 제공 필요
- User Profile 기능과 연계하여 mybokji 앱의 핵심 가치인 "개인화된 추천" 실현
- Search Welfare 기능과 상호 보완하여 종합적인 복지 정보 탐색 경험 제공

---

## 2. 목표

- [ ] 사용자 프로필 기반 복지 자격 조건 매칭 알고리즘 구현
- [ ] 추천 복지 목록 조회 API 및 UI 구현
- [ ] 추천 결과 정확도 점수(매칭률) 표시 기능 구현
- [ ] 복지 카테고리별 추천 그룹화 (생활지원, 주거, 교육, 의료, 고용 등)
- [ ] 추천 결과 상세 페이지 연결 (신청 방법, 필요 서류, 문의처)
- [ ] 추천 이유 설명 기능 구현 ("회원님의 연령과 소득 수준에 해당됩니다")
- [ ] 새로운 복지 혜택 추가 시 재추천 트리거 기능 구현
- [ ] 추천 결과 북마크/즐겨찾기 연동 (Save Favorites 기능 연계)

---

## 3. 범위

### 3.1 포함 (In Scope)
- 복지 자격 조건 데이터베이스 설계 및 구축
- 프로필-복지 매칭 엔진 개발
- 추천 복지 목록 조회 API
- 추천 결과 카드형 UI
- 매칭률/추천 점수 계산 로직
- 추천 이유 텍스트 생성
- 복지 상세 정보 조회 (신청 방법, 필요 서류, 담당 기관, 문의처)
- 카테고리별 필터링 및 정렬
- 추천 결과 캐싱 (프로필 변경 시 갱신)

### 3.2 제외 (Out of Scope)
- AI/ML 기반 추천 (1차 버전은 규칙 기반 매칭)
- 복지 신청 대행 기능
- 타 사용자 기반 협업 필터링
- 복지 수령 이력 관리
- 실시간 자격 검증 (공공 API 연동)
- 행정 서류 자동 작성

---

## 4. 기술적 고려사항

### 4.1 필요 기술 스택
| 영역 | 기술 | 비고 |
|------|------|------|
| Frontend | React, TypeScript, Tailwind CSS | 추천 결과 UI, 카드 컴포넌트 |
| Backend | Node.js, Express | 추천 API, 매칭 엔진 |
| Database | PostgreSQL | 복지 데이터, 자격 조건 저장 |
| 캐싱 | Redis | 추천 결과 캐싱, 성능 최적화 |
| 테스트 | Jest | 매칭 알고리즘 단위 테스트 |

### 4.2 의존성
- **User Profile 기능**: 사용자 프로필 데이터 필수 (선행 개발 필요)
- **Save Favorites 기능**: 즐겨찾기 연동 (병렬 개발 가능)
- 복지 마스터 데이터 수집 및 정제 (공공 데이터 포털 활용)

### 4.3 추천 알고리즘 흐름
```
추천 프로세스:
1. 사용자 프로필 조회 (User Profile API)
2. 프로필 기반 자격 조건 추출
   - 나이 범위
   - 소득 분위
   - 거주 지역 (시/도, 시/군/구)
   - 가구 유형 (1인가구, 다자녀, 한부모 등)
   - 특수 조건 (장애 여부, 취업 상태 등)
3. 복지 프로그램별 자격 조건 매칭
   - 필수 조건 충족 여부 확인
   - 선택 조건 가점 계산
4. 매칭률 점수 계산 (0~100%)
5. 점수 기준 정렬 및 카테고리별 그룹화
6. 추천 이유 텍스트 생성
7. 결과 캐싱 및 반환
```

### 4.4 데이터 모델 (예시)
```
WelfareProgram {
  id: UUID
  name: String
  description: Text
  category: Enum (생활지원, 주거, 교육, 의료, 고용, 기타)
  targetGroup: String[]
  eligibilityCriteria: JSON
  applicationMethod: Text
  requiredDocuments: String[]
  contactInfo: JSON
  startDate: Date
  endDate: Date (nullable)
  isActive: Boolean
  createdAt: DateTime
  updatedAt: DateTime
}

EligibilityCriteria {
  ageMin: Number (nullable)
  ageMax: Number (nullable)
  incomeLevel: Enum[] (1~10분위)
  regions: String[] (지역 코드)
  householdTypes: String[]
  specialConditions: JSON
}

Recommendation {
  id: UUID
  userId: UUID
  programId: UUID
  matchScore: Number (0-100)
  matchReasons: String[]
  isBookmarked: Boolean
  viewedAt: DateTime (nullable)
  createdAt: DateTime
}
```

### 4.5 API 설계 (예시)
```
GET /api/recommendations
  - Query: category, sortBy, page, limit
  - Response: { recommendations: [], totalCount, categories }

GET /api/recommendations/:programId
  - Response: { program, matchScore, matchReasons, applicationInfo }

POST /api/recommendations/refresh
  - 프로필 변경 시 추천 결과 갱신 트리거

GET /api/welfare-programs/:id
  - 복지 프로그램 상세 정보 조회
```

---

## 5. 예상 일정

| 단계 | 예상 소요 | 시작일 | 완료일 | 담당 |
|------|----------|--------|--------|------|
| 요구사항 분석 | 2일 | 2026-02-10 | 2026-02-11 | 기획팀 |
| 복지 데이터 수집/정제 | 5일 | 2026-02-10 | 2026-02-14 | 데이터팀 |
| DB 스키마 설계 | 2일 | 2026-02-12 | 2026-02-13 | 백엔드팀 |
| 매칭 알고리즘 개발 | 5일 | 2026-02-14 | 2026-02-20 | 백엔드팀 |
| 추천 API 개발 | 4일 | 2026-02-19 | 2026-02-24 | 백엔드팀 |
| UI/UX 설계 | 3일 | 2026-02-14 | 2026-02-18 | 디자인팀 |
| 프론트엔드 개발 | 5일 | 2026-02-19 | 2026-02-25 | 프론트엔드팀 |
| 캐싱 및 성능 최적화 | 2일 | 2026-02-24 | 2026-02-25 | 백엔드팀 |
| 통합 테스트 | 3일 | 2026-02-26 | 2026-02-28 | QA팀 |
| **총 소요 기간** | **약 3주** | | | |

> ⚠️ User Profile 기능 개발과 병행하여 진행, 프로필 API 완료 후 통합 테스트 실시

---

## 6. 위험 요소와 대응 방안

| 리스크 | 영향도 | 발생 확률 | 대응 방안 |
|--------|--------|----------|----------|
| 복지 데이터 수집 지연 | 높음 | 중간 | 공공 데이터 포털 우선 활용, 주요 복지 100개 우선 구축 |
| 자격 조건 복잡성 | 중간 | 높음 | 단순화된 조건부터 시작, 점진적 고도화 |
| 추천 정확도 저하 | 높음 | 중간 | 매칭 규칙 검증 테스트 케이스 확보, 사용자 피드백 수집 |
| User Profile 기능 지연 | 높음 | 낮음 | Mock 데이터로 선행 개발, 인터페이스 사전 합의 |
| 추천 결과 응답 지연 | 중간 | 낮음 | Redis 캐싱 적용, 배치 사전 계산 검토 |
| 복지 정보 변경 추적 어려움 | 중간 | 중간 | 정기 데이터 갱신 스케줄링, 변경 알림 로직 구현 |

---

## 7. 성공 지표 (KPI)

- 추천 응답 시간: 평균 300ms 이내
- 추천 정확도: 사용자 자격 충족률 90% 이상
- 추천 결과 클릭률: 40% 이상
- 추천 복지 신청 전환율: 10% 이상
- 사용자 만족도 (앱 내 피드백): 4.0/5.0 이상

---

## 8. 다음 단계

`Cmd+Shift+P` → `BKIT: Design 문서 생성`을 실행하여 설계 문서를 작성하세요.

---
*우선순위: 높음*
