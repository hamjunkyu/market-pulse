'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Clock } from 'lucide-react'

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

  if (searches.length === 0) return null

  return (
    <div className="w-full max-w-2xl">
      <div className="flex items-center gap-2 mb-2">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">최근 검색어</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {searches.map(keyword => (
          <Link
            key={keyword}
            href={`/search?keyword=${encodeURIComponent(keyword)}`}
            className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-indigo-50 rounded-full transition-colors"
          >
            {keyword}
          </Link>
        ))}
      </div>
    </div>
  )
}
