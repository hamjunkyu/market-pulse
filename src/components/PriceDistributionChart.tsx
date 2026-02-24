'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
  prices: number[]
  avg: number
}

function buildBins(prices: number[], binCount: number) {
  if (prices.length === 0) return []
  const sorted = [...prices].sort((a, b) => a - b)
  const min = sorted[0]
  const max = sorted[sorted.length - 1]
  if (min === max) return [{ range: `${min.toLocaleString('ko-KR')}원`, count: sorted.length, from: min, to: max }]

  const binSize = Math.ceil((max - min) / binCount)
  const bins: { range: string; count: number; from: number; to: number }[] = []

  for (let i = 0; i < binCount; i++) {
    const from = min + i * binSize
    const to = i === binCount - 1 ? max : from + binSize - 1
    const count = sorted.filter(p => p >= from && (i === binCount - 1 ? p <= to : p < from + binSize)).length
    if (count === 0 && i > 0 && bins.length > 0) continue // 빈 구간 중간은 유지하되 뒤쪽 빈 구간 제거는 하지 않음

    const formatK = (v: number) => {
      if (v >= 10000) return `${Math.round(v / 10000)}만`
      if (v >= 1000) return `${Math.round(v / 1000)}천`
      return v.toString()
    }

    bins.push({
      range: `${formatK(from)}~${formatK(to)}`,
      count,
      from,
      to,
    })
  }

  return bins
}

export default function PriceDistributionChart({ prices, avg }: Props) {
  if (prices.length < 3) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">가격 분포</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            분포를 표시하려면 3건 이상의 데이터가 필요합니다.
          </p>
        </CardContent>
      </Card>
    )
  }

  const binCount = Math.min(Math.max(Math.ceil(Math.sqrt(prices.length)), 5), 12)
  const bins = buildBins(prices, binCount)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">가격 분포</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={bins}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="range"
              fontSize={11}
              interval={0}
              angle={-30}
              textAnchor="end"
              height={50}
            />
            <YAxis fontSize={12} allowDecimals={false} />
            <Tooltip
              formatter={(value: number | undefined) => {
                if (value == null) return ['', '']
                return [`${value}건`, '거래 수']
              }}
            />
            <ReferenceLine
              x={bins.find(b => avg >= b.from && avg <= b.to)?.range}
              stroke="#4f46e5"
              strokeDasharray="4 4"
              label={{ value: '평균', position: 'top', fontSize: 11, fill: '#4f46e5' }}
            />
            <Bar
              dataKey="count"
              fill="#818cf8"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
