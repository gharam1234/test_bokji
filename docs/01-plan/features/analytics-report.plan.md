# 분석 리포트 (Analytics Report) - 기능 계획서

> 작성일: 2026-02-03
> 작성자: Unknown
> 우선순위: 낮음

---

## 1. 개요

### 1.1 목적
사용자의 복지 서비스 이용 현황을 시각화하여 제공하고, 개인화된 통계 리포트를 통해 복지 혜택 활용도를 높일 수 있도록 지원합니다.

### 1.2 배경
- 사용자가 어떤 복지 혜택을 탐색하고 관심을 가졌는지 한눈에 파악하기 어려움
- 복지 이용 패턴 분석을 통해 추가적인 혜택 발굴 기회 제공
- 개인별 복지 활용 현황을 시각적으로 제공하여 서비스 가치 인식 향상
- 데이터 기반의 사용자 인사이트 제공으로 복지 사각지대 해소 기여

---

## 2. 목표

- [ ] 개인 복지 탐색 활동 요약 대시보드 구현
- [ ] 카테고리별 관심 복지 분포 차트 구현
- [ ] 월별/주별 복지 탐색 트렌드 그래프 구현
- [ ] 추천받은 복지 vs 실제 조회한 복지 비교 분석
- [ ] 즐겨찾기 복지 현황 요약 제공
- [ ] 맞춤형 복지 활용 팁/인사이트 제공
- [ ] 리포트 PDF 다운로드 기능 구현
- [ ] 기간별 리포트 조회 기능 구현 (주간/월간/연간)

---

## 3. 범위

### 3.1 포함 (In Scope)
- 개인 대시보드 (복지 탐색 요약)
- 카테고리별 관심 복지 분포 (파이 차트, 바 차트)
- 시간대별 활동 트렌드 (라인 차트)
- 추천 적중률 분석 (추천 → 조회 → 즐겨찾기 전환율)
- 즐겨찾기 현황 요약
- 인사이트 카드 (예: "지난 달 가장 많이 본 카테고리: 주거지원")
- PDF 리포트 다운로드
- 기간 필터 (최근 7일, 30일, 90일, 1년)

### 3.2 제외 (Out of Scope)
- 다른 사용자와의 비교 분석
- 지역별/연령대별 통계 (개인정보 이슈)
- 실시간 스트리밍 분석
- 예측 분석 (향후 관심 복지 예측)
- 외부 공유 기능 (소셜 미디어 등)
- 상세 로그 데이터 조회

---

## 4. 기술적 고려사항

### 4.1 필요 기술 스택
| 영역 | 기술 | 비고 |
|------|------|------|
| Frontend | React, TypeScript | 대시보드 UI |
| 차트 라이브러리 | Recharts / Chart.js / D3.js | 데이터 시각화 |
| Backend | Node.js / Spring Boot | 분석 API |
| Database | PostgreSQL | 이용 로그 데이터 |
| 집계 처리 | 배치 작업 또는 Materialized View | 통계 사전 계산 |
| PDF 생성 | Puppeteer / jsPDF | 리포트 다운로드 |

### 4.2 의존성
- **로그인/인증 기능 (필수)**: 사용자 식별
- **Welfare Recommendation**: 추천 이력 데이터
- **Search Welfare**: 검색 이력 데이터
- **Save Favorites**: 즐겨찾기 데이터
- 사용자 활동 로그 수집 시스템

### 4.3 데이터 수집 및 분석 아키텍처
```
데이터 흐름:
1. 사용자 활동 발생 (검색, 조회, 즐겨찾기 등)
2. 활동 로그 저장 (UserActivityLog 테이블)
3. 배치 작업으로 일별/주별 집계 (UserAnalyticsSummary)
4. API 요청 시 집계 데이터 조회
5. 프론트엔드에서 차트 렌더링
```

### 4.4 데이터 모델 (예시)
```
UserActivityLog {
  id: UUID
  userId: UUID (FK)
  activityType: Enum (search, view, bookmark, recommendation_click)
  targetId: UUID (복지 프로그램 ID)
  targetCategory: String
  metadata: JSON (검색어, 필터 조건 등)
  createdAt: DateTime
}

UserAnalyticsSummary {
  id: UUID
  userId: UUID (FK)
  periodType: Enum (daily, weekly, monthly)
  periodStart: Date
  periodEnd: Date
  totalSearches: Number
  totalViews: Number
  totalBookmarks: Number
  recommendationClicks: Number
  topCategories: JSON (카테고리별 카운트)
  topPrograms: JSON (상위 조회 복지)
  createdAt: DateTime
}

UserInsight {
  id: UUID
  userId: UUID (FK)
  insightType: String
  title: String
  description: Text
  relatedData: JSON
  validUntil: Date
  createdAt: DateTime
}
```

### 4.5 API 설계 (예시)
```
# 분석 대시보드
GET /api/analytics/summary           - 전체 요약 (기간 파라미터)
GET /api/analytics/category-distribution - 카테고리별 분포
GET /api/analytics/activity-trend    - 활동 트렌드 (시계열)
GET /api/analytics/recommendation-stats - 추천 통계
GET /api/analytics/favorites-summary - 즐겨찾기 요약
GET /api/analytics/insights          - 개인화 인사이트

# 리포트
GET /api/analytics/report/pdf        - PDF 리포트 다운로드
```

### 4.6 차트 구성 계획
| 차트 | 유형 | 데이터 |
|------|------|--------|
| 활동 요약 카드 | 숫자 카드 | 총 검색, 조회, 즐겨찾기 수 |
| 카테고리 분포 | 도넛 차트 | 관심 복지 카테고리 비율 |
| 활동 트렌드 | 라인 차트 | 일별/주별 활동량 추이 |
| 추천 전환율 | 퍼널 차트 | 추천 → 조회 → 즐겨찾기 |
| 인기 복지 | 수평 바 차트 | 상위 5개 조회 복지 |

---

## 5. 예상 일정

| 단계 | 예상 소요 | 시작일 | 완료일 | 담당 |
|------|----------|--------|--------|------|
| 요구사항 분석 | 2일 | 2026-05-25 | 2026-05-26 | 기획팀 |
| 데이터 모델 및 집계 설계 | 2일 | 2026-05-27 | 2026-05-28 | 백엔드팀 |
| UI/UX 설계 | 3일 | 2026-05-27 | 2026-05-29 | 디자인팀 |
| 로그 수집 시스템 구현 | 3일 | 2026-05-29 | 2026-06-02 | 백엔드팀 |
| 집계 배치 및 API 개발 | 4일 | 2026-06-01 | 2026-06-04 | 백엔드팀 |
| 대시보드 UI 개발 | 5일 | 2026-06-03 | 2026-06-09 | 프론트엔드팀 |
| PDF 리포트 기능 | 2일 | 2026-06-08 | 2026-06-09 | 풀스택팀 |
| 통합 테스트 | 3일 | 2026-06-10 | 2026-06-12 | QA팀 |
| **총 소요 기간** | **약 3주** | | | |

> ⚠️ 모든 핵심 기능 및 Admin Dashboard 완료 후 착수 (최종 단계)

---

## 6. 위험 요소와 대응 방안

| 리스크 | 영향도 | 발생 확률 | 대응 방안 |
|--------|--------|----------|----------|
| 로그 데이터 누락 | 높음 | 중간 | 로그 수집 실패 모니터링, 재처리 로직 구현 |
| 집계 쿼리 성능 저하 | 중간 | 중간 | 사전 집계 테이블, 인덱스 최적화, 파티셔닝 |
| 개인정보 노출 우려 | 높음 | 낮음 | 집계 데이터만 표시, 원본 로그 접근 제한 |
| 차트 렌더링 성능 | 낮음 | 중간 | 데이터 포인트 제한, 지연 로딩, 가상화 |
| 사용자 관심도 부족 | 중간 | 중간 | 인사이트 카드로 가치 전달, 온보딩 가이드 |
| PDF 생성 지연 | 낮음 | 중간 | 비동기 생성, 다운로드 준비 알림 |

---

## 7. 성공 지표 (KPI)

- 분석 페이지 방문율: 로그인 사용자의 30% 이상
- 평균 체류 시간: 2분 이상
- PDF 다운로드율: 분석 페이지 방문자의 10% 이상
- 인사이트 클릭율: 표시된 인사이트의 20% 이상 클릭
- 사용자 만족도: 4.0/5.0 이상 (피드백 설문)

---

**다음 단계**: `/pdca design analytics-report`
