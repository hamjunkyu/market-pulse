// 매입/구매글 등 판매글이 아닌 항목을 걸러내는 노이즈 키워드
const NOISE_PATTERNS = [
  /매입/,
  /삽니다/,
  /구합니다/,
  /구매합니다/,
  /교환/,
  /수리/,
  /부품만/,
  /고장/,
  /파손/,
]

export function isNoiseListing(title: string): boolean {
  return NOISE_PATTERNS.some(pattern => pattern.test(title))
}

// 제목이 검색 키워드와 관련 있는지 확인
// "에어팟 프로" 검색 시 "아이패드 프로/에어팟맥스" 같은 무관한 결과 제거
export function isRelevantTitle(title: string, keyword: string): boolean {
  const normalizedTitle = title.replace(/\s+/g, '').toLowerCase()
  const normalizedKeyword = keyword.replace(/\s+/g, '').toLowerCase()
  return normalizedTitle.includes(normalizedKeyword)
}
