import { createServerClient } from '@/lib/supabase/server'
import { SCRAPE_CACHE_TTL_HOURS } from '@/constants'

// 마지막 수집 시각 조회
export async function getLastScrapedAt(keyword: string): Promise<Date | null> {
  const db = createServerClient()
  const { data, error } = await db
    .from('search_queries')
    .select('last_scraped_at')
    .eq('keyword', keyword)
    .single()
  if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows
  return data?.last_scraped_at ? new Date(data.last_scraped_at) : null
}

// 수집 완료 후 메타데이터 업데이트 (upsert + count 증가를 단일 RPC로 처리)
export async function updateScrapedAt(keyword: string): Promise<void> {
  const db = createServerClient()
  const { error } = await db.rpc('upsert_scrape_meta', { kw: keyword })
  if (error) throw error
}

// 캐시가 만료됐는지 확인
export function isStale(lastScrapedAt: Date | null): boolean {
  if (!lastScrapedAt) return true
  const hoursAgo = (Date.now() - lastScrapedAt.getTime()) / 1000 / 60 / 60
  return hoursAgo > SCRAPE_CACHE_TTL_HOURS
}

// 최근 7일 내 검색된 키워드 목록 (cron용)
export async function getRecentKeywords(): Promise<string[]> {
  const db = createServerClient()
  const since = new Date()
  since.setDate(since.getDate() - 7)
  const { data, error } = await db
    .from('search_queries')
    .select('keyword')
    .gte('last_scraped_at', since.toISOString())
  if (error) throw error
  return data?.map(r => r.keyword) ?? []
}
