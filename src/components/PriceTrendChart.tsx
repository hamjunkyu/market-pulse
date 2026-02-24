'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { TrendPoint } from '@/types'

interface Props {
  trend: TrendPoint[]
}

function formatYAxis(value: number): string {
  if (value >= 10000) return `${Math.round(value / 10000)}만`
  return value.toLocaleString()
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

export default function PriceTrendChart({ trend }: Props) {
  if (trend.length < 2) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">시세 트렌드</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            트렌드를 표시하려면 2일 이상의 데이터가 필요합니다.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="py-4 gap-2">
      <CardHeader className="px-4">
        <CardTitle className="text-base">시세 트렌드</CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={trend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              fontSize={12}
            />
            <YAxis
              tickFormatter={formatYAxis}
              fontSize={12}
              width={60}
            />
            <Tooltip
              formatter={(value: number | undefined) => {
                if (value == null) return ['', '']
                return [value.toLocaleString('ko-KR') + '원', '평균가']
              }}
              labelFormatter={(label: React.ReactNode) => {
                const d = new Date(String(label))
                return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`
              }}
            />
            <Line
              type="monotone"
              dataKey="avg"
              stroke="#4f46e5"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
