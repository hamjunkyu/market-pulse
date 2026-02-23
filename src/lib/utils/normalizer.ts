export function normalizeKeyword(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')          // 다중 공백 → 단일 공백
    .replace(/[^\w\s가-힣]/g, '')  // 특수문자 제거 (한글·영문·숫자·공백만 유지)
}
