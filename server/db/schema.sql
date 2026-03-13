-- 예산 묶음 (e.g. "우리 결혼식 2025")
CREATE TABLE IF NOT EXISTS budgets (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  description TEXT,
  currency    TEXT DEFAULT 'KRW',
  share_token TEXT UNIQUE,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 카테고리 (대분류 / 중분류 통합, depth로 구분)
CREATE TABLE IF NOT EXISTS categories (
  id          TEXT PRIMARY KEY,
  budget_id   TEXT REFERENCES budgets(id) ON DELETE CASCADE,
  parent_id   TEXT REFERENCES categories(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  sort_order  INTEGER DEFAULT 0
);

-- 항목
CREATE TABLE IF NOT EXISTS items (
  id               TEXT PRIMARY KEY,
  category_id      TEXT REFERENCES categories(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  min_amount       REAL DEFAULT 0,
  max_amount       REAL DEFAULT 0,
  confirmed_amount REAL DEFAULT 0,
  paid_amount      REAL DEFAULT 0,
  is_per_person    INTEGER DEFAULT 0,
  person_count     INTEGER DEFAULT 1,
  note             TEXT,
  sort_order       INTEGER DEFAULT 0,
  updated_at       DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_categories_budget ON categories(budget_id);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_items_category ON items(category_id);
