# user-profile - Gap 분석 결과

> 분석일: 2026-02-03  
> 분석 대상: Design 문서 vs 실제 구현 코드

---

## 📊 종합 매치율

| 영역 | 설계 항목 | 구현 완료 | 미구현 | 매치율 |
|------|----------|----------|--------|--------|
| 백엔드 | 28 | 27 | 1 | **96.4%** |
| 프론트엔드 | 42 | 35 | 7 | **83.3%** |
| **전체** | **70** | **62** | **8** | **88.6%** |

---

## 1. 구현 완료 항목 ✅

### 1.1 백엔드 (NestJS/TypeORM)

#### 데이터베이스 마이그레이션
| 항목 | 파일 | 상태 |
|------|------|------|
| user_profile 테이블 | `004_create_user_profile.sql` | ✅ |
| household_member 테이블 | `005_create_household_member.sql` | ✅ |
| profile_draft 테이블 | `006_create_profile_draft.sql` | ✅ |

#### Entities
| 항목 | 파일 | 상태 |
|------|------|------|
| UserProfile Entity | `user-profile.entity.ts` | ✅ |
| HouseholdMember Entity | `household-member.entity.ts` | ✅ |
| ProfileDraft Entity | `profile-draft.entity.ts` | ✅ |

#### DTOs
| 항목 | 파일 | 상태 |
|------|------|------|
| CreateProfileDTO | `create-profile.dto.ts` | ✅ |
| UpdateProfileDTO | `update-profile.dto.ts` | ✅ |
| ProfileResponseDTO | `profile-response.dto.ts` | ✅ |
| HouseholdMemberDTO | `household-member.dto.ts` | ✅ |
| ProfileDraftDTO | `profile-draft.dto.ts` | ✅ |

#### Services
| 항목 | 파일 | 상태 |
|------|------|------|
| Profile Service | `profile.service.ts` | ✅ |
| Encryption Service | `services/encryption.service.ts` | ✅ |
| Income Bracket Service | `services/income-bracket.service.ts` | ✅ |
| Completion Service | `services/completion.service.ts` | ✅ |

#### Controllers
| 항목 | 파일 | 상태 |
|------|------|------|
| Profile Controller | `profile.controller.ts` | ✅ |
| Profile Step Controller | `controllers/profile-step.controller.ts` | ✅ |
| Profile Draft Controller | `controllers/profile-draft.controller.ts` | ✅ |
| Household Member Controller | `controllers/household-member.controller.ts` | ✅ |

#### 기타
| 항목 | 파일 | 상태 |
|------|------|------|
| Profile Module | `profile.module.ts` | ✅ |
| Profile Repository | `profile.repository.ts` | ✅ |
| Profile Validator | `validators/profile.validator.ts` | ✅ |
| Household Validator | `validators/household.validator.ts` | ✅ |

---

### 1.2 프론트엔드 (React/TypeScript)

#### API Layer
| 항목 | 파일 | 상태 |
|------|------|------|
| Profile API | `api/profileApi.ts` | ✅ |
| Profile API Types | `api/profileApi.types.ts` | ✅ |
| Address API | `api/addressApi.ts` | ✅ |

#### Types
| 항목 | 파일 | 상태 |
|------|------|------|
| Profile Types | `types/profile.types.ts` | ✅ |
| Form Types | `types/form.types.ts` | ✅ |

#### Schemas
| 항목 | 파일 | 상태 |
|------|------|------|
| Profile Schema (Zod) | `schemas/profileSchema.ts` | ✅ |

#### Hooks
| 항목 | 파일 | 상태 |
|------|------|------|
| useProfile | `hooks/useProfile.ts` | ✅ |
| useProfileForm | `hooks/useProfileForm.ts` | ✅ |
| useAddressSearch | `hooks/useAddressSearch.ts` | ✅ |
| useAutoSave | `hooks/useAutoSave.ts` | ✅ |
| useIncomeBracket | `hooks/useIncomeBracket.ts` | ✅ |

#### Components
| 항목 | 파일 | 상태 |
|------|------|------|
| ProfileForm | `components/ProfileForm/` | ✅ |
| BasicInfoForm | `components/BasicInfoForm/` | ✅ |
| IncomeForm | `components/IncomeForm/` | ✅ |
| AddressForm | `components/AddressForm/` | ✅ |
| HouseholdForm | `components/HouseholdForm/` | ✅ |
| ProfileView | `components/ProfileView/` | ✅ |
| StepIndicator | `components/StepIndicator/` | ✅ |
| ProgressBar | `components/ProgressBar/` | ✅ |

#### Pages
| 항목 | 파일 | 상태 |
|------|------|------|
| ProfilePage | `pages/ProfilePage.tsx` | ✅ |
| ProfileEditPage | `pages/ProfileEditPage.tsx` | ✅ |

#### Constants
| 항목 | 파일 | 상태 |
|------|------|------|
| Profile Steps | `constants/profileSteps.ts` | ✅ |
| Income Options | `constants/incomeOptions.ts` | ✅ |
| Relation Options | `constants/relationOptions.ts` | ✅ |
| Validation Messages | `constants/validationMessages.ts` | ✅ |

#### Utils
| 항목 | 파일 | 상태 |
|------|------|------|
| Income Bracket Calculator | `utils/incomeBracketCalculator.ts` | ✅ |
| Completion Calculator | `utils/completionCalculator.ts` | ✅ |
| Masking Helpers | `utils/maskingHelpers.ts` | ✅ |
| Formatters | `utils/formatters.ts` | ✅ |

---

## 2. 미구현 항목 ❌

### 2.1 백엔드

| 항목 | 설계 위치 | 우선순위 | 비고 |
|------|----------|----------|------|
| 주소 검색 프록시 API | API 3.1 `/api/address/search` | 중 | 클라이언트에서 직접 호출로 대체 가능 |

### 2.2 프론트엔드

| 항목 | 설계 위치 | 우선순위 | 비고 |
|------|----------|----------|------|
| IncomeBracketInfo 컴포넌트 | 4.1 IncomeForm/ | 중 | 소득 구간 안내 별도 컴포넌트 |
| AddressSearchModal 컴포넌트 | 4.1 AddressForm/ | 중 | AddressForm에 통합됨 |
| HouseholdMemberCard 컴포넌트 | 4.1 HouseholdForm/ | 중 | HouseholdForm에 통합됨 |
| HouseholdMemberModal 컴포넌트 | 4.1 HouseholdForm/ | 중 | HouseholdForm에 통합됨 |
| ProfileSummaryCard 컴포넌트 | 4.1 ProfileView/ | 중 | ProfileView에 통합됨 |
| profileValidation.ts | 4.1 utils/ | 낮음 | schemas/profileSchema.ts로 대체 |
| 테스트 파일 (*.test.tsx) | 4.1 각 컴포넌트 | 높음 | 전체 테스트 미구현 |

---

## 3. 추가 구현 항목 ➕

> Design 문서에 명시되지 않았으나 추가로 구현된 항목

| 항목 | 파일 | 설명 |
|------|------|------|
| index.ts (feature export) | `src/features/profile/index.ts` | 모듈 통합 export |
| Validators (Backend) | `validators/*.ts` | 커스텀 유효성 검증 데코레이터 |

---

## 4. 상세 매치율 분석

### 4.1 파일 구조 매치율

```
설계된 프론트엔드 파일: 42개
구현된 프론트엔드 파일: 35개
프론트엔드 매치율: 83.3%

설계된 백엔드 파일: 28개
구현된 백엔드 파일: 27개
백엔드 매치율: 96.4%

전체 매치율: 88.6%
```

### 4.2 기능 매치율

| 기능 영역 | 설계 | 구현 | 매치율 |
|----------|------|------|--------|
| 프로필 CRUD | 5 | 5 | 100% |
| 단계별 저장 | 4 | 4 | 100% |
| 임시 저장 | 3 | 3 | 100% |
| 가구원 관리 | 3 | 3 | 100% |
| 암호화 | 2 | 2 | 100% |
| 소득 구간 계산 | 2 | 2 | 100% |
| 완성도 계산 | 2 | 2 | 100% |
| 폼 컴포넌트 | 8 | 8 | 100% |
| 테스트 | 8 | 0 | 0% |

---

## 5. 권장 조치사항

### 5.1 우선순위 높음 🔴

| 항목 | 설명 | 예상 소요 |
|------|------|----------|
| 테스트 코드 작성 | 컴포넌트 단위 테스트 및 통합 테스트 | 2~3일 |
| E2E 테스트 | 주요 사용자 시나리오 테스트 | 1일 |

### 5.2 우선순위 중간 🟡

| 항목 | 설명 | 예상 소요 |
|------|------|----------|
| 컴포넌트 분리 | HouseholdMemberCard, Modal 등 별도 분리 | 0.5일 |
| IncomeBracketInfo | 소득 구간 안내 UI 개선 | 0.5일 |

### 5.3 우선순위 낮음 🟢

| 항목 | 설명 | 예상 소요 |
|------|------|----------|
| 주소 검색 프록시 | 서버 사이드 프록시 (선택사항) | 0.5일 |

---

## 6. 코드 품질 개선 제안

### 6.1 구조적 개선

1. **컴포넌트 세분화**
   - `HouseholdForm` 내부의 모달과 카드 컴포넌트를 별도 파일로 분리
   - 재사용성과 테스트 용이성 향상

2. **에러 바운더리 추가**
   - 각 폼 컴포넌트에 에러 바운더리 적용
   - 사용자 경험 개선

### 6.2 성능 개선

1. **메모이제이션 적용**
   - 폼 컴포넌트에 `React.memo` 적용
   - 콜백 함수에 `useCallback` 적용

2. **코드 스플리팅**
   - 페이지 레벨 lazy loading 적용

### 6.3 테스트 전략

```
권장 테스트 범위:
├── 단위 테스트 (Unit)
│   ├── utils/ - 100% 커버리지
│   ├── hooks/ - 주요 로직 테스트
│   └── schemas/ - 유효성 검증 테스트
│
├── 컴포넌트 테스트 (Component)
│   ├── 각 폼 컴포넌트 렌더링 테스트
│   └── 사용자 인터랙션 테스트
│
└── 통합 테스트 (Integration)
    ├── API 연동 테스트
    └── E2E 시나리오 테스트
```

---

## 7. 결론

### ✅ 잘된 점
- 설계 문서의 핵심 기능이 **88.6%** 구현 완료
- 백엔드 API 구조가 설계와 거의 일치 (**96.4%**)
- 암호화, 소득 구간 계산 등 핵심 비즈니스 로직 완성
- 다단계 폼, 자동 저장 등 UX 기능 구현

### ⚠️ 개선 필요
- 테스트 코드 전면 미구현 (가장 시급)
- 일부 하위 컴포넌트 통합 처리됨 (분리 권장)

### 📋 다음 단계
1. **테스트 코드 작성** (우선순위 1)
2. 컴포넌트 세분화 리팩토링
3. 성능 최적화 적용
4. QA 및 버그 수정

---

*분석 완료: 2026-02-03*
