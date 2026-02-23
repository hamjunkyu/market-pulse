# 중고 시세 조회기

번개장터·중고나라·당근마켓의 중고 거래 시세를 한 번에 조회할 수 있는 웹 서비스입니다.

## 주요 기능

- 세 플랫폼(번개장터, 중고나라, 당근마켓) 통합 검색
- 평균가·최저가·최고가 시세 카드
- 날짜별 시세 트렌드 차트
- 플랫폼/기간/상태 필터
- 인기 검색어 및 최근 검색어

## 기술 스택

- **프레임워크**: Next.js 15 (App Router)
- **언어**: TypeScript
- **스타일링**: Tailwind CSS v4 + shadcn/ui
- **차트**: Recharts
- **DB**: Supabase (PostgreSQL)
- **배포**: Vercel

## 로컬 실행 방법

### 1. 의존성 설치

```bash
pnpm install
```

### 2. 환경변수 설정

`.env.local.example`을 복사하여 `.env.local`을 생성하고, Supabase 키를 입력합니다.

```bash
cp .env.local.example .env.local
```

| 변수 | 설명 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 익명 키 (공개) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 서비스 역할 키 (비공개) |
| `CRON_SECRET` | Vercel Cron 인증용 랜덤 문자열 |

### 3. Supabase 데이터베이스 설정

Supabase 대시보드의 SQL Editor에서 `supabase/schema.sql` 파일의 내용을 실행합니다.

1. [Supabase 대시보드](https://supabase.com/dashboard) 접속
2. 프로젝트 선택 → SQL Editor 이동
3. `supabase/schema.sql` 내용을 복사하여 실행
4. 테이블(`search_queries`, `listings`)과 함수(`upsert_scrape_meta`)가 생성됩니다

### 4. 개발 서버 실행

```bash
pnpm dev
```

[http://localhost:3000](http://localhost:3000)에서 확인할 수 있습니다.

## 빌드

```bash
pnpm build
```

## 배포 (Vercel)

1. Vercel에 GitHub 레포를 연결
2. 환경변수 설정 (위 표 참고)
3. `CRON_SECRET`을 설정하면 Vercel Cron이 매일 KST 03:00에 자동 수집
