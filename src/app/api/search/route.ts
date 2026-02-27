export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { normalizeKeyword } from '@/lib/utils/normalizer'
import { isNoiseListing, isRelevantTitle } from '@/lib/utils/titleFilter'
import { getListings } from '@/lib/db/listings'
import { getLastScrapedAt, isStale } from '@/lib/db/queries'
import { calcStats, calcTrend } from '@/lib/utils/priceStats'
import type { SearchFilters, SearchResult } from '@/types'

const querySchema = z.object({
  keyword: z.string().min(1).max(200),
  platform: z.enum(['all', 'bunjang', 'joonggonara', 'daangn']).default('all'),
  days: z.coerce.number().pipe(z.union([z.literal(7), z.literal(30), z.literal(90)])).default(30),
  condition: z.enum(['all', 'new', 'like_new', 'used', 'unknown']).default('all'),
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const parsed = querySchema.safeParse({
      keyword: searchParams.get('keyword') ?? '',
      platform: searchParams.get('platform') ?? 'all',
      days: searchParams.get('days') ?? '30',
      condition: searchParams.get('condition') ?? 'all',
    })

    if (!parsed.success) {
      return NextResponse.json({ error: '유효하지 않은 파라미터입니다.' }, { status: 400 })
    }

    const keyword = normalizeKeyword(parsed.data.keyword)
    if (!keyword) {
      return NextResponse.json({ error: '검색어가 비어있습니다.' }, { status: 400 })
    }

    const filters: SearchFilters = {
      platform: parsed.data.platform,
      days: parsed.data.days as 7 | 30 | 90,
      condition: parsed.data.condition,
    }

    const lastScrapedAt = await getLastScrapedAt(keyword)
    const rawListings = await getListings(keyword, filters)
    const listings = rawListings.filter(l => !isNoiseListing(l.title) && isRelevantTitle(l.title, keyword))
    const prices = listings.map(l => l.price)

    const result: SearchResult = {
      keyword,
      stats: calcStats(prices),
      trend: calcTrend(listings),
      listings,
      scrapedAt: lastScrapedAt?.toISOString() ?? null,
      isStale: isStale(lastScrapedAt),
    }

    return NextResponse.json(result)
  } catch (e) {
    console.error('검색 API 에러:', e)
    return NextResponse.json({ error: '검색 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
