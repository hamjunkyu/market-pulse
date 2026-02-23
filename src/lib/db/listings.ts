import { createServerClient } from '@/lib/supabase/server'
import type { Listing, SearchFilters } from '@/types'

// 수집 결과 저장 (중복 URL은 무시)
export async function upsertListings(
  listings: Omit<Listing, 'id' | 'created_at'>[]
): Promise<void> {
  if (listings.length === 0) return
  const db = createServerClient()
  const { error } = await db
    .from('listings')
    .upsert(listings, { onConflict: 'platform,url', ignoreDuplicates: true })
  if (error) throw error
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
