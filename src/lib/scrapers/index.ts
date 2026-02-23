import { scrapeBunjang } from './bunjang'
import { scrapeJoonggonara } from './joonggonara'
import { scrapeDaangn } from './daangn'
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

  return results
}
