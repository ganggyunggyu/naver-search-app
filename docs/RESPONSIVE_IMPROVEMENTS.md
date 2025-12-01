# 반응형 UI 개선 계획

모바일과 데스크톱에서 각각 최적화된 UX를 제공하기 위한 반응형 개선 작업 목록입니다.

## 완료된 작업

### 1. Toast 위치 반응형 ✅
- **모바일**: 하단 중앙 (`bottom-4`)
- **데스크톱**: 상단 헤더 아래 (`top-20`)
- **파일**: `app/shared/ui/Toast.tsx`

### 2. PopularViewerModal ✅
- **모바일**: Bottom Sheet 스타일 (하단에서 슬라이드 업)
  - `rounded-t-2xl` (상단만 둥글게)
  - `items-end` (하단 정렬)
  - `animate-slide-up` 애니메이션
  - 드래그 인디케이터 표시
- **데스크톱**: 중앙 모달
  - `rounded-2xl` (전체 둥글게)
  - `items-center` (중앙 정렬)
  - `animate-fade-in` 애니메이션
- **파일**: `app/features/naver-popular/components/_PopularViewerModal.tsx`

### 3. 카드 그리드 레이아웃 ✅
- **모바일**: 1열 세로 스택
- **데스크톱**: 2열 그리드 (md:768px+)
- **파일**:
  - `app/features/naver-popular/components/_PopularResults.tsx`
  - `app/features/naver-popular/components/_BlogResultList.tsx`
- **구현**: `grid grid-cols-1 md:grid-cols-2 gap-3`

### 4. 검색 폼 레이아웃 ✅
- **모바일**: 세로 스택 + 전체 너비 버튼 + 아이콘만 표시
- **데스크톱**: 가로 인라인 (입력 + 버튼 같은 줄) + 텍스트 표시
- **파일**: `app/features/naver-popular/components/_PopularSearchForm.tsx`
- **구현**:
  - `flex-col sm:flex-row` 입력/버튼 레이아웃
  - `w-full sm:w-auto` 버튼 너비
  - 모바일: 검색 아이콘만, 데스크톱: "검색 시작" 텍스트
  - 외부 링크 버튼 터치 영역 확대 (`py-2.5 sm:py-2`)

### 5. 하단 네비게이션 바 ✅
- **모바일**: 앱 스타일 하단 탭 바 (WebView 대응)
  - 4개 탭: 인기글, URL, 분석, 비교
  - 아이콘 + 라벨 구조
  - 활성 탭 배경 하이라이트
  - iOS Safe Area 대응
- **데스크톱**: 숨김 (상단 네비게이션 사용)
- **파일**:
  - `app/shared/ui/BottomNavigation.tsx`
  - `app/shared/ui/Header.tsx` (햄버거 메뉴 제거)

---

## 예정된 작업

### 6. 액션 버튼 그룹
- **모바일**: 아이콘만 표시 (텍스트 숨김)
- **데스크톱**: 아이콘 + 텍스트
- **대상 파일**:
  - `_PopularItemCard.tsx`
  - `_PopularResults.tsx`
- **구현 방법**:
  ```jsx
  <span className="hidden sm:inline">텍스트</span>
  ```

**상태**: ⏳ 대기

---

### 7. 터치 타겟 크기
- **모바일**: 44px 이상 (Apple HIG 권장)
- **데스크톱**: 32px 가능
- **대상 파일**: 모든 버튼 컴포넌트
- **구현 방법**:
  ```css
  p-2.5 sm:p-2
  min-h-[44px] sm:min-h-0
  ```

**상태**: ⏳ 대기

---

### 8. 호버 효과 분리
- **모바일**: 터치 피드백만 (active 상태)
- **데스크톱**: 호버 시 색상/그림자 변화
- **구현 방법**:
  ```css
  @media (hover: hover) {
    .hover-effect:hover { ... }
  }
  ```

**상태**: ⏳ 대기

---

### 9. 사이드 패널 (향후)
- **모바일**: 숨김 또는 오버레이
- **데스크톱**: 고정 사이드바
- **적용 대상**: 필터, 설정 패널 등

**상태**: ⏳ 향후 고려

---

## 브레이크포인트 기준

| 이름 | 픽셀 | 설명 |
|------|------|------|
| 기본 | 0-639px | 모바일 |
| sm | 640px+ | 태블릿/소형 데스크톱 |
| md | 768px+ | 중형 데스크톱 |
| lg | 1024px+ | 대형 데스크톱 |

---

## 참고 자료

- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Toss Design System](https://toss.im/design)
- [TailwindCSS Responsive Design](https://tailwindcss.com/docs/responsive-design)
