# 중고 시세 조회기

번개장터·중고나라·당근마켓의 중고 거래 시세를 한 번에 조회할 수 있는 웹 서비스입니다.

> **Demo**: [junggo-sise.vercel.app](https://junggo-sise.vercel.app)

## 주요 기능

- 3개 플랫폼(번개장터, 중고나라, 당근마켓) 통합 시세 조회
- 평균가·최저가·최고가·중간가 시세 요약 카드
- 날짜별 시세 트렌드 차트 및 가격 분포 차트
- 플랫폼/기간/상태 필터링
- 제품 그룹 자동 클러스터링 (예: "아이폰 16 Pro" vs "아이폰 16 케이스")
- 무한 스크롤 페이지네이션
- 리스팅 상태 뱃지 (예약중/판매완료)
- 인기 검색어 (검색 횟수 기반 자동 업데이트)
- 최근 검색어 (로컬 저장)
- 스크래핑 실패 플랫폼 알림
- 에러 바운더리

## 아키텍처

```
사용자 검색 → /api/scrape (3개 플랫폼 병렬 수집)
                 ↓
            Supabase DB (캐싱 + 이력 저장)
                 ↓
           /api/search (필터링 + 통계 계산)
                 ↓
            프론트엔드 (차트, 리스트 렌더링)
```

- 첫 검색 시 스크래핑 후 DB 저장, 이후 6시간 캐시
- Vercel Cron으로 기존 검색어 매일 자동 갱신

## 기술 스택

| 영역 | 기술 |
|---|---|
| 프레임워크 | Next.js 16 (App Router) |
| 언어 | TypeScript |
| 스타일링 | Tailwind CSS v4 + shadcn/ui |
| 차트 | Recharts |
| DB | Supabase (PostgreSQL) |
| 배포 | Vercel |

## 프로젝트 구조

```
src/
├── app/              # Next.js App Router 페이지
│   ├── api/          # API 라우트 (search, scrape, cron)
│   ├── search/       # 검색 결과 페이지
│   └── page.tsx      # 메인 페이지
├── components/       # UI 컴포넌트
├── lib/
│   ├── db/           # Supabase 쿼리
│   ├── scrapers/     # 플랫폼별 스크래퍼
│   ├── supabase/     # Supabase 클라이언트
│   └── utils/        # 유틸리티 (통계, 클러스터링, 필터링)
├── constants/        # 상수
└── types/            # TypeScript 타입
```

