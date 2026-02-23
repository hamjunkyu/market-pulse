import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { PriceStats } from '@/types'

interface Props {
  stats: PriceStats
}

function formatPrice(price: number): string {
  return price.toLocaleString('ko-KR') + '원'
}

export default function PriceSummaryCards({ stats }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card className="border-indigo-200 border-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">평균가</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-indigo-600">{formatPrice(stats.avg)}</p>
          <p className="text-xs text-muted-foreground mt-1">
            중간값 {formatPrice(stats.median)} · {stats.count}건 기준
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">최저가</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{formatPrice(stats.min)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">최고가</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{formatPrice(stats.max)}</p>
        </CardContent>
      </Card>
    </div>
  )
}
