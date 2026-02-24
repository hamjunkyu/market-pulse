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
