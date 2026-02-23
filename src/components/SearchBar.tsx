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
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="검색어를 입력하세요 (예: 아이폰 15)"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="pl-10 h-12 text-base"
        />
      </div>
      <Button onClick={handleSearch} className="h-12 px-6 bg-indigo-600 hover:bg-indigo-700">
        검색
      </Button>
    </div>
  )
}
