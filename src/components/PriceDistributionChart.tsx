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

  if (min === max) {
    const label = min >= 10000
      ? `${Math.round(min / 10000)}만원`
      : `${min.toLocaleString()}원`
    return [{ range: label, count: sorted.length, from: min, to: max }]
  }

  const binSize = Math.ceil((max - min) / binCount)
  const bins: { range: string; count: number; from: number; to: number }[] = []

  for (let i = 0; i < binCount; i++) {
    const from = min + i * binSize
    const to = i === binCount - 1 ? max : from + binSize - 1
    const count = sorted.filter(p => p >= from && (i === binCount - 1 ? p <= to : p < from + binSize)).length
    if (count === 0 && i > 0 && bins.length > 0) continue

    const f = Math.round(from / 10000)
    const t = Math.round(to / 10000)
    bins.push({
      range: `${f}~${t}만원`,
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
          <CardTitle className="text-lg">가격 분포</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            분포를 표시하려면 3건 이상의 데이터가 필요합니다.
          </p>
        </CardContent>
      </Card>
    )
  }

  const binCount = Math.min(Math.max(Math.ceil(Math.sqrt(prices.length)), 4), 6)
  const bins = buildBins(prices, binCount)

  return (
    <Card className="py-4 gap-2">
      <CardHeader className="px-4">
        <CardTitle className="text-lg">가격 분포</CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={bins} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="range"
              fontSize={13}
              interval={0}
              tickLine={false}
            />
            <YAxis fontSize={13} allowDecimals={false} width={35} />
            <Tooltip
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any, _name: any, props: any) => {
                if (value == null) return ['', '']
                return [`${value}건`, props?.payload?.range ?? '거래 수']
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
