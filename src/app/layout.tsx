import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: '중고 시세 조회기 | 번개장터·중고나라·당근마켓 통합 시세',
  description:
    '번개장터, 중고나라, 당근마켓의 중고 거래 시세를 한 번에 조회하세요. 평균가, 최저가, 최고가, 시세 트렌드를 확인할 수 있습니다.',
  openGraph: {
    title: '중고 시세 조회기',
    description: '중고 거래 시세를 한 번에 조회하세요',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
