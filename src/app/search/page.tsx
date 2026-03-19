'use client'

import { useEffect, useState, useCallback, useRef, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import SearchBar from '@/components/SearchBar'
import FilterBar from '@/components/FilterBar'
import PriceRangeSlider from '@/components/PriceRangeSlider'
import ProductGroupTabs from '@/components/ProductGroupTabs'
import PriceSummaryCards from '@/components/PriceSummaryCards'
import PriceTrendChart from '@/components/PriceTrendChart'
import PriceDistributionChart from '@/components/PriceDistributionChart'
import ListingTable from '@/components/ListingTable'
import LoadingState from '@/components/LoadingState'
import EmptyState from '@/components/EmptyState'
import ErrorState from '@/components/ErrorState'
import ErrorBoundary from '@/components/ErrorBoundary'
import { calcStats, calcTrend, filterByIQR } from '@/lib/utils/priceStats'
import { clusterListings } from '@/lib/utils/clustering'
import { PLATFORMS } from '@/constants'
import type { Platform, SearchResult } from '@/types'

function SearchContent() {
  const searchParams = useSearchParams()
  const keyword = searchParams.get('keyword') || ''
  const platform = searchParams.get('platform') || 'all'
  const days = searchParams.get('days') || '30'
  const condition = searchParams.get('condition') || 'all'
  const exclude = searchParams.get('exclude') || ''
  const removedDefaults = searchParams.get('removedDefaults') || ''

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
  const [failedPlatforms, setFailedPlatforms] = useState<Platform[]>([])
  const [error, setError] = useState<string | null>(null)
  const requestIdRef = useRef(0)

  const fetchData = useCallback(async () => {
    if (!keyword) return
    const requestId = ++requestIdRef.current
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ keyword, platform, days, condition })
      if (removedDefaults) params.set('removedDefaults', removedDefaults)
      const res = await fetch(`/api/search?${params}`)
      if (!res.ok) throw new Error('검색 실패')
      const result: SearchResult = await res.json()

      if (requestId !== requestIdRef.current) return
      setData(result)

      // 캐시 만료 또는 신규 키워드면 백그라운드 수집
      if (result.isStale) {
        setScraping(true)
        setFailedPlatforms([])
        fetch('/api/scrape', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ keyword }),
        })
          .then(async res => {
            if (!res.ok) throw new Error('수집 실패')
            const scrapeResult = await res.json()
            if (scrapeResult.failedPlatforms?.length > 0) {
              setFailedPlatforms(scrapeResult.failedPlatforms)
            }
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
  }, [keyword, platform, days, condition, removedDefaults])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const minPrice = searchParams.get('minPrice')
  const maxPrice = searchParams.get('maxPrice')

  // 제외 키워드 + 가격 범위 클라이언트 필터링 + 통계 재계산 (Hook은 early return 전에 호출)
  const filtered = useMemo(() => {
    if (!data) return null
    const excludeTerms = exclude
      .split(',')
      .map(s => s.trim().toLowerCase())
      .filter(Boolean)

    const minP = minPrice ? Number(minPrice) : null
    const maxP = maxPrice ? Number(maxPrice) : null

    const listings = data.listings.filter(l => {
      if (excludeTerms.length > 0 && excludeTerms.some(term => l.title.toLowerCase().includes(term))) return false
      if (minP !== null && l.price < minP) return false
      if (maxP !== null && l.price > maxP) return false
      return true
    })
    const prices = listings.map(l => l.price)

    if (excludeTerms.length === 0 && minP === null && maxP === null) return data

    return {
      ...data,
      stats: calcStats(prices),
      trend: calcTrend(listings),
      listings,
    }
  }, [data, exclude, minPrice, maxPrice])

  // 제품 그룹 클러스터링
  const groups = useMemo(() => {
    if (!filtered) return []
    return clusterListings(filtered.listings, keyword)
  }, [filtered, keyword])

  const [activeGroup, setActiveGroup] = useState<string | null>(null)

  // 원본 데이터 기준 가격 범위 (슬라이더용)
  const priceRange = useMemo(() => {
    if (!data || data.listings.length === 0) return undefined
    const prices = data.listings.map(l => l.price)
    return { min: Math.min(...prices), max: Math.max(...prices) }
  }, [data])

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
      {failedPlatforms.length > 0 && (
        <div className="text-center py-2.5 bg-amber-50 border border-amber-200 rounded-lg">
          <span className="text-sm text-amber-700">
            {failedPlatforms.map(p => PLATFORMS[p].label).join(', ')} 수집에 실패했습니다. 해당 플랫폼 데이터가 누락될 수 있습니다.
          </span>
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

          {/* 필터 → 가격범위 → 리스팅 */}
          <div className="bg-card rounded-xl border shadow-sm p-4">
            <FilterBar />
          </div>
          {priceRange && <PriceRangeSlider priceRange={priceRange} />}
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
          <div className="bg-card rounded-xl border shadow-sm p-4 space-y-3 mb-2">
            <div className="flex justify-center">
              <Suspense>
                <SearchBarWithParams />
              </Suspense>
            </div>
          </div>
          <ErrorBoundary>
            <Suspense fallback={<LoadingState />}>
              <SearchContent />
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>
    </main>
  )
}

function SearchBarWithParams() {
  const searchParams = useSearchParams()
  const keyword = searchParams.get('keyword') || ''
  return <SearchBar defaultValue={keyword} compact />
}
