'use client'

import { useState, useMemo } from 'react'
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
import type { Listing, Platform } from '@/types'

type SortKey = 'date_desc' | 'date_asc' | 'price_asc' | 'price_desc'

interface Props {
  listings: Listing[]
}

function PlatformBadge({ platform }: { platform: Platform }) {
  const info = PLATFORMS[platform]
  return (
    <Badge
      variant="outline"
      style={{ borderColor: info.color, color: info.color }}
      className="text-xs"
    >
      {info.label}
    </Badge>
  )
}

export default function ListingTable({ listings }: Props) {
  const [sort, setSort] = useState<SortKey>('date_desc')

  const sorted = useMemo(() => {
    const copy = [...listings]
    switch (sort) {
      case 'date_desc':
        return copy.sort((a, b) => (b.sold_at ?? '').localeCompare(a.sold_at ?? ''))
      case 'date_asc':
        return copy.sort((a, b) => (a.sold_at ?? '').localeCompare(b.sold_at ?? ''))
      case 'price_asc':
        return copy.sort((a, b) => a.price - b.price)
      case 'price_desc':
        return copy.sort((a, b) => b.price - a.price)
    }
  }, [listings, sort])

  if (listings.length === 0) return null

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">거래 목록 ({listings.length}건)</CardTitle>
        <Select value={sort} onValueChange={v => setSort(v as SortKey)}>
          <SelectTrigger className="w-[130px] h-8 text-xs">
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
        <div className="space-y-3">
          {sorted.map(listing => (
            <a
              key={listing.id}
              href={listing.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-shrink-0 w-[60px] h-[60px] rounded-md overflow-hidden bg-gray-100">
                {listing.thumbnail_url ? (
                  <Image
                    src={listing.thumbnail_url}
                    alt={listing.title}
                    width={60}
                    height={60}
                    className="object-cover w-full h-full"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl">
                    📦
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{listing.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <PlatformBadge platform={listing.platform} />
                  {listing.sold_at && (
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(listing.sold_at), 'M월 d일')}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex-shrink-0 text-right">
                <p className="text-sm font-bold text-indigo-600">
                  {listing.price.toLocaleString('ko-KR')}원
                </p>
              </div>
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
