'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Clock, X } from 'lucide-react'

export default function RecentSearches() {
  const [searches, setSearches] = useState<string[]>([])

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('recentSearches') || '[]') as string[]
      setSearches(stored)
    } catch {
      // localStorage 접근 실패 무시
    }
  }, [])

  const removeSearch = (keyword: string) => {
    const updated = searches.filter(s => s !== keyword)
    setSearches(updated)
    try {
      localStorage.setItem('recentSearches', JSON.stringify(updated))
    } catch {
      // localStorage 접근 실패 무시
    }
  }

  if (searches.length === 0) return null

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2.5">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">최근 검색어</span>
      </div>
      <div className="flex flex-wrap gap-2.5">
        {searches.map(keyword => (
          <span
            key={keyword}
            className="group inline-flex items-center gap-1 pl-4 pr-2 py-2 text-[15px] border border-border bg-background hover:border-indigo-300 hover:bg-indigo-50 rounded-full transition-all"
          >
            <Link href={`/search?keyword=${encodeURIComponent(keyword)}`}>
              {keyword}
            </Link>
            <button
              onClick={() => removeSearch(keyword)}
              className="p-0.5 rounded-full text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-muted transition-all"
              aria-label={`${keyword} 삭제`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
    </div>
  )
}
