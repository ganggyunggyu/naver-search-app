# 🔍 **네이버 검색 엔진 프로젝트 AGENT.md**

아이고난1! 케인인님 전용 네이버 검색 엔진 프로젝트 가이드다! 🎯

---

## 📋 **프로젝트 현황 분석 (2025-09-12)**

### 🏗️ **아키텍처 현황**
- **Frontend**: React 19 + React Router v7 (SSR 지원) ✅ 
- **Language**: TypeScript (strict mode) ✅
- **Styling**: TailwindCSS v4 ✅
- **State**: Jotai (atomic state management) ✅
- **Build**: Vite + TSConfig Paths ✅
- **Icons**: Lucide React ✅

### 🗂️ **FSD 구조 분석**
```
app/
├── constants/        ✅ headers, selectors, blog-ids
├── entities/         ✅ 도메인 엔티티  
├── features/         ✅ FSD 기반 기능 모듈
│   ├── doc/          ✅ 문서 관련 기능
│   ├── naver-popular/✅ 네이버 인기검색어 (메인)
│   └── search/       ✅ 검색 기능
├── routes/           ✅ API & 페이지 라우트
├── shared/           ✅ 공유 UI (Header, Toast)
└── welcome/          ✅ 웰컴 페이지
```

### 🎯 **메인 기능들**
1. **네이버 인기검색어** (`features/naver-popular/`)
   - 완전한 FSD 구조 (components, hooks, lib, store)
   - 실시간 인기검색어 조회/표시
   
2. **검색 기능** (`features/search/`)  
   - 통합 검색 API 지원
   - 블로그, 뉴스, 콘텐츠 검색
   
3. **문서 분석** (`features/doc/`)
   - 문서 분석/비교 기능

---

## 🚀 **케인인님 개발 패턴**

### **1. 컴포넌트 작성 - 반드시 이렇게!**
```typescript
// ✅ 케인식 컴포넌트 패턴
import React from 'react';
import { cn } from '@/shared';

interface SearchComponentProps {
  searchTerm: string;
  resultList: SearchResult[];
  isLoading: boolean;
  className?: string;
}

export const SearchComponent = ({ 
  searchTerm, 
  resultList, 
  isLoading,
  className 
}: SearchComponentProps) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const handleSearchClick = () => {
    // 케인: "나는! 나는...! 검색을 했다!!"
  };

  return (
    <React.Fragment>
      <div className={cn(
        "relative transition-all",
        "hover:scale-105 hover:shadow-lg",
        isLoading && "opacity-50 cursor-wait",
        className
      )}>
        {/* 컴포넌트 내용 */}
      </div>
    </React.Fragment>
  );
};
```

### **2. Jotai Store 패턴**
```typescript
// store/_atoms.ts
import { atom } from 'jotai';

// 기본 atoms
export const searchTermAtom = atom<string>('');
export const searchResultListAtom = atom<SearchResult[]>([]);
export const isLoadingAtom = atom<boolean>(false);

// 파생 atoms (케인식 - "움직임이 예사롭지 않다")
export const filteredResultListAtom = atom((get) => {
  const resultList = get(searchResultListAtom);
  const searchTerm = get(searchTermAtom);
  
  return resultList.filter(result => 
    result.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
});

// 액션 atoms
export const searchActionAtom = atom(
  null,
  async (get, set, searchTerm: string) => {
    set(isLoadingAtom, true);
    try {
      // API 호출 로직
      const results = await fetchSearchResults(searchTerm);
      set(searchResultListAtom, results);
    } finally {
      set(isLoadingAtom, false);
    }
  }
);
```

### **3. API 라우트 패턴 (React Router v7)**
```typescript
// routes/api.naver-search.ts
import type { LoaderFunctionArgs } from 'react-router';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const query = url.searchParams.get('q');
  const display = url.searchParams.get('display') || '10';
  
  if (!query) {
    return Response.json({ error: '검색어가 필요합니다' }, { status: 400 });
  }

  try {
    // 네이버 API 호출
    const response = await fetch(`https://openapi.naver.com/v1/search/blog.json?query=${encodeURIComponent(query)}&display=${display}`, {
      headers: {
        'X-Naver-Client-Id': process.env.NAVER_CLIENT_ID!,
        'X-Naver-Client-Secret': process.env.NAVER_CLIENT_SECRET!,
      },
    });

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    // 케인: "아이고난1! API가 터졌어!"
    return Response.json({ error: 'API 호출 실패' }, { status: 500 });
  }
};
```

---

## 🎯 **케인 개발 체크리스트**

### **✅ 매번 확인할 것들**
- [ ] `React.Fragment` 사용했나? (`<></>` 금지)
- [ ] `cn()` 함수로 className 관리했나?
- [ ] 절대경로 import (`@/`) 사용했나?
- [ ] Props interface 정의했나?
- [ ] TypeScript 타입 제대로 정의했나?
- [ ] Jotai atoms으로 상태 관리했나?

### **✅ FSD 구조 준수**
- [ ] `features/` 하위에 새 기능 생성
- [ ] `components/`, `hooks/`, `lib/`, `store/` 구조 유지
- [ ] 계층별 import 규칙 준수
- [ ] 단일 책임 원칙으로 컴포넌트 분리

### **✅ 스타일링 (TailwindCSS v4)**
- [ ] 반응형 디자인 적용 (`w-full md:w-1/2` 패턴)
- [ ] 다크모드 지원 (`dark:bg-gray-900`)
- [ ] 일관된 간격/색상 사용
- [ ] `hover:`, `focus:` 상호작용 스타일

---

## 🚨 **절대 하지 말 것들**

### **❌ 금지 패턴들**
```typescript
// ❌ 상대경로 import 금지
import { Button } from '../../../shared/ui/button';

// ❌ React Fragment 단축 문법 금지  
<>
  <div>내용</div>
</>

// ❌ any 타입 사용 금지
const data: any = response.json();

// ❌ 매직넘버 사용 금지
setTimeout(() => {}, 3000); // 3000은 뭐야?

// ❌ className 직접 사용 금지
<div className="bg-blue-500 hover:bg-blue-600">
```

### **✅ 올바른 패턴들**
```typescript
// ✅ 절대경로 import
import { Button } from '@/shared/ui/Button';

// ✅ React Fragment 명시적 사용
<React.Fragment>
  <div>내용</div>
</React.Fragment>

// ✅ 타입 정의
interface ApiResponse {
  items: SearchResult[];
  total: number;
}

// ✅ 상수화
const API_TIMEOUT = 3000;
setTimeout(() => {}, API_TIMEOUT);

// ✅ cn 함수 사용
<div className={cn(
  "bg-blue-500 hover:bg-blue-600",
  "transition-colors duration-200",
  className
)}>
```

---

## 🎮 **개발 명령어 (port 4001)**

```bash
# 개발 서버 실행 (케인: "나는 서버를 켰다!")
npm run dev

# 빌드 (케인: "빌드가 성공했는데 실패한 건 맞아!")  
npm run build

# 타입 체크 (케인: "타입 에러가... 아이고난1")
npm run typecheck

# 서버 실행
npm run start
```

---

## 🔥 **케인식 개발 워크플로우**

### **1. 새 기능 개발**
1. `features/기능명/` 디렉토리 생성
2. FSD 구조로 파일 배치 (components, hooks, lib, store)
3. Jotai atoms으로 상태 정의
4. 컴포넌트 구현 (React.Fragment + cn 사용)
5. API 라우트 구현 (`routes/api.*`)

### **2. 리팩토링 우선순위**
- [ ] 중복 코드 → 유틸리티 함수로 추출
- [ ] 매직넘버 → `constants/` 폴더로 상수화
- [ ] API 응답 타입 통일
- [ ] 에러 처리 개선

### **3. 케인식 커밋 메시지**
```bash
git commit -m "feat: 네이버 검색 기능 추가

나는! 나는...! 검색을 구현했다!!
- 네이버 API 연동
- 실시간 검색결과 표시
- 에러 핸들링 추가

잠시 소란이 있었어요."
```

---

## 💡 **케인 힌트 모음**

### **자주 쓰는 코드 스니펫**
```typescript
// 로딩 상태 관리
const [isLoading, setIsLoading] = React.useState(false);

// API 호출 패턴
const handleApiCall = async () => {
  setIsLoading(true);
  try {
    const response = await fetch('/api/endpoint');
    const data = await response.json();
    // 성공 처리
  } catch (error) {
    console.error('API 호출 실패:', error);
  } finally {
    setIsLoading(false);
  }
};

// 반응형 그리드
className={cn(
  "grid gap-4",
  "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  "p-4 md:p-6"
)}
```

---

**케인아! 이제 네이버 검색 엔진 개발할 준비 끝났다!! 나는! 나는...! AGENT.md를 만들었다!! 🎯**

*잠시 소란이 있었어요~ 이제 본격적으로 코딩하자!* 🚀