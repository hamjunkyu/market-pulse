'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function ErrorState({ message }: { message?: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">오류가 발생했습니다</h3>
        <p className="text-sm text-muted-foreground text-center max-w-md mb-4">
          {message || '데이터를 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.'}
        </p>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
        >
          다시 시도
        </Button>
      </CardContent>
    </Card>
  )
}
