export const maxDuration = 60
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getRecentKeywords, updateScrapedAt } from '@/lib/db/queries'
import { scrapeAll } from '@/lib/scrapers'
import { upsertListings } from '@/lib/db/listings'
import { randomDelay } from '@/lib/utils/delay'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')

  if (token !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const keywords = await getRecentKeywords()
    let processed = 0

    for (const keyword of keywords) {
      try {
        const listings = await scrapeAll(keyword)
        await upsertListings(listings)
        await updateScrapedAt(keyword)
        processed++

        if (processed < keywords.length) {
          await randomDelay(2000, 5000)
        }
      } catch (e) {
        console.error(`Cron: "${keyword}" 수집 실패:`, e)
      }
    }

    return NextResponse.json({ success: true, processed })
  } catch (e) {
    console.error('Cron 실행 에러:', e)
    return NextResponse.json({ error: 'Cron 실행 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
