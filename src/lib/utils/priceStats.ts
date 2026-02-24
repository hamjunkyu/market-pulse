import type { Listing, PriceStats, TrendPoint } from '@/types'
import { format } from 'date-fns'

// IQR 방식으로 이상치를 제거한 배열 반환
export function filterByIQR(prices: number[]): number[] {
  if (prices.length === 0) return []
  const sorted = [...prices].sort((a, b) => a - b)
  const q1 = sorted[Math.floor(sorted.length * 0.25)]
  const q3 = sorted[Math.floor(sorted.length * 0.75)]
  const iqr = q3 - q1
  return sorted.filter(p => p >= q1 - 1.5 * iqr && p <= q3 + 1.5 * iqr)
}

// IQR 필터링 후 평균 계산
function iqrAvg(prices: number[]): number {
  const filtered = filterByIQR(prices)
  if (filtered.length === 0) return 0
  return Math.round(filtered.reduce((s, p) => s + p, 0) / filtered.length)
}

// IQR 이상치 제거 후 통계 계산
export function calcStats(prices: number[]): PriceStats {
  const filtered = filterByIQR(prices)
  if (filtered.length === 0) {
    return { avg: 0, min: 0, max: 0, median: 0, count: 0 }
  }

  const avg = Math.round(filtered.reduce((s, p) => s + p, 0) / filtered.length)
  const mid = Math.floor(filtered.length / 2)
  const median = filtered.length % 2 === 1
    ? filtered[mid]
    : Math.round((filtered[mid - 1] + filtered[mid]) / 2)

  return {
    avg,
    min: filtered[0],
    max: filtered[filtered.length - 1],
    median,
    count: filtered.length,
  }
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
