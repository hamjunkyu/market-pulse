import { createServerClient } from '@/lib/supabase/server'
import { MIN_PRICE } from '@/constants'
import type { Listing, Platform, SearchFilters } from '@/types'

// 수집 결과 저장 (중복 URL은 status 등 업데이트)
export async function upsertListings(
  listings: Omit<Listing, 'id' | 'created_at'>[]
): Promise<void> {
  if (listings.length === 0) return
  const db = createServerClient()
  const { error } = await db
    .from('listings')
    .upsert(listings, { onConflict: 'platform,url', ignoreDuplicates: false })
  if (error) throw error
}

// 재수집 시 검색 범위 내 사라진 리스팅을 DB에서 삭제
export async function deleteMissingListings(
  keyword: string,
  platform: Platform,
  scrapedUrls: string[],
  oldestSoldAt: string
): Promise<void> {
  const db = createServerClient()

  // 수집 범위(oldestSoldAt 이후) 내 기존 판매중 리스팅 조회
  const { data: existing } = await db
    .from('listings')
    .select('id, url')
    .eq('keyword', keyword)
    .eq('platform', platform)
    .eq('status', 'selling')
    .gte('sold_at', oldestSoldAt)

  if (!existing || existing.length === 0) return

  const scrapedUrlSet = new Set(scrapedUrls)
  const missingIds = existing
    .filter(l => !scrapedUrlSet.has(l.url))
    .map(l => l.id)

  if (missingIds.length === 0) return

  const { error } = await db
    .from('listings')
    .delete()
    .in('id', missingIds)

  if (error) console.error('삭제된 리스팅 제거 실패:', error)
}

// 검색 (필터 적용)
export async function getListings(
  keyword: string,
  filters: SearchFilters
): Promise<Listing[]> {
  const db = createServerClient()
  const since = new Date()
  since.setDate(since.getDate() - filters.days)

  let query = db
    .from('listings')
    .select('*')
    .eq('keyword', keyword)
    .gte('sold_at', since.toISOString())
    .gte('price', MIN_PRICE)
    .order('sold_at', { ascending: false })
    .limit(500)

  if (filters.platform !== 'all') {
    query = query.eq('platform', filters.platform)
  }
  if (filters.condition !== 'all') {
    query = query.eq('condition', filters.condition)
  }

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}
