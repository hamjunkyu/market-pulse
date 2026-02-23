'use client'

import { useEffect, useState, useCallback, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import SearchBar from '@/components/SearchBar'
import FilterBar from '@/components/FilterBar'
import PriceSummaryCards from '@/components/PriceSummaryCards'
import PriceTrendChart from '@/components/PriceTrendChart'
import ListingTable from '@/components/ListingTable'
import LoadingState from '@/components/LoadingState'
import EmptyState from '@/components/EmptyState'
import ErrorState from '@/components/ErrorState'
import type { SearchResult } from '@/types'

function SearchContent() {
  const searchParams = useSearchParams()
  const keyword = searchParams.get('keyword') || ''
  const platform = searchParams.get('platform') || 'all'
  const days = searchParams.get('days') || '30'
  const condition = searchParams.get('condition') || 'all'

  const [data, setData] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [scraping, setScraping] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const requestIdRef = useRef(0)

  const fetchData = useCallback(async () => {
    if (!keyword) return
    const requestId = ++requestIdRef.current
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ keyword, platform, days, condition })
      const res = await fetch(`/api/search?${params}`)
      if (!res.ok) throw new Error('검색 실패')
      const result: SearchResult = await res.json()

      if (requestId !== requestIdRef.current) return
      setData(result)

      // 캐시 만료 또는 신규 키워드면 백그라운드 수집
      if (result.isStale) {
        setScraping(true)
        fetch('/api/scrape', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ keyword }),
        })
          .then(res => {
            if (!res.ok) throw new Error('수집 실패')
            // 수집 완료 후 현재 필터 기준으로 재조회
            const freshParams = new URLSearchParams(window.location.search)
            return fetch(`/api/search?${freshParams}`)
          })
          .then(res => {
            if (!res.ok) throw new Error('재조회 실패')
            return res.json()
          })
          .then((freshData: SearchResult) => {
            if (requestId !== requestIdRef.current) return
            setData(freshData)
            setScraping(false)
          })
          .catch(() => {
            if (requestId === requestIdRef.current) setScraping(false)
          })
      }
    } catch {
      if (requestId === requestIdRef.current) {
        setError('데이터를 불러오는 중 오류가 발생했습니다.')
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false)
      }
    }
  }, [keyword, platform, days, condition])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (!keyword) {
    return <EmptyState keyword="" />
  }

  if (loading) {
    return <LoadingState />
  }

  if (error) {
    return <ErrorState message={error} />
  }

  if (!data || (data.listings.length === 0 && !scraping)) {
    return <EmptyState keyword={keyword} />
  }

  return (
    <div className="space-y-6">
      {scraping && (
        <div className="text-center py-3 bg-indigo-50 rounded-lg">
          <div className="inline-flex items-center gap-2">
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
            <span className="text-sm text-indigo-700">새로운 데이터를 수집하고 있습니다...</span>
          </div>
        </div>
      )}
      <PriceSummaryCards stats={data.stats} />
      <PriceTrendChart trend={data.trend} />
      <ListingTable listings={data.listings} />
    </div>
  )
}

export default function SearchPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex flex-col gap-6">
          <div className="flex justify-center">
            <Suspense>
              <SearchBarWithParams />
            </Suspense>
          </div>
          <Suspense>
            <FilterBar />
          </Suspense>
          <Suspense fallback={<LoadingState />}>
            <SearchContent />
          </Suspense>
        </div>
      </div>
    </main>
  )
}

function SearchBarWithParams() {
  const searchParams = useSearchParams()
  const keyword = searchParams.get('keyword') || ''
  return <SearchBar defaultValue={keyword} />
}
