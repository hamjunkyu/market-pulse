'use client'

import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PLATFORMS } from '@/constants'
import type { Listing, ListingStatus, Platform } from '@/types'

type SortKey = 'date_desc' | 'date_asc' | 'price_asc' | 'price_desc'

const PAGE_SIZE = 20

interface Props {
  listings: Listing[]
}

const STATUS_BADGE: Record<ListingStatus, { label: string; className: string } | null> = {
  selling: null,
  reserved: { label: '예약중', className: 'border-amber-400 text-amber-600 bg-amber-50' },
  sold: { label: '판매완료', className: 'border-gray-300 text-gray-500 bg-gray-50' },
  deleted: null,
}

function StatusBadge({ status }: { status: ListingStatus }) {
  const info = STATUS_BADGE[status]
  if (!info) return null
  return (
    <Badge variant="outline" className={`text-xs ${info.className}`}>
      {info.label}
    </Badge>
  )
}

function PlatformBadge({ platform }: { platform: Platform }) {
  const info = PLATFORMS[platform]
  return (
    <Badge
      variant="outline"
      style={{ borderColor: info.color, color: info.color }}
      className="text-xs"
    >
      {info.icon} {info.label}
    </Badge>
  )
}

export default function ListingTable({ listings }: Props) {
  const [sort, setSort] = useState<SortKey>('date_desc')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const sentinelRef = useRef<HTMLDivElement>(null)

  // listings나 sort 변경 시 초기화
  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [listings, sort])

  const sorted = useMemo(() => {
    const copy = [...listings]
    switch (sort) {
      case 'date_desc':
        return copy.sort((a, b) => {
          if (!a.sold_at) return 1
          if (!b.sold_at) return -1
          return b.sold_at.localeCompare(a.sold_at)
        })
      case 'date_asc':
        return copy.sort((a, b) => {
          if (!a.sold_at) return 1
          if (!b.sold_at) return -1
          return a.sold_at.localeCompare(b.sold_at)
        })
      case 'price_asc':
        return copy.sort((a, b) => a.price - b.price)
      case 'price_desc':
        return copy.sort((a, b) => b.price - a.price)
    }
  }, [listings, sort])

  const hasMore = visibleCount < sorted.length

  const loadMore = useCallback(() => {
    setVisibleCount(prev => Math.min(prev + PAGE_SIZE, sorted.length))
  }, [sorted.length])

  // IntersectionObserver로 무한 스크롤
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !hasMore) return

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) loadMore()
      },
      { rootMargin: '200px' }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore, loadMore])

  if (listings.length === 0) return null

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">거래 목록 ({listings.length}건)</CardTitle>
        <Select value={sort} onValueChange={v => setSort(v as SortKey)}>
          <SelectTrigger className="w-[130px] h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date_desc">최신순</SelectItem>
            <SelectItem value="date_asc">오래된순</SelectItem>
            <SelectItem value="price_asc">낮은가격순</SelectItem>
            <SelectItem value="price_desc">높은가격순</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="divide-y">
          {sorted.slice(0, visibleCount).map(listing => (
            <a
              key={listing.id}
              href={listing.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex gap-3 py-4 px-2 sm:px-3 hover:bg-muted/50 transition-colors"
            >
              <div className="hidden sm:block flex-shrink-0 w-[72px] h-[72px] rounded-md overflow-hidden bg-muted">
                {listing.thumbnail_url ? (
                  <Image
                    src={listing.thumbnail_url}
                    alt={listing.title}
                    width={72}
                    height={72}
                    className="object-cover w-full h-full"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-2xl">
                    📦
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-medium truncate">{listing.title}</p>
                <div className="flex items-center gap-2 mt-2">
                  <PlatformBadge platform={listing.platform} />
                  <StatusBadge status={listing.status} />
                  {listing.sold_at && (
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(listing.sold_at), 'M월 d일')}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex-shrink-0 text-right">
                <p className="text-[15px] font-bold text-indigo-600">
                  {listing.price.toLocaleString('ko-KR')}원
                </p>
              </div>
            </a>
          ))}
        </div>
        {hasMore && <div ref={sentinelRef} className="h-1" />}
      </CardContent>
    </Card>
  )
}
