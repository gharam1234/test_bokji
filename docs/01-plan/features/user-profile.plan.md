# 사용자 프로필 (User Profile) - 기능 계획서

> 작성일: 2026-02-05
> 작성자: Unknown
> 우선순위: 높음

---

## 1. 개요

### 1.1 목적
사용자의 기본 정보(나이, 소득, 거주지, 가구 구성 등)를 입력받아 저장하고 관리하는 기능입니다. 이 정보를 기반으로 맞춤형 복지 혜택 추천이 가능하도록 하여, 복지 사각지대를 해소하고 사용자에게 최적화된 서비스를 제공합니다.

### 1.2 배경
- 복지 서비스는 나이, 소득, 거주지, 가구 유형 등에 따라 수혜 자격이 결정됨
- 정확한 사용자 프로필 정보가 있어야 적합한 복지 혜택을 추천할 수 있음
- 사용자가 복잡한 자격 조건을 직접 확인하지 않아도 시스템이 자동으로 매칭 가능
- mybokji 앱의 핵심 기능인 "복지 추천(Welfare Recommendation)"의 필수 선행 기능
- 프로필 입력 과정의 간소화로 사용자 진입 장벽 최소화 필요

---

## 2. 목표

- [ ] 사용자 기본 정보 입력 폼 UI 구현 (나이, 성별, 연락처)
- [ ] 소득 정보 입력 기능 구현 (소득 수준, 소득 분위)
- [ ] 거주지 정보 입력 기능 구현 (시/도, 시/군/구, 상세주소)
- [ ] 가구 구성 정보 입력 기능 구현 (가구원 수, 가구 유형)
- [ ] 가구원 정보 관리 기능 구현 (추가/수정/삭제)
- [ ] 특수 조건 입력 기능 구현 (장애 여부, 취업 상태, 한부모 여부 등)
- [ ] 프로필 저장 및 조회 API 구현
- [ ] 프로필 수정 기능 구현
- [ ] 프로필 입력 진행률 표시 기능 구현
- [ ] 입력값 유효성 검사 구현
- [ ] 프로필 임시 저장(Draft) 기능 구현

---

## 3. 범위

### 3.1 포함 (In Scope)
- 사용자 프로필 데이터베이스 스키마 설계
- 프로필 입력/수정/조회 API 개발
- 단계별 프로필 입력 UI (Wizard 형태)
- 가구원 정보 CRUD 기능
- 입력값 유효성 검사 (클라이언트/서버 양측)
- 프로필 완성도 계산 및 표시
- 프로필 임시 저장 기능
- 개인정보 암호화 저장

### 3.2 제외 (Out of Scope)
- 공공기관 API 연동을 통한 자동 정보 조회
- 신분증/서류 스캔 및 OCR 인식
- 소셜 로그인을 통한 프로필 자동 입력
- 가족 계정 연동 기능
- 프로필 정보 공유 기능
- 타 플랫폼 데이터 연동 (건강보험, 국세청 등)

---

## 4. 기술적 고려사항

### 4.1 필요 기술 스택
| 영역 | 기술 | 비고 |
|------|------|------|
| Frontend | React, TypeScript, Tailwind CSS | 프로필 입력 폼, 단계별 UI |
| 상태관리 | React Hook Form, Zod | 폼 상태 관리, 유효성 검사 |
| Backend | Node.js, Express | 프로필 API |
| Database | PostgreSQL | 사용자 프로필, 가구원 정보 저장 |
| 보안 | bcrypt, AES-256 | 민감 정보 암호화 |
| 테스트 | Jest, React Testing Library | 단위/통합 테스트 |

### 4.2 의존성
- **인증 기능**: 로그인한 사용자만 프로필 관리 가능 (선행 필요)
- **Welfare Recommendation 기능**: 프로필 데이터 소비자 (후속 개발)
- **Notification 기능**: 프로필 완성 독려 알림 연동 가능 (병렬 개발)

### 4.3 데이터 모델 (예시)
```
UserProfile {
  id: UUID
  userId: UUID (FK → User)
  birthDate: Date
  gender: Enum (남성, 여성, 기타)
  phone: String (암호화)
  incomeLevel: Enum (1~10분위)
  monthlyIncome: Integer
  region: String (시/도)
  city: String (시/군/구)
  address: String (암호화)
  householdType: Enum (1인가구, 부부, 다자녀, 한부모, 조손, 기타)
  householdSize: Integer
  hasDisability: Boolean
  disabilityGrade: Integer?
  employmentStatus: Enum (재직, 구직, 자영업, 무직, 학생, 기타)
  isSingleParent: Boolean
  isVeteran: Boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}

HouseholdMember {
  id: UUID
  profileId: UUID (FK → UserProfile)
  relationship: Enum (본인, 배우자, 자녀, 부모, 조부모, 기타)
  birthDate: Date
  gender: Enum
  hasDisability: Boolean
  disabilityGrade: Integer?
  employmentStatus: Enum
  createdAt: Timestamp
  updatedAt: Timestamp
}

ProfileDraft {
  id: UUID
  userId: UUID (FK → User)
  draftData: JSONB
  currentStep: Integer
  createdAt: Timestamp
  updatedAt: Timestamp
  expiresAt: Timestamp
}
```

### 4.4 API 설계 (예시)
```
프로필 API:
- GET    /api/profile          : 내 프로필 조회
- POST   /api/profile          : 프로필 생성
- PUT    /api/profile          : 프로필 수정
- DELETE /api/profile          : 프로필 삭제

가구원 API:
- GET    /api/profile/members      : 가구원 목록 조회
- POST   /api/profile/members      : 가구원 추가
- PUT    /api/profile/members/:id  : 가구원 수정
- DELETE /api/profile/members/:id  : 가구원 삭제

임시저장 API:
- GET    /api/profile/draft    : 임시저장 데이터 조회
- POST   /api/profile/draft    : 임시저장
- DELETE /api/profile/draft    : 임시저장 삭제
```

### 4.5 보안 고려사항
- 주민등록번호는 저장하지 않고, 생년월일만 별도 저장
- 연락처, 상세주소 등 민감 정보는 AES-256 암호화
- API 요청 시 JWT 토큰 인증 필수
- 본인 프로필만 조회/수정 가능하도록 권한 검사
- 입력값 SQL Injection, XSS 방지

---

## 5. 예상 일정

| 단계 | 작업 내용 | 예상 소요 기간 |
|------|----------|---------------|
| 1단계 | 데이터베이스 스키마 설계 및 마이그레이션 | 2일 |
| 2단계 | 프로필 CRUD API 개발 | 3일 |
| 3단계 | 가구원 관리 API 개발 | 2일 |
| 4단계 | 프로필 입력 UI 개발 (단계별 폼) | 4일 |
| 5단계 | 유효성 검사 및 에러 처리 | 2일 |
| 6단계 | 임시저장 기능 구현 | 1일 |
| 7단계 | 단위/통합 테스트 작성 | 2일 |
| 8단계 | QA 및 버그 수정 | 2일 |
| **총계** | | **18일 (약 3.5주)** |

---

## 6. 위험 요소와 대응 방안

| 위험 요소 | 영향도 | 발생 가능성 | 대응 방안 |
|----------|--------|------------|----------|
| 개인정보 유출 | 높음 | 중간 | 민감 정보 암호화, 접근 권한 철저히 관리, 보안 감사 로그 기록 |
| 프로필 입력 이탈률 높음 | 중간 | 높음 | 단계별 입력 UI, 임시저장 기능, 진행률 표시로 동기 부여 |
| 복잡한 가구 유형 처리 | 중간 | 중간 | 다양한 가구 유형 사전 정의, 기타 옵션 제공 |
| 소득 정보 입력 거부 | 중간 | 높음 | 선택 입력으로 처리, 소득 미입력 시에도 기본 추천 제공 |
| 데이터 정합성 문제 | 중간 | 낮음 | 유효성 검사 강화, DB 제약조건 설정, 트랜잭션 처리 |
| 스키마 변경 필요 | 낮음 | 중간 | 유연한 스키마 설계, JSONB 필드 활용으로 확장성 확보 |

---

## 7. 다음 단계

1. Design 문서 작성: `Cmd+Shift+P` → `BKIT: Design 문서 생성`
2. UI/UX 와이어프레임 설계
3. API 상세 스펙 정의
4. 데이터베이스 마이그레이션 스크립트 작성
