import type { Listing, Platform } from '@/types'

const PLATFORM: Platform = 'daangn'
const SEARCH_URL = 'https://www.daangn.com/kr/buy-sell/s/'

interface DaangnArticle {
  id: string
  href: string
  title: string
  price: string          // "650000.0"
  status: string         // "Ongoing" | "Reserved" | "Closed"
  thumbnail: string
  createdAt: string      // ISO 8601
}

export async function scrapeDaangn(keyword: string): Promise<Omit<Listing, 'id' | 'created_at'>[]> {
  const results: Omit<Listing, 'id' | 'created_at'>[] = []

  try {
    const url = `${SEARCH_URL}?search=${encodeURIComponent(keyword)}`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    })

    if (!res.ok) {
      console.error(`당근마켓 응답 에러: ${res.status}`)
      return []
    }

    const html = await res.text()

    // window.__remixContext JSON 추출
    const remixMatch = html.match(/window\.__remixContext\s*=\s*(\{[\s\S]*?\});/)
    if (!remixMatch) {
      console.error('당근마켓: __remixContext를 찾을 수 없음')
      return []
    }

    const remixData = JSON.parse(remixMatch[1])

    // loaderData에서 FleamarketArticle 목록 추출
    const articles: DaangnArticle[] = findArticles(remixData) ?? []

    for (const article of articles) {
      const price = Math.round(parseFloat(article.price))
      if (isNaN(price) || price <= 0) continue

      results.push({
        platform: PLATFORM,
        keyword,
        title: article.title,
        price,
        condition: 'unknown',
        sold_at: article.createdAt
          ? new Date(article.createdAt).toISOString()
          : new Date().toISOString(),
        url: article.href?.startsWith('http')
          ? article.href
          : `https://www.daangn.com${article.href}`,
        thumbnail_url: article.thumbnail || null,
      })
    }
  } catch (e) {
    console.error('당근마켓 수집 실패:', e)
  }

  return results
}

// remixContext 내부에서 articles 배열을 재귀적으로 찾는 헬퍼
function findArticles(obj: unknown): DaangnArticle[] | null {
  if (!obj || typeof obj !== 'object') return null
  if (Array.isArray(obj)) {
    // 배열의 첫 요소가 article 형태인지 확인
    if (obj.length > 0 && obj[0]?.title && obj[0]?.price !== undefined && obj[0]?.href) {
      return obj as DaangnArticle[]
    }
    for (const item of obj) {
      const found = findArticles(item)
      if (found) return found
    }
    return null
  }
  for (const value of Object.values(obj as Record<string, unknown>)) {
    const found = findArticles(value)
    if (found) return found
  }
  return null
}
