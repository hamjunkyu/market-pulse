import { Card, CardContent } from '@/components/ui/card'
import { SearchX } from 'lucide-react'

export default function EmptyState({ keyword }: { keyword: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16">
        <SearchX className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">검색 결과가 없습니다</h3>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          &ldquo;{keyword}&rdquo;에 대한 시세 데이터가 아직 없습니다.
          잠시 후 다시 시도해 주세요.
        </p>
      </CardContent>
    </Card>
  )
}
