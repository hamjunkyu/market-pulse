'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'

export default function FilterBar() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const platform = searchParams.get('platform') || 'all'
  const days = searchParams.get('days') || '30'
  const condition = searchParams.get('condition') || 'all'
  const exclude = searchParams.get('exclude') || ''

  const [excludeInput, setExcludeInput] = useState(exclude)

  useEffect(() => {
    setExcludeInput(exclude)
  }, [exclude])

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/search?${params.toString()}`)
  }

  const applyExclude = () => {
    const trimmed = excludeInput.trim()
    if (trimmed !== exclude) {
      updateFilter('exclude', trimmed)
    }
  }

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <Select value={platform} onValueChange={v => updateFilter('platform', v)}>
        <SelectTrigger className="w-full sm:w-[140px]" aria-label="플랫폼 선택">
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
        <SelectTrigger className="w-full sm:w-[120px]" aria-label="기간 선택">
          <SelectValue placeholder="기간" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="7">7일</SelectItem>
          <SelectItem value="30">30일</SelectItem>
          <SelectItem value="90">90일</SelectItem>
        </SelectContent>
      </Select>

      <Select value={condition} onValueChange={v => updateFilter('condition', v)}>
        <SelectTrigger className="w-full sm:w-[120px]" aria-label="상태 선택">
          <SelectValue placeholder="상태" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">전체 상태</SelectItem>
          <SelectItem value="new">새상품</SelectItem>
          <SelectItem value="like_new">거의 새것</SelectItem>
          <SelectItem value="used">중고</SelectItem>
        </SelectContent>
      </Select>

      <Input
        className="w-full sm:w-[220px]"
        placeholder="제외 키워드 (쉼표 구분)"
        aria-label="제외할 키워드 (쉼표로 구분)"
        value={excludeInput}
        onChange={e => setExcludeInput(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') applyExclude() }}
        onBlur={applyExclude}
      />
    </div>
  )
}
