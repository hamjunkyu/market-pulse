'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface SearchBarProps {
  defaultValue?: string
}

export default function SearchBar({ defaultValue = '' }: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue)
  const router = useRouter()

  const handleSearch = useCallback(() => {
    const trimmed = query.trim()
    if (!trimmed) return

    // localStorage에 최근 검색어 저장
    try {
      const stored = JSON.parse(localStorage.getItem('recentSearches') || '[]') as string[]
      const updated = [trimmed, ...stored.filter(s => s !== trimmed)].slice(0, 5)
      localStorage.setItem('recentSearches', JSON.stringify(updated))
    } catch {
      // localStorage 접근 실패 무시
    }

    router.push(`/search?keyword=${encodeURIComponent(trimmed)}`)
  }, [query, router])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }

  return (
    <div className="flex w-full max-w-2xl gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" aria-hidden="true" />
        <Input
          type="text"
          placeholder="검색어를 입력하세요 (예: 아이폰 15)"
          aria-label="검색 키워드"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="pl-12 h-14 !text-lg"
        />
      </div>
      <Button
        onClick={handleSearch}
        disabled={!query.trim()}
        className="h-14 px-8 text-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
      >
        검색
      </Button>
    </div>
  )
}
