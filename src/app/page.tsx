import Link from 'next/link'
import SearchBar from '@/components/SearchBar'
import RecentSearches from '@/components/RecentSearches'
import { POPULAR_KEYWORDS } from '@/constants'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-2xl flex flex-col items-center gap-8">
        <header className="text-center">
          <h1 className="text-3xl font-bold mb-2">중고 시세 조회기</h1>
          <p className="text-muted-foreground">
            번개장터·중고나라·당근마켓 시세를 한 번에 확인하세요
          </p>
        </header>

        <SearchBar />

        <div className="w-full">
          <p className="text-sm text-muted-foreground mb-2">인기 검색어</p>
          <div className="flex flex-wrap gap-2">
            {POPULAR_KEYWORDS.map(keyword => (
              <Link
                key={keyword}
                href={`/search?keyword=${encodeURIComponent(keyword)}`}
                className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-indigo-50 rounded-full transition-colors"
              >
                {keyword}
              </Link>
            ))}
          </div>
        </div>

        <RecentSearches />
      </div>
    </main>
  )
}
