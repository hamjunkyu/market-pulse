'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function FilterBar() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const keyword = searchParams.get('keyword') || ''
  const platform = searchParams.get('platform') || 'all'
  const days = searchParams.get('days') || '30'
  const condition = searchParams.get('condition') || 'all'

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set(key, value)
    router.push(`/search?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Select value={platform} onValueChange={v => updateFilter('platform', v)}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="플랫폼" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">전체 플랫폼</SelectItem>
          <SelectItem value="bunjang">번개장터</SelectItem>
          <SelectItem value="joonggonara">중고나라</SelectItem>
          <SelectItem value="daangn">당근마켓</SelectItem>
        </SelectContent>
      </Select>

      <Select value={days} onValueChange={v => updateFilter('days', v)}>
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="기간" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="7">7일</SelectItem>
          <SelectItem value="30">30일</SelectItem>
          <SelectItem value="90">90일</SelectItem>
        </SelectContent>
      </Select>

      <Select value={condition} onValueChange={v => updateFilter('condition', v)}>
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="상태" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">전체 상태</SelectItem>
          <SelectItem value="new">새상품</SelectItem>
          <SelectItem value="like_new">거의 새것</SelectItem>
          <SelectItem value="used">중고</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
