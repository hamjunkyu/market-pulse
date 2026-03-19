'use client'

import { useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { DEFAULT_EXCLUDE_KEYWORDS } from '@/lib/utils/titleFilter'

const XIcon = () => (
  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
)

export default function FilterBar() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const platform = searchParams.get('platform') || 'all'
  const days = searchParams.get('days') || '30'
  const condition = searchParams.get('condition') || 'all'
  const exclude = searchParams.get('exclude') || ''
  const removedDefaults = searchParams.get('removedDefaults') || ''

  const excludeTags = exclude ? exclude.split(',').map(s => s.trim()).filter(Boolean) : []
  const removedDefaultTags = removedDefaults ? removedDefaults.split(',').map(s => s.trim()).filter(Boolean) : []
  const activeDefaults = DEFAULT_EXCLUDE_KEYWORDS.filter(k => !removedDefaultTags.includes(k))

  const [excludeInput, setExcludeInput] = useState('')

  const updateParams = useCallback((updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    }
    router.replace(`/search?${params.toString()}`)
  }, [searchParams, router])

  const updateFilter = useCallback((key: string, value: string) => {
    updateParams({ [key]: value })
  }, [updateParams])

  const addExcludeTag = () => {
    const trimmed = excludeInput.trim()
    if (!trimmed || excludeTags.includes(trimmed) || activeDefaults.includes(trimmed)) {
      setExcludeInput('')
      return
    }
    // 만약 이전에 삭제했던 기본 키워드를 다시 추가하면 removedDefaults에서 복원
    if (removedDefaultTags.includes(trimmed)) {
      const newRemoved = removedDefaultTags.filter(t => t !== trimmed)
      updateParams({ removedDefaults: newRemoved.join(',') })
      setExcludeInput('')
      return
    }
    const newTags = [...excludeTags, trimmed]
    updateFilter('exclude', newTags.join(','))
    setExcludeInput('')
  }

  const removeExcludeTag = (tag: string) => {
    const newTags = excludeTags.filter(t => t !== tag)
    updateFilter('exclude', newTags.join(','))
  }

  const removeDefaultTag = (tag: string) => {
    const newRemoved = [...removedDefaultTags, tag]
    updateParams({ removedDefaults: newRemoved.join(',') })
  }

  return (
    <div className="space-y-3">
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
      </div>

      <div className="space-y-3">
        <div className="flex gap-2">
          <Input
            className="flex-1"
            placeholder="제외할 키워드 입력 (예: 택배비)"
            aria-label="제외할 키워드 입력"
            value={excludeInput}
            onChange={e => setExcludeInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addExcludeTag() } }}
          />
          <button
            type="button"
            onClick={addExcludeTag}
            disabled={!excludeInput.trim()}
            className="px-3 py-1.5 text-sm rounded-md bg-indigo-100 text-indigo-700 hover:bg-indigo-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            추가
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {activeDefaults.map(tag => (
            <span
              key={`default-${tag}`}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full bg-gray-100 text-gray-500 border border-gray-200"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeDefaultTag(tag)}
                className="hover:text-gray-700 transition-colors"
                aria-label={`${tag} 제거`}
              >
                <XIcon />
              </button>
            </span>
          ))}
          {excludeTags.map(tag => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-sm rounded-full bg-red-50 text-red-600 border border-red-200"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeExcludeTag(tag)}
                className="hover:text-red-800 transition-colors"
                aria-label={`${tag} 제거`}
              >
                <XIcon />
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
