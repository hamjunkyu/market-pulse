'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Slider } from '@/components/ui/slider'

interface Props {
  priceRange: { min: number; max: number }
}

function formatPrice(value: number): string {
  if (value >= 10000) return `${Math.round(value / 10000)}만원`
  return `${value.toLocaleString()}원`
}

export default function PriceRangeSlider({ priceRange }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const minPrice = searchParams.get('minPrice')
  const maxPrice = searchParams.get('maxPrice')

  const [sliderValue, setSliderValue] = useState<[number, number]>([
    priceRange.min,
    priceRange.max,
  ])

  useEffect(() => {
    const min = minPrice ? Number(minPrice) : priceRange.min
    const max = maxPrice ? Number(maxPrice) : priceRange.max
    setSliderValue([
      Math.max(min, priceRange.min),
      Math.min(max, priceRange.max),
    ])
  }, [priceRange, minPrice, maxPrice])

  const updatePriceRange = useCallback((values: [number, number]) => {
    const params = new URLSearchParams(searchParams.toString())
    if (values[0] > priceRange.min) {
      params.set('minPrice', String(values[0]))
    } else {
      params.delete('minPrice')
    }
    if (values[1] < priceRange.max) {
      params.set('maxPrice', String(values[1]))
    } else {
      params.delete('maxPrice')
    }
    router.replace(`/search?${params.toString()}`)
  }, [priceRange, searchParams, router])

  if (priceRange.min >= priceRange.max) return null

  return (
    <div className="bg-card rounded-xl border shadow-sm p-4 space-y-3">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>가격 범위</span>
        <span className="font-medium text-foreground">
          {formatPrice(sliderValue[0])} ~ {formatPrice(sliderValue[1])}
        </span>
      </div>
      <Slider
        min={priceRange.min}
        max={priceRange.max}
        step={Math.max(1000, Math.round((priceRange.max - priceRange.min) / 100))}
        value={sliderValue}
        onValueChange={v => setSliderValue(v as [number, number])}
        onValueCommit={v => updatePriceRange(v as [number, number])}
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{formatPrice(priceRange.min)}</span>
        <span>{formatPrice(priceRange.max)}</span>
      </div>
    </div>
  )
}
