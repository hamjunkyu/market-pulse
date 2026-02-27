-- 확장
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 검색어 테이블
CREATE TABLE IF NOT EXISTS search_queries (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  keyword       VARCHAR(200) NOT NULL UNIQUE,
  last_scraped_at TIMESTAMPTZ,
  scrape_count  INTEGER     NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 거래 목록 테이블
CREATE TABLE IF NOT EXISTS listings (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform      VARCHAR(20) NOT NULL CHECK (platform IN ('bunjang', 'joonggonara', 'daangn')),
  keyword       VARCHAR(200) NOT NULL,
  title         VARCHAR(500) NOT NULL,
  price         INTEGER     NOT NULL CHECK (price > 0),
  condition     VARCHAR(20) NOT NULL DEFAULT 'unknown'
                  CHECK (condition IN ('new', 'like_new', 'used', 'unknown')),
  status        VARCHAR(20) NOT NULL DEFAULT 'selling'
                  CHECK (status IN ('selling', 'reserved', 'sold', 'deleted')),
  sold_at       TIMESTAMPTZ,
  url           VARCHAR(1000) NOT NULL,
  thumbnail_url VARCHAR(1000),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(platform, url)
);

-- 인덱스 (검색 성능)
CREATE INDEX IF NOT EXISTS idx_listings_keyword     ON listings(keyword);
CREATE INDEX IF NOT EXISTS idx_listings_keyword_date ON listings(keyword, sold_at DESC);
CREATE INDEX IF NOT EXISTS idx_listings_platform    ON listings(platform);
CREATE INDEX IF NOT EXISTS idx_listings_sold_at     ON listings(sold_at DESC);
CREATE INDEX IF NOT EXISTS idx_listings_status      ON listings(status);

-- 수집 메타데이터 upsert 함수 (신규: count=1, 기존: count+1)
CREATE OR REPLACE FUNCTION upsert_scrape_meta(kw TEXT)
RETURNS VOID AS $$
BEGIN
  INSERT INTO search_queries (keyword, last_scraped_at, scrape_count)
  VALUES (kw, NOW(), 1)
  ON CONFLICT (keyword) DO UPDATE
  SET last_scraped_at = NOW(),
      scrape_count = search_queries.scrape_count + 1;
END;
$$ LANGUAGE plpgsql;
