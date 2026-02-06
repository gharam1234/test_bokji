# BKIT 사용 가이드

## 🎯 워크플로우 개요

```
PROJECT.md (제품 정의)
    ↓
Plan (기능 계획) → Design (설계) → Do (구현) → Check (점검) → Act (개선) → Report (완료)
    ↓
다음 기능 반복
```

## 🚀 빠른 시작

### 0단계: 프로젝트 정의 (최초 1회)
프로젝트 초기화 시 생성된 `docs/PROJECT.md`를 작성하세요.
- 제품 비전, 목표 사용자, 주요 기능 목록

### 1단계: Plan (계획)
```
Cmd+Shift+P → BKIT: Plan 문서 생성
→ 기능명 입력 (예: "user-auth")
```

### 2단계: Design (설계)
```
Cmd+Shift+P → BKIT: Design 문서 생성
→ 구현 체크리스트 작성 (IMPL-XXX 형식)
```

### 3단계: Do (구현)
```
Cmd+Shift+P → BKIT: 구현 가이드 표시
→ 체크리스트를 참고하여 코드 작성
```

### 4단계: Check (점검)
```
Cmd+Shift+P → BKIT: Gap 분석 실행
→ 설계 대비 구현 매치율 확인
```

### 5단계: Act (개선)
매치율이 90% 미만이면:
```
Cmd+Shift+P → BKIT: 개선 반복
→ 미구현 항목 확인 후 구현 계속
```

### 6단계: Report (완료)
매치율 90% 이상이면:
```
Cmd+Shift+P → BKIT: 완료 보고서 생성
→ 기능 완료! 다음 기능으로 이동
```

## 📋 명령어 목록

| 명령 | 설명 |
|------|------|
| BKIT: 프로젝트 초기화 | .bkit/ 및 docs/ 구조 생성 |
| BKIT: Plan 문서 생성 | 기능 계획서 생성 |`
| BKIT: Design 문서 생성 | 설계 문서 생성 |
| BKIT: 구현 가이드 표시 | 구현 체크리스트 표시 |
| BKIT: Gap 분석 실행 | 설계↔구현 매치율 분석 |
| BKIT: 개선 반복 | 반복 개선 프로세스 |
| BKIT: 완료 보고서 생성 | 최종 보고서 생성 |
| BKIT: 현재 상태 보기 | PDCA 진행 상황 표시 |
| BKIT: 다음 단계 안내 | 다음 액션 추천 |

## 💡 팁

- **PROJECT.md**: 먼저 제품 전체를 정의한 후 기능별로 작업하세요
- **상태바**: 우하단에서 현재 진행 상황을 확인하세요
- **BKIT Explorer**: 좌측 패널에서 전체 기능 목록을 볼 수 있습니다
- **Design 문서**: `IMPL-XXX` 형식의 체크리스트가 Gap 분석에 사용됩니다

## 🔗 더 알아보기

- [README.md](../README.md)
- [PROJECT.md](./PROJECT.md)
