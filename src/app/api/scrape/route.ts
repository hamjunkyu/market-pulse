export const maxDuration = 30
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { normalizeKeyword } from '@/lib/utils/normalizer'
import { scrapeAll } from '@/lib/scrapers'
import { upsertListings, deleteMissingListings } from '@/lib/db/listings'
import { updateScrapedAt } from '@/lib/db/queries'
import type { Platform } from '@/types'

const bodySchema = z.object({
  keyword: z.string().min(1).max(200),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = bodySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: '유효하지 않은 요청입니다.' }, { status: 400 })
    }

    const keyword = normalizeKeyword(parsed.data.keyword)
    if (!keyword) {
      return NextResponse.json({ error: '검색어가 비어있습니다.' }, { status: 400 })
    }

    const listings = await scrapeAll(keyword)
    await upsertListings(listings)

    // 플랫폼별로 수집 범위 내 사라진 리스팅을 DB에서 삭제
    const byPlatform = Map.groupBy(listings, l => l.platform)
    for (const [platform, items] of byPlatform) {
      const urls = items.map(l => l.url)
      const oldest = items
        .map(l => l.sold_at)
        .filter(Boolean)
        .sort()[0]
      if (oldest) {
        await deleteMissingListings(keyword, platform as Platform, urls, oldest)
      }
    }

    await updateScrapedAt(keyword)

    return NextResponse.json({ success: true, count: listings.length })
  } catch (e) {
    console.error('수집 API 에러:', e)
    return NextResponse.json({ error: '수집 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
