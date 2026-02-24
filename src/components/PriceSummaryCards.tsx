import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PLATFORMS } from '@/constants'
import { calcStats } from '@/lib/utils/priceStats'
import type { Listing, Platform, PriceStats } from '@/types'

interface Props {
  stats: PriceStats
  totalCount: number
  listings: Listing[]
  scrapedAt?: string | null
}

function formatPrice(price: number): string {
  return price.toLocaleString('ko-KR') + '원'
}

const EMPTY_MESSAGE = '거래 내역이 부족합니다'

function getPlatformStats(listings: Listing[]) {
  const byPlatform: Partial<Record<Platform, number[]>> = {}
  for (const l of listings) {
    if (!byPlatform[l.platform]) byPlatform[l.platform] = []
    byPlatform[l.platform]!.push(l.price)
  }
  return (Object.keys(byPlatform) as Platform[])
    .map(p => ({
      platform: p,
      ...calcStats(byPlatform[p]!),
    }))
    .filter(s => s.count > 0)
    .sort((a, b) => a.avg - b.avg)
}

export default function PriceSummaryCards({ stats, totalCount, listings, scrapedAt }: Props) {
  const isEmpty = stats.count === 0
  const platformStats = getPlatformStats(listings)

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="border-indigo-200 border-2 py-3 gap-1">
          <CardHeader className="px-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">평균가</CardTitle>
          </CardHeader>
          <CardContent className="px-4">
            <p className="text-2xl font-bold text-indigo-600">
              {isEmpty ? EMPTY_MESSAGE : formatPrice(stats.avg)}
            </p>
            {!isEmpty && (
              <p className="text-xs text-muted-foreground mt-0.5">
                중간값 {formatPrice(stats.median)} · 전체 {totalCount}건 중 {stats.count}건 기준
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="py-3 gap-1">
          <CardHeader className="px-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">최저가</CardTitle>
          </CardHeader>
          <CardContent className="px-4">
            <p className="text-2xl font-bold">
              {isEmpty ? '-' : formatPrice(stats.min)}
            </p>
          </CardContent>
        </Card>

        <Card className="py-3 gap-1">
          <CardHeader className="px-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">최고가</CardTitle>
          </CardHeader>
          <CardContent className="px-4">
            <p className="text-2xl font-bold">
              {isEmpty ? '-' : formatPrice(stats.max)}
            </p>
          </CardContent>
        </Card>
      </div>

      {platformStats.length > 1 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {platformStats.map(ps => {
            const info = PLATFORMS[ps.platform]
            return (
              <div
                key={ps.platform}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg border-l-[3px]"
                style={{ borderLeftColor: info.color, backgroundColor: info.color + '0A' }}
              >
                <span className="text-sm font-semibold flex items-center gap-1.5">
                  <span>{info.icon}</span>
                  <span style={{ color: info.color }}>{info.label}</span>
                </span>
                <div className="text-right">
                  <p className="text-sm font-bold">{formatPrice(ps.avg)}</p>
                  <p className="text-[11px] text-muted-foreground">{ps.count}건</p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {scrapedAt && (
        <p className="text-[11px] text-muted-foreground text-right">
          마지막 수집: {new Date(scrapedAt).toLocaleString('ko-KR')}
        </p>
      )}
    </div>
  )
}
