export const PLATFORMS = {
  bunjang: { label: '번개장터', icon: '⚡', color: '#FF6B00' },
  joonggonara: { label: '중고나라', icon: '🏠', color: '#00C851' },
  daangn: { label: '당근마켓', icon: '🥕', color: '#FF6F0F' },
} as const

export const POPULAR_KEYWORDS = [
  '아이폰 15',
  '갤럭시 S24',
  '에어팟 프로',
  '닌텐도 스위치',
  '맥북 프로',
  '플레이스테이션 5',
  '다이슨 에어랩',
  '애플워치',
]

export const SCRAPE_CACHE_TTL_HOURS = 6   // 6시간 캐시
export const MAX_ITEMS_PER_PLATFORM = 100  // 플랫폼당 최대 수집 건수
export const DELAY_MIN_MS = 500            // 최소 딜레이 (API 호출이므로 짧게)
export const DELAY_MAX_MS = 1500           // 최대 딜레이
export const MIN_PRICE = 1000              // 최소 가격 (1원, 100원 등 미끼글 제거)
