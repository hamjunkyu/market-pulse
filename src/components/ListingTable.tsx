'use client'

import Image from 'next/image'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PLATFORMS } from '@/constants'
import type { Listing, Platform } from '@/types'

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
  if (listings.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">거래 목록 ({listings.length}건)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {listings.map(listing => (
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
