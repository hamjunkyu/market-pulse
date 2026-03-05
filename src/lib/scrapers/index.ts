import { scrapeBunjang } from './bunjang'
import { scrapeJoonggonara } from './joonggonara'
import { scrapeDaangn } from './daangn'
import { isNoiseListing, isRelevantTitle } from '@/lib/utils/titleFilter'
import { MIN_PRICE } from '@/constants'
import type { Listing, Platform } from '@/types'

export interface ScrapeResult {
  listings: Omit<Listing, 'id' | 'created_at'>[]
  failedPlatforms: Platform[]
}

export async function scrapeAll(keyword: string): Promise<ScrapeResult> {
  // 세 플랫폼 병렬 수집 (fetch 기반이므로 메모리 부담 없음)
  const [bunjang, joonggonara, daangn] = await Promise.allSettled([
    scrapeBunjang(keyword),
    scrapeJoonggonara(keyword),
    scrapeDaangn(keyword),
  ])

  const listings: Omit<Listing, 'id' | 'created_at'>[] = []
  const failedPlatforms: Platform[] = []

  if (bunjang.status === 'fulfilled') listings.push(...bunjang.value)
  else failedPlatforms.push('bunjang')

  if (joonggonara.status === 'fulfilled') listings.push(...joonggonara.value)
  else failedPlatforms.push('joonggonara')

  if (daangn.status === 'fulfilled') listings.push(...daangn.value)
  else failedPlatforms.push('daangn')

  // 노이즈 제거: 매입/구매글 + 미끼 가격 + 키워드 무관 결과
  const filtered = listings.filter(item =>
    !isNoiseListing(item.title) &&
    item.price >= MIN_PRICE &&
    isRelevantTitle(item.title, keyword)
  )

  return { listings: filtered, failedPlatforms }
}
