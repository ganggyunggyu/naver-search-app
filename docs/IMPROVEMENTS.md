# 코드 개선점 분석 보고서

> 분석일: 2025-12-01
> 분석 대상: naver-search-engine 프로젝트

## 요약

- 🔴 Critical: 0건
- 🟠 High: 2건
- 🟡 Medium: 5건
- 🟢 Low: 4건

---

## 🟠 High Priority Issues

### [HIGH-001] `any` 타입 남용

**위치**: 다수 파일

**문제**:
TypeScript의 `any` 타입을 사용하여 타입 안전성이 저하됨

**현재 코드**:
```typescript
// _PopularResults.tsx:133
.filter((item: any) => {

// _PopularItemCard.tsx:104
{(item as any).description && (

// _BlogResultList.tsx:13
[key: string]: any;

// url-search.tsx:79
if ((json as any).error) {
```

**영향**:
- 런타임 타입 에러 가능성
- IDE 자동완성/검증 불가
- 리팩토링 시 버그 발생 위험

**해결 방안**:
```typescript
// PopularItem 타입 확장
interface PopularItemWithDescription extends PopularItem {
  description?: string;
}

// 제네릭 사용
interface BlogItem {
  title: string;
  link: string;
  description: string;
}
```

---

### [HIGH-002] 모달 접근성 미흡

**위치**: `_PopularViewerModal.tsx`

**문제**:
- ESC 키로 모달 닫기 미구현
- Focus Trap 미구현 (Tab 키로 모달 외부 이동 가능)

**현재 코드**:
```typescript
// ESC 키 핸들러 없음
<div
  role="dialog"
  aria-modal="true"
  onClick={onClose}
>
```

**영향**:
- 키보드 사용자 접근성 저하
- WCAG 가이드라인 미준수

**해결 방안**:
```typescript
useEffect(() => {
  const handleEsc = (e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  };

  if (open) {
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }
}, [open, onClose]);
```

---

## 🟡 Medium Priority Issues

### [MED-001] Import 순서 비일관

**위치**: `_PopularItemCard.tsx:1-22`

**문제**:
Props 인터페이스가 import 문 사이에 위치

**현재 코드**:
```typescript
import type { PopularItem } from '@/entities/naver/_types';
import React from 'react';
// ... icons

interface Props {  // import 사이에 위치
  item: PopularItem;
}

import { useToast } from '@/shared/ui/Toast';  // 이후 import
```

**해결 방안**:
```typescript
// 1. React
import React from 'react';
// 2. 외부 라이브러리
import { useSetAtom } from 'jotai';
// 3. 내부 모듈
import type { PopularItem } from '@/entities/naver/_types';
// 4. 타입/인터페이스
interface Props { ... }
```

---

### [MED-002] 매직 넘버 하드코딩

**위치**: 다수 파일

**문제**:
설정값이 상수화 되지 않음

**현재 코드**:
```typescript
// _PopularItemCard.tsx:106
.slice(0, 100)

// _PopularItemCard.tsx:170
.slice(0, 60)

// Toast.tsx:50
const duration = options?.duration ?? 2500;
```

**해결 방안**:
```typescript
// constants/ui.ts
export const UI_CONSTANTS = {
  DESCRIPTION_PREVIEW_LENGTH: 100,
  LINK_PREVIEW_LENGTH: 60,
  TOAST_DURATION_MS: 2500,
} as const;
```

---

### [MED-003] 반복되는 버튼 스타일

**위치**: `_PopularItemCard.tsx`, `_PopularResults.tsx`

**문제**:
동일한 버튼 스타일이 여러 곳에서 반복됨

**현재 코드**:
```typescript
className="p-1.5 rounded hover:bg-[var(--color-hover)] text-[var(--color-text-tertiary)] transition-colors"
// 4회 반복
```

**해결 방안**:
```typescript
// shared/ui/IconButton.tsx
export const IconButton: React.FC<Props> = ({ children, ...props }) => (
  <button
    className="p-1.5 rounded hover:bg-[var(--color-hover)] text-[var(--color-text-tertiary)] transition-colors"
    {...props}
  >
    {children}
  </button>
);
```

---

### [MED-004] Toast show 콜백 패턴 반복

**위치**: `_PopularItemCard.tsx`, `_PopularResults.tsx`

**문제**:
`(m, o) => show(m, o)` 패턴이 반복됨

**현재 코드**:
```typescript
copyTitleToClipboard(item.title, (m, o) => show(m, o))
copyFullContentToClipboard(item.link, (m, o) => show(m, o))
downloadContentToFile(item.link, item.title, (m, o) => show(m, o))
```

**해결 방안**:
```typescript
// 직접 show 함수 전달
copyTitleToClipboard(item.title, show)

// 또는 커스텀 훅으로 래핑
const { showSuccess, showError } = useClipboard();
```

---

### [MED-005] h3 → h4 시멘틱 계층 오류

**위치**: `_PopularViewerModal.tsx:225`

**문제**:
h2 → h4로 건너뜀 (h3 누락)

**현재 코드**:
```html
<h2>제목</h2>  <!-- 78줄 -->
<h3>문서 분석</h3>  <!-- 164줄 -->
<h4>본문 내용</h4>  <!-- 225줄 - h3여야 함 -->
```

**해결 방안**:
```html
<h3>본문 내용</h3>
```

---

## 🟢 Low Priority Issues

### [LOW-001] React.Fragment 대신 빈 태그 사용

**위치**: 일부 파일

**문제**:
`React.Fragment` 대신 `<>` 사용 가능

**참고**: 프로젝트 컨벤션에 따라 선택

---

### [LOW-002] className 긴 문자열

**위치**: 전체

**문제**:
className 문자열이 너무 길어 가독성 저하

**해결 방안**:
```typescript
// cn 유틸리티 적극 활용
const buttonStyles = cn(
  'p-2 rounded-lg',
  'text-[var(--color-text-tertiary)]',
  'hover:text-[var(--color-text-primary)]',
  'hover:bg-[var(--color-hover)]',
  'transition-colors'
);
```

---

### [LOW-003] console.log 제거 필요

**상태**: 확인 필요

프로덕션 빌드 전 console.log 제거 확인

---

### [LOW-004] 미사용 컴포넌트 정리

**위치**: `app/shared/ui/`

**확인 필요**:
- `DarkModeToggle.tsx` - Header에서 직접 구현됨
- `SwipeableCard.tsx` - 사용 여부 확인

---

## 개선 로드맵

### Phase 1: 긴급 수정 (High)
1. [ ] HIGH-001: `any` 타입을 구체적 타입으로 교체
2. [ ] HIGH-002: 모달 ESC 키 핸들러 추가

### Phase 2: 품질 개선 (Medium)
1. [ ] MED-001: Import 순서 정리
2. [ ] MED-002: 매직 넘버 상수화
3. [ ] MED-003: IconButton 컴포넌트 추출
4. [ ] MED-004: Toast 콜백 패턴 단순화
5. [ ] MED-005: 시멘틱 헤딩 계층 수정

### Phase 3: 리팩토링 (Low)
1. [ ] LOW-002: cn 유틸리티 활용 확대
2. [ ] LOW-004: 미사용 컴포넌트 정리

---

## 참고 사항

### 분석 기준
- TypeScript strict mode 기준
- React 19 베스트 프랙티스
- WCAG 2.1 접근성 가이드라인
- FSD 아키텍처 원칙

### 추가 권장 사항
- ESLint `@typescript-eslint/no-explicit-any` 규칙 활성화
- Prettier import 정렬 플러그인 도입
- 컴포넌트 스토리북 문서화 고려
