import { randomDelay } from '@/lib/utils/delay'
import { DELAY_MIN_MS, DELAY_MAX_MS } from '@/constants'
import type { Listing, Platform } from '@/types'

const PLATFORM: Platform = 'joonggonara'
const BASE_URL = 'https://web.joongna.com'

interface JoongnaItem {
  seq: number
  title: string
  price: number
  url: string           // 이미지 URL
  state: number         // 0=판매중, 1=예약중, 3=판매완료
  sortDate: string
}

export async function scrapeJoonggonara(keyword: string): Promise<Omit<Listing, 'id' | 'created_at'>[]> {
  const results: Omit<Listing, 'id' | 'created_at'>[] = []
  const maxPages = 2  // 페이지당 50건, 최대 100건

  try {
    for (let page = 0; page < maxPages; page++) {
      const searchUrl = `${BASE_URL}/search/${encodeURIComponent(keyword)}?sort=RECENT_SORT&page=${page}&saleYn=SALE_Y&quantity=50`
      const res = await fetch(searchUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
      })

      if (!res.ok) {
        console.error(`중고나라 응답 에러: ${res.status}`)
        break
      }

      const html = await res.text()

      // __NEXT_DATA__ JSON 추출
      const nextDataMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/)
      if (!nextDataMatch) {
        console.error('중고나라: __NEXT_DATA__ 를 찾을 수 없음')
        break
      }

      const nextData = JSON.parse(nextDataMatch[1])

      // dehydratedState에서 상품 목록 추출
      const queries = nextData?.props?.pageProps?.dehydratedState?.queries
      if (!queries || queries.length === 0) break

      let items: JoongnaItem[] = []
      for (const q of queries) {
        const data = q?.state?.data?.data
        if (data?.items && Array.isArray(data.items)) {
          items = data.items
          break
        }
      }

      if (items.length === 0) break

      for (const item of items) {
        if (item.price <= 0) continue

        results.push({
          platform: PLATFORM,
          keyword,
          title: item.title,
          price: item.price,
          condition: 'unknown',
          sold_at: item.sortDate
            ? new Date(item.sortDate).toISOString()
            : new Date().toISOString(),
          url: `${BASE_URL}/product/${item.seq}`,
          thumbnail_url: item.url || null,
        })
      }

      if (page < maxPages - 1) {
        await randomDelay(DELAY_MIN_MS, DELAY_MAX_MS)
      }
    }
  } catch (e) {
    console.error('중고나라 수집 실패:', e)
  }

  return results
}
