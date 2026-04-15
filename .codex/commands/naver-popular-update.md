---
description: 네이버 인기글 HTML 구조 변경 시 파싱 셀렉터 자동 업데이트
---

# 네이버 인기글 파싱 셀렉터 업데이트 워크플로우

사용자가 네이버 검색 결과의 인기글 섹션 HTML을 제공하면, 자동으로 파싱 로직을 업데이트합니다.

## 작업 순서

### 1. HTML 분석
사용자가 제공한 HTML에서 다음 정보를 추출:
- 인기글 리스트 컨테이너 클래스 (`.fds-ugc-single-intention-item-list` 확인)
- 각 인기글 아이템 컨테이너 클래스 (예: `.Orf2UUyw2B80LaIjeSZl`)
- 제목 링크 클래스 (예: `.M9lOyC5Ckpmk7fKVCMeD`)
- 미리보기 텍스트 컨테이너 클래스 (예: `.FPXivxJt5AqSLccij6Pm`)
- 블로그명 클래스 (`.sds-comps-profile-info-title-text`)
- 카테고리 헤더 클래스 (`.sds-comps-text-type-headline1`)

### 2. 현재 코드 확인
`app/shared/utils/_popular.ts` 파일을 읽고 현재 사용 중인 셀렉터 확인

### 3. 셀렉터 업데이트
`_popular.ts`의 `readPopularSection` 함수에서:
- 아이템 컨테이너 셀렉터 업데이트
- 제목 링크 셀렉터 업데이트
- 미리보기 셀렉터 업데이트
- HTML 구조 주석에 업데이트 날짜 기록

### 4. 변경사항 커밋
다음 형식으로 커밋:
```
fix: 네이버 인기글 파싱 셀렉터 업데이트 (YYYY-MM-DD)

네이버 HTML 구조 변경에 따른 셀렉터 업데이트:
- 아이템 컨테이너: .기존클래스 → .새클래스
- 제목 링크: .기존클래스 → .새클래스
- 미리보기: .기존클래스 → .새클래스
- HTML 구조 주석 업데이트

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

## 주의사항
- 카페 링크는 필터링 (`.includes('cafe.naver.com')` 제외)
- 광고 링크도 필터링 (`.includes('ader.naver.com')` 제외)
- HTML 구조 주석은 실제 구조를 반영하여 상세히 작성
- 변경된 클래스명만 수정하고, 기존 로직은 유지

## 사용법
```
/네이버 인기글 업데이트

[여기에 네이버 검색 결과 인기글 섹션의 HTML 붙여넣기]
```
