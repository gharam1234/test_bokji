# 즐겨찾기 저장 (Save Favorites) - 기능 계획서

> 작성일: 2026-02-03  
> 작성자: AI Assistant  
> 우선순위: 중간

---

## 1. 개요

### 1.1 목적
사용자가 관심 있는 복지 혜택을 즐겨찾기로 저장하고, 저장된 복지 목록을 체계적으로 관리할 수 있는 기능입니다. 추천받은 복지 혜택 중 나중에 다시 확인하거나 신청할 복지를 놓치지 않도록 돕습니다.

### 1.2 배경
- `welfare-recommendation` 기능에 이미 북마크 토글 기능이 구현됨
- 사용자가 저장한 복지를 한 곳에서 모아보고 관리할 필요성
- 추천 → 저장 → 관리 → 신청의 자연스러운 사용자 여정 완성
- 복지 신청 마감일 관리, 신청 상태 추적 등 확장 가능성

### 1.3 기존 구현 현황
| 항목 | 상태 | 위치 |
|------|------|------|
| `is_bookmarked` 컬럼 | ✅ 구현됨 | `recommendation` 테이블 |
| `toggleBookmark()` API | ✅ 구현됨 | `RecommendationController` |
| `useBookmark` 훅 | ✅ 구현됨 | `src/features/recommendation/hooks/` |
| 북마크 버튼 UI | ✅ 구현됨 | `RecommendationCard`, `WelfareDetailPage` |
| **즐겨찾기 목록 페이지** | ❌ 미구현 | - |
| **폴더/태그 관리** | ❌ 미구현 | - |

---

## 2. 목표

### 2.1 핵심 목표
- [ ] 즐겨찾기 목록 전용 페이지 구현
- [ ] 즐겨찾기 필터링 및 정렬 기능 구현
- [ ] 즐겨찾기 일괄 관리 (다중 선택, 일괄 삭제)
- [ ] 마감일 기준 알림 연동 준비 (notification-system 연계)

### 2.2 확장 목표 (선택)
- [ ] 폴더/컬렉션으로 즐겨찾기 그룹화
- [ ] 즐겨찾기 메모/노트 추가 기능
- [ ] 즐겨찾기 공유 기능 (링크 생성)
- [ ] 신청 상태 추적 (예정/신청중/완료)

---

## 3. 범위

### 3.1 포함 (In Scope)
- 즐겨찾기 목록 조회 페이지 (`/favorites`)
- 카테고리별 필터링
- 마감일순/저장일순/매칭률순 정렬
- 즐겨찾기 해제 (개별/일괄)
- 즐겨찾기 검색 (저장된 항목 내)
- 마감 임박 하이라이트 표시
- 빈 상태 UI (저장된 복지 없음)
- 반응형 레이아웃

### 3.2 제외 (Out of Scope)
- 폴더/컬렉션 기능 (v2.0 예정)
- 다른 사용자와 즐겨찾기 공유
- 복지 신청 대행
- 신청 완료 후 결과 추적
- 즐겨찾기 데이터 내보내기 (CSV, PDF)

---

## 4. 기술적 고려사항

### 4.1 필요 기술 스택
| 영역 | 기술 | 비고 |
|------|------|------|
| Frontend | React, TypeScript, Tailwind CSS | 기존 스택 활용 |
| Backend | Node.js, NestJS | 기존 스택 활용 |
| Database | PostgreSQL | 기존 테이블 활용 |
| 상태 관리 | React Query | 캐싱, 낙관적 업데이트 |

### 4.2 의존성
```
welfare-recommendation (필수)
         │
         ├── recommendation 테이블 (is_bookmarked)
         ├── toggleBookmark API
         └── useBookmark 훅
         │
         ▼
save-favorites (현재)
         │
         └── notification-system (선택, 향후 연동)
```

| 의존 기능 | 필수 여부 | 연동 내용 |
|----------|----------|----------|
| welfare-recommendation | 필수 | 북마크 데이터, API 재사용 |
| user-profile | 필수 | 사용자 ID 기반 즐겨찾기 |
| notification-system | 선택 | 마감일 알림 (향후) |

### 4.3 데이터 모델

기존 `recommendation` 테이블 활용:
```sql
-- 기존 테이블 (변경 없음)
recommendation (
  id, user_id, program_id, match_score,
  is_bookmarked,    -- 즐겨찾기 여부 ✅
  bookmarked_at,    -- 즐겨찾기 시간 (추가 필요)
  ...
)
```

선택적 확장 (v2.0):
```sql
-- 폴더/컬렉션 기능 시 추가
favorite_folder (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES user_profile(id),
  name VARCHAR(100),
  color VARCHAR(20),
  created_at TIMESTAMP
)

-- recommendation에 folder_id 추가
ALTER TABLE recommendation ADD COLUMN folder_id UUID REFERENCES favorite_folder(id);
```

### 4.4 API 설계 (예시)
```
GET /api/favorites
  - Query: category, sortBy, search, page, limit
  - Response: { favorites: [], totalCount, categories }

DELETE /api/favorites/:id
  - 개별 즐겨찾기 해제

DELETE /api/favorites/bulk
  - Body: { ids: [] }
  - 일괄 즐겨찾기 해제

GET /api/favorites/stats
  - Response: { total, byCategory, upcomingDeadlines }
```

### 4.5 UI 컴포넌트 구조
```
src/features/favorites/
├── pages/
│   └── FavoritesPage.tsx
├── components/
│   ├── FavoritesList/
│   ├── FavoritesFilter/
│   ├── FavoritesSort/
│   ├── FavoritesCard/
│   ├── EmptyFavorites/
│   ├── BulkActions/
│   └── DeadlineAlert/
├── hooks/
│   ├── useFavorites.ts
│   └── useBulkActions.ts
├── api/
│   └── favoritesApi.ts
└── types/
    └── favorites.types.ts
```

---

## 5. 예상 일정

| 단계 | 예상 소요 | 시작일 | 완료일 | 담당 |
|------|----------|--------|--------|------|
| 요구사항 분석 | 0.5일 | 2026-02-04 | 2026-02-04 | 기획팀 |
| DB 스키마 수정 | 0.5일 | 2026-02-04 | 2026-02-04 | 백엔드팀 |
| 백엔드 API 개발 | 1일 | 2026-02-05 | 2026-02-05 | 백엔드팀 |
| 프론트엔드 개발 | 1.5일 | 2026-02-05 | 2026-02-06 | 프론트엔드팀 |
| 통합 테스트 | 0.5일 | 2026-02-07 | 2026-02-07 | QA팀 |
| **총 소요 기간** | **약 4일** | | | |

> ⚡ 기존 `welfare-recommendation` 인프라 활용으로 빠른 개발 가능

---

## 6. 위험 요소와 대응 방안

| 리스크 | 영향도 | 발생 확률 | 대응 방안 |
|--------|--------|----------|----------|
| 기존 북마크 API 변경 필요 | 낮음 | 낮음 | 기존 API 확장, 하위 호환성 유지 |
| 대량 즐겨찾기 성능 저하 | 중간 | 낮음 | 페이지네이션, 가상 스크롤 적용 |
| 일괄 삭제 시 데이터 손실 | 높음 | 낮음 | 삭제 전 확인 모달, Soft Delete 고려 |
| welfare-recommendation 변경 영향 | 중간 | 낮음 | 인터페이스 분리, 의존성 최소화 |
| 마감일 알림 연동 복잡성 | 낮음 | 중간 | v1.0에서는 UI 표시만, 알림은 v2.0 |

---

## 7. 성공 지표 (KPI)

- 즐겨찾기 페이지 로딩 시간: 평균 200ms 이내
- 사용자당 평균 즐겨찾기 수: 5개 이상
- 즐겨찾기 → 복지 상세 전환율: 60% 이상
- 마감일 전 재방문율: 30% 이상

---

## 8. 다음 단계

`Cmd+Shift+P` → `BKIT: Design 문서 생성`을 실행하여 설계 문서를 작성하세요.

---
*우선순위: 중간*  
*예상 소요: 4일*  
*의존성: welfare-recommendation (필수)*
