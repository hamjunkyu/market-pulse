import Link from 'next/link'
import SearchBar from '@/components/SearchBar'
import RecentSearches from '@/components/RecentSearches'
import { POPULAR_KEYWORDS } from '@/constants'

export default function HomePage() {
  return (
    <main className="min-h-[calc(100vh-3rem)] bg-gradient-to-b from-indigo-50/60 to-background flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-2xl flex flex-col items-center gap-10">
        <header className="text-center space-y-4">
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight">
            중고 시세
            <span className="text-indigo-600"> 한눈에</span>
          </h1>
          <p className="text-muted-foreground text-lg sm:text-xl">
            번개장터 · 중고나라 · 당근마켓 시세를 한 번에 확인하세요
          </p>
        </header>

        <div className="w-full mt-4">
          <SearchBar />
        </div>

        <div className="w-full space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2.5">인기 검색어</p>
            <div className="flex flex-wrap gap-2.5">
              {POPULAR_KEYWORDS.map(keyword => (
                <Link
                  key={keyword}
                  href={`/search?keyword=${encodeURIComponent(keyword)}`}
                  className="px-4 py-2 text-[15px] border border-border bg-background hover:border-indigo-300 hover:bg-indigo-50 rounded-full transition-all"
                >
                  {keyword}
                </Link>
              ))}
            </div>
          </div>

          <RecentSearches />
        </div>
      </div>
    </main>
  )
}
