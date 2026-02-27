// 플랫폼 종류
export type Platform = 'bunjang' | 'joonggonara' | 'daangn'

// 상품 상태
export type Condition = 'new' | 'like_new' | 'used' | 'unknown'

// 리스팅 상태
export type ListingStatus = 'selling' | 'reserved' | 'sold' | 'deleted'

// DB: 개별 거래 데이터
export interface Listing {
  id: string
  platform: Platform
  keyword: string
  title: string
  price: number          // 원화 정수
  condition: Condition
  status: ListingStatus
  sold_at: string | null  // ISO 8601, null if not sold
  url: string
  thumbnail_url: string | null
  created_at: string
}

// DB: 검색어 메타데이터
export interface SearchQuery {
  id: string
  keyword: string
  last_scraped_at: string | null
  scrape_count: number
  created_at: string
}

// API 응답: 시세 통계
export interface PriceStats {
  avg: number
  min: number
  max: number
  median: number
  count: number
}

// API 응답: 날짜별 트렌드
export interface TrendPoint {
  date: string           // 'YYYY-MM-DD'
  avg: number
  count: number
}

// API 응답: 검색 결과 전체
export interface SearchResult {
  keyword: string
  stats: PriceStats
  trend: TrendPoint[]
  listings: Listing[]
  scrapedAt: string | null
  isStale: boolean       // 마지막 스크래핑이 6시간 초과면 true
}

// 필터 옵션
export interface SearchFilters {
  platform: Platform | 'all'
  days: 7 | 30 | 90
  condition: Condition | 'all'
}
