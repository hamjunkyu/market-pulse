import { MAX_ITEMS_PER_PLATFORM } from '@/constants'
import type { Listing, Platform } from '@/types'

const PLATFORM: Platform = 'bunjang'
const API_URL = 'https://api.bunjang.co.kr/api/1/find_v2.json'

interface BunjangItem {
  pid: string
  name: string
  price: string
  product_image: string
  update_time: number
  used: number  // 1=중고, 2=새상품
}

export async function scrapeBunjang(keyword: string): Promise<Omit<Listing, 'id' | 'created_at'>[]> {
  const results: Omit<Listing, 'id' | 'created_at'>[] = []

  try {
    const url = `${API_URL}?q=${encodeURIComponent(keyword)}&order=date&page=0&n=${MAX_ITEMS_PER_PLATFORM}`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    })

    if (!res.ok) {
      console.error(`번개장터 API 응답 에러: ${res.status}`)
      return []
    }

    const data = await res.json()
    const items: BunjangItem[] = data.list ?? []

    for (const item of items) {
      const price = parseInt(item.price, 10)
      if (isNaN(price) || price <= 0) continue

      const thumbnailUrl = item.product_image
        ? item.product_image.replace('{res}', '360')
        : null

      results.push({
        platform: PLATFORM,
        keyword,
        title: item.name,
        price,
        condition: item.used === 2 ? 'new' : 'used',
        sold_at: new Date(item.update_time * 1000).toISOString(),
        url: `https://m.bunjang.co.kr/products/${item.pid}`,
        thumbnail_url: thumbnailUrl,
      })
    }
  } catch (e) {
    console.error('번개장터 수집 실패:', e)
  }

  return results
}
