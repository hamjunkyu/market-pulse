import type { Listing, PriceStats, TrendPoint } from '@/types'
import { format } from 'date-fns'

// IQR 방식으로 이상치 제거 후 통계 계산
export function calcStats(prices: number[]): PriceStats {
  if (prices.length === 0) {
    return { avg: 0, min: 0, max: 0, median: 0, count: 0 }
  }
  const sorted = [...prices].sort((a, b) => a - b)
  const q1 = sorted[Math.floor(sorted.length * 0.25)]
  const q3 = sorted[Math.floor(sorted.length * 0.75)]
  const iqr = q3 - q1
  const filtered = sorted.filter(p => p >= q1 - 1.5 * iqr && p <= q3 + 1.5 * iqr)
  if (filtered.length === 0) {
    return { avg: 0, min: 0, max: 0, median: 0, count: 0 }
  }

  const avg = Math.round(filtered.reduce((s, p) => s + p, 0) / filtered.length)
  const median = filtered[Math.floor(filtered.length / 2)]

  return {
    avg,
    min: filtered[0],
    max: filtered[filtered.length - 1],
    median,
    count: filtered.length,
  }
}

// IQR 필터링된 평균 계산 (내부 헬퍼)
function iqrAvg(prices: number[]): number {
  if (prices.length === 0) return 0
  const sorted = [...prices].sort((a, b) => a - b)
  const q1 = sorted[Math.floor(sorted.length * 0.25)]
  const q3 = sorted[Math.floor(sorted.length * 0.75)]
  const iqr = q3 - q1
  const filtered = sorted.filter(p => p >= q1 - 1.5 * iqr && p <= q3 + 1.5 * iqr)
  if (filtered.length === 0) return 0
  return Math.round(filtered.reduce((s, p) => s + p, 0) / filtered.length)
}

// 날짜별 평균가 트렌드 생성 (IQR 이상치 제거 적용)
export function calcTrend(listings: Listing[]): TrendPoint[] {
  const byDate: Record<string, number[]> = {}
  for (const l of listings) {
    if (!l.sold_at) continue
    const date = format(new Date(l.sold_at), 'yyyy-MM-dd')
    if (!byDate[date]) byDate[date] = []
    byDate[date].push(l.price)
  }
  return Object.entries(byDate)
    .map(([date, prices]) => ({
      date,
      avg: iqrAvg(prices),
      count: prices.length,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
}
