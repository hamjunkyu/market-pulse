import { scrapeBunjang } from './bunjang'
import { scrapeJoonggonara } from './joonggonara'
import { scrapeDaangn } from './daangn'
import { isNoiseListing, isRelevantTitle } from '@/lib/utils/titleFilter'
import { MIN_PRICE } from '@/constants'
import type { Listing } from '@/types'

export async function scrapeAll(keyword: string): Promise<Omit<Listing, 'id' | 'created_at'>[]> {
  // 세 플랫폼 병렬 수집 (fetch 기반이므로 메모리 부담 없음)
  const [bunjang, joonggonara, daangn] = await Promise.allSettled([
    scrapeBunjang(keyword),
    scrapeJoonggonara(keyword),
    scrapeDaangn(keyword),
  ])

  const results: Omit<Listing, 'id' | 'created_at'>[] = []
  if (bunjang.status === 'fulfilled') results.push(...bunjang.value)
  if (joonggonara.status === 'fulfilled') results.push(...joonggonara.value)
  if (daangn.status === 'fulfilled') results.push(...daangn.value)

  // 노이즈 제거: 매입/구매글 + 미끼 가격 + 키워드 무관 결과
  return results.filter(item =>
    !isNoiseListing(item.title) &&
    item.price >= MIN_PRICE &&
    isRelevantTitle(item.title, keyword)
  )
}
