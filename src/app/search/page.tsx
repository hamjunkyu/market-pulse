'use client'

import { useEffect, useState, useCallback, useRef, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import SearchBar from '@/components/SearchBar'
import FilterBar from '@/components/FilterBar'
import ProductGroupTabs from '@/components/ProductGroupTabs'
import PriceSummaryCards from '@/components/PriceSummaryCards'
import PriceTrendChart from '@/components/PriceTrendChart'
import PriceDistributionChart from '@/components/PriceDistributionChart'
import ListingTable from '@/components/ListingTable'
import LoadingState from '@/components/LoadingState'
import EmptyState from '@/components/EmptyState'
import ErrorState from '@/components/ErrorState'
import { calcStats, calcTrend, filterByIQR } from '@/lib/utils/priceStats'
import { clusterListings } from '@/lib/utils/clustering'
import type { SearchResult } from '@/types'

function SearchContent() {
  const searchParams = useSearchParams()
  const keyword = searchParams.get('keyword') || ''
  const platform = searchParams.get('platform') || 'all'
  const days = searchParams.get('days') || '30'
  const condition = searchParams.get('condition') || 'all'
  const exclude = searchParams.get('exclude') || ''

  // 동적 페이지 타이틀
  useEffect(() => {
    if (keyword) {
      document.title = `${keyword} 시세 | 중고 시세 조회기`
    }
    return () => { document.title = '중고 시세 조회기 | 번개장터·중고나라·당근마켓 통합 시세' }
  }, [keyword])

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

  // 제외 키워드 클라이언트 필터링 + 통계 재계산 (Hook은 early return 전에 호출)
  const filtered = useMemo(() => {
    if (!data) return null
    const excludeTerms = exclude
      .split(',')
      .map(s => s.trim().toLowerCase())
      .filter(Boolean)

    if (excludeTerms.length === 0) return data

    const listings = data.listings.filter(
      l => !excludeTerms.some(term => l.title.toLowerCase().includes(term))
    )
    const prices = listings.map(l => l.price)
    return {
      ...data,
      stats: calcStats(prices),
      trend: calcTrend(listings),
      listings,
    }
  }, [data, exclude])

  // 제품 그룹 클러스터링
  const groups = useMemo(() => {
    if (!filtered) return []
    return clusterListings(filtered.listings, keyword)
  }, [filtered, keyword])

  const [activeGroup, setActiveGroup] = useState<string | null>(null)

  // 데이터 변경 시 그룹 선택 초기화
  useEffect(() => {
    setActiveGroup(null)
  }, [keyword, platform, days, condition, exclude])

  // 선택된 그룹 기준으로 최종 데이터 계산
  const view = useMemo(() => {
    if (!filtered) return null
    if (activeGroup === null || groups.length === 0) {
      return {
        listings: filtered.listings,
        stats: filtered.stats,
        trend: filtered.trend,
      }
    }
    const group = groups.find(g => g.id === activeGroup)
    if (!group) return {
      listings: filtered.listings,
      stats: filtered.stats,
      trend: filtered.trend,
    }
    const prices = group.listings.map(l => l.price)
    return {
      listings: group.listings,
      stats: calcStats(prices),
      trend: calcTrend(group.listings),
    }
  }, [filtered, activeGroup, groups])

  if (!keyword) {
    return <EmptyState keyword="" />
  }

  if (loading) {
    return <LoadingState />
  }

  if (error) {
    return <ErrorState message={error} />
  }

  if (!filtered || !view || (filtered.listings.length === 0 && !scraping)) {
    return <EmptyState keyword={keyword} />
  }

  const isCollecting = scraping && filtered.listings.length === 0

  return (
    <div className="space-y-4">
      {scraping && (
        <div className="text-center py-2.5 bg-indigo-50 rounded-lg">
          <div className="inline-flex items-center gap-2">
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
            <span className="text-sm text-indigo-700">
              {isCollecting ? '첫 데이터를 수집하고 있습니다. 잠시만 기다려주세요...' : '새로운 데이터를 수집하고 있습니다...'}
            </span>
          </div>
        </div>
      )}
      {isCollecting ? <LoadingState /> : (
        <>
          <ProductGroupTabs
            groups={groups}
            activeGroup={activeGroup}
            onSelect={setActiveGroup}
            keyword={keyword}
          />
          <PriceSummaryCards stats={view.stats} listings={view.listings} scrapedAt={filtered.scrapedAt} />
          <PriceTrendChart trend={view.trend} />
          <PriceDistributionChart prices={filterByIQR(view.listings.map(l => l.price))} avg={view.stats.avg} />
          <ListingTable listings={view.listings} />
        </>
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50/50 to-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex flex-col gap-4">
          <div className="bg-card rounded-xl border shadow-sm p-4 space-y-3">
            <div className="flex justify-center">
              <Suspense>
                <SearchBarWithParams />
              </Suspense>
            </div>
            <Suspense>
              <FilterBar />
            </Suspense>
          </div>
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
