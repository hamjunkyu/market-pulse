import type { Listing } from '@/types'
import { calcStats } from './priceStats'

export interface ProductGroup {
  id: string
  label: string
  listings: Listing[]
  avg: number
  count: number
}

// 판매글에서 흔히 나오는 불용어 (제품 구분에 무의미한 단어)
const STOP_WORDS = new Set([
  // 판매 관련
  '판매', '팝니다', '팝', '판매합니다', '급처', '급매', '떨이',
  // 상태 관련
  '미개봉', '미사용', '풀박스', '풀박', 'S급', 'A급', 'B급', '정품',
  '새상품', '중고', '거의새것', '리퍼', '개봉만',
  // 배송/거래 관련
  '택포', '직거래', '택배', '무료배송', '서울', '경기',
  // 일반 수식어
  '최저가', '최신', '정가', '할인', '특가', '네고', '가능',
])

// 1글자 또는 숫자만인 토큰 제거
function isValidToken(token: string): boolean {
  if (token.length <= 1) return false
  if (/^\d+$/.test(token)) return false
  if (STOP_WORDS.has(token)) return false
  return true
}

// 검색 키워드를 제거하고 유의미한 토큰 추출
function extractTokens(title: string, keyword: string): string[] {
  // 검색 키워드의 각 단어를 제거
  let cleaned = title.toLowerCase()
  for (const word of keyword.toLowerCase().split(/\s+/)) {
    cleaned = cleaned.replace(new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), '')
  }

  // 토큰화: 공백, 특수문자 기준 분리
  return cleaned
    .split(/[\s/·,()[\]{}|~!@#$%^&*_+=<>?:;"']+/)
    .map(t => t.trim())
    .filter(isValidToken)
}

// 토큰 빈도 계산 → 유의미한 구별 키워드 추출
function findDistinguishingTokens(
  listings: Listing[],
  keyword: string,
  minRatio: number = 0.08, // 최소 8% 이상 등장
): Map<string, Set<number>> {
  // token → 해당 토큰을 포함하는 listing index들
  const tokenToIndices = new Map<string, Set<number>>()

  for (let i = 0; i < listings.length; i++) {
    const tokens = extractTokens(listings[i].title, keyword)
    const seen = new Set<string>()
    for (const token of tokens) {
      if (seen.has(token)) continue
      seen.add(token)
      if (!tokenToIndices.has(token)) tokenToIndices.set(token, new Set())
      tokenToIndices.get(token)!.add(i)
    }
  }

  const minCount = Math.max(3, Math.floor(listings.length * minRatio))

  // 빈도 기준 필터 + 정렬
  const candidates = [...tokenToIndices.entries()]
    .filter(([, indices]) => indices.size >= minCount)
    .sort((a, b) => b[1].size - a[1].size)

  return new Map(candidates)
}

// 그룹 간 가격 차이가 유의미한지 검증
function isPriceDifferent(groupPrices: number[], allPrices: number[]): boolean {
  if (groupPrices.length < 3 || allPrices.length < 5) return false
  const groupStats = calcStats(groupPrices)
  const allStats = calcStats(allPrices)
  if (allStats.avg === 0) return false

  // 그룹 평균이 전체 평균과 20% 이상 차이나면 유의미
  const diff = Math.abs(groupStats.avg - allStats.avg) / allStats.avg
  return diff >= 0.2
}

/**
 * 메인 클러스터링 함수
 * listings를 keyword 기반으로 제품 그룹으로 분류
 */
export function clusterListings(listings: Listing[], keyword: string): ProductGroup[] {
  if (listings.length < 10) return [] // 데이터 부족 시 그룹화 불필요

  const allPrices = listings.map(l => l.price)
  const tokenMap = findDistinguishingTokens(listings, keyword)

  // 그리디 방식: 빈도 높은 토큰부터 그룹 할당
  const assigned = new Set<number>() // 이미 그룹에 배정된 listing index
  const groups: ProductGroup[] = []

  for (const [token, indices] of tokenMap) {
    // 이미 배정된 항목 제외한 실제 미배정 항목 수
    const unassignedIndices = [...indices].filter(i => !assigned.has(i))
    if (unassignedIndices.length < 3) continue

    const groupListings = unassignedIndices.map(i => listings[i])
    const groupPrices = groupListings.map(l => l.price)

    // 가격이 전체와 유의미하게 다른 그룹만 채택
    if (!isPriceDifferent(groupPrices, allPrices)) continue

    const stats = calcStats(groupPrices)
    groups.push({
      id: token,
      label: token,
      listings: groupListings,
      avg: stats.avg,
      count: groupListings.length,
    })

    for (const i of unassignedIndices) assigned.add(i)

    // 최대 4개 그룹
    if (groups.length >= 4) break
  }

  // 그룹이 1개 이하면 의미 없음
  if (groups.length <= 1) return []

  // 미배정 항목이 있으면 "기타" 그룹 추가
  const unassignedListings = listings.filter((_, i) => !assigned.has(i))
  if (unassignedListings.length > 0) {
    const stats = calcStats(unassignedListings.map(l => l.price))
    groups.push({
      id: '__other__',
      label: '기타',
      listings: unassignedListings,
      avg: stats.avg,
      count: unassignedListings.length,
    })
  }

  // 평균가 순 정렬 (기타는 항상 마지막)
  groups.sort((a, b) => {
    if (a.id === '__other__') return 1
    if (b.id === '__other__') return -1
    return a.avg - b.avg
  })

  return groups
}
