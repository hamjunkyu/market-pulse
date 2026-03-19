'use client'

import { useState } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
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
  const [open, setOpen] = useState(false)

  if (trend.length < 2) {
    return (
      <div className="bg-card rounded-xl border shadow-sm px-4 py-3">
        <h3 className="text-lg font-semibold">시세 트렌드</h3>
        <p className="text-sm text-muted-foreground mt-1">
          트렌드를 표시하려면 2일 이상의 데이터가 필요합니다.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-xl border shadow-sm">
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className="w-full flex items-center justify-between px-4 py-3 cursor-pointer select-none"
      >
        <h3 className="text-lg font-semibold">시세 트렌드</h3>
        <svg
          className={`h-4 w-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="px-4 pb-4">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={trend} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <defs>
                <linearGradient id="avgGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                fontSize={13}
              />
              <YAxis
                tickFormatter={formatYAxis}
                fontSize={13}
                width={45}
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
              <Area
                type="monotone"
                dataKey="avg"
                stroke="#4f46e5"
                strokeWidth={2}
                fill="url(#avgGradient)"
                dot={{ r: 3, fill: '#4f46e5' }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
