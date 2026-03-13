# Alloc — Service Build Guideline

> **Alloc** (short for *Allocation*) — A minimal budget range tracker.  
> 카테고리별 예산 범위(min/max)를 설정하고, 실지출을 추적하며, 절감/초과를 실시간으로 파악하는 공유 가능한 웹 서비스.

---

## 1. 서비스 개요

| 항목 | 내용 |
|------|------|
| 서비스명 | **Alloc** |
| 슬로건 | *Set a range. Track the gap.* |
| 타겟 | 웨딩, 인테리어, 여행, 행사 등 대규모 예산을 계획하는 누구나 |
| 핵심 가치 | 엑셀 없이, 공유 가능하게, 한눈에 |

### 서비스명 대안
- `Budgeline` — budget + baseline
- `Rangr` — range tracker, 짧고 모던
- `Spndl` — spend ledger

---

## 2. 핵심 기능 정의

### 2-1. 예산 구조 (계층형)

```
Budget (전체 예산 묶음)
└── Category (대분류, e.g. 웨딩홀)
    └── SubCategory (중분류, e.g. 식대)
        └── Item (항목, e.g. 150명 기준)
            ├── min        (최소 예상 비용)
            ├── max        (최대 예상 비용)
            ├── avg        (자동계산: (min+max)/2)
            ├── paid       (현재까지 지급액)
            ├── remaining  (자동계산: avg - paid 또는 max - paid)
            ├── delta      (자동계산: + 절감 / - 초과)
            └── note       (비고)
```

### 2-2. 자동 계산 필드

| 필드 | 계산식 | 설명 |
|------|--------|------|
| `avg` | `(min + max) / 2` | 평균 예상 비용 |
| `remaining` | `avg - paid` | 아직 낼 금액 (avg 기준) |
| `delta` | `avg - paid` | 양수 = saved, 음수 = exceeded |
| `range_span` | `max - min` | 불확실성 범위 |

### 2-3. 뷰 모드

- **Table View** (기본): 카테고리 접기/펼치기 가능한 계층형 테이블
- **Summary View**: 카테고리별 원형/막대 차트 요약
- **Share View**: 읽기 전용 공개 링크 (토큰 기반)

---

## 3. 기술 스택

### 3-1. 추천 스택 (Simple & Deployable)

```
Frontend:  React + Vite + TailwindCSS
Backend:   Node.js + Express
DB:        SQLite (via better-sqlite3)  ← 별도 DB 서버 불필요
Auth:      없음 (초기) / 간단한 패스워드 보호
Deploy:    SSH 호스팅 + PM2 + Nginx reverse proxy
```

### 3-2. 왜 SQLite?

- SSH 공유 호스팅에서 PostgreSQL 설치 권한 없을 수 있음
- 데이터 규모가 작음 (수십~수백 row)
- 백업이 파일 복사 한 번으로 끝남
- 나중에 PostgreSQL 마이그레이션 쉬움

---

## 4. 데이터 스키마

```sql
-- 예산 묶음 (e.g. "우리 결혼식 2025")
CREATE TABLE budgets (
  id          TEXT PRIMARY KEY,  -- nanoid
  title       TEXT NOT NULL,
  description TEXT,
  currency    TEXT DEFAULT 'KRW',
  share_token TEXT UNIQUE,       -- 공유 링크용 랜덤 토큰
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 카테고리 (대분류 / 중분류 통합, depth로 구분)
CREATE TABLE categories (
  id          TEXT PRIMARY KEY,
  budget_id   TEXT REFERENCES budgets(id) ON DELETE CASCADE,
  parent_id   TEXT REFERENCES categories(id),  -- NULL이면 대분류
  name        TEXT NOT NULL,
  sort_order  INTEGER DEFAULT 0
);

-- 항목
CREATE TABLE items (
  id           TEXT PRIMARY KEY,
  category_id  TEXT REFERENCES categories(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  min_amount   REAL DEFAULT 0,
  max_amount   REAL DEFAULT 0,
  paid_amount  REAL DEFAULT 0,
  note         TEXT,
  sort_order   INTEGER DEFAULT 0,
  updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 5. API 설계

### REST Endpoints

```
POST   /api/budgets                   # 예산 생성
GET    /api/budgets/:id               # 예산 전체 조회 (트리 구조)
PATCH  /api/budgets/:id               # 예산 메타 수정

GET    /api/budgets/:id/share         # 공유 링크 생성/조회
GET    /api/share/:token              # 공개 읽기 전용 조회

POST   /api/categories                # 카테고리 추가
PATCH  /api/categories/:id            # 카테고리 수정
DELETE /api/categories/:id            # 카테고리 삭제

POST   /api/items                     # 항목 추가
PATCH  /api/items/:id                 # 항목 수정 (주로 paid_amount 업데이트)
DELETE /api/items/:id                 # 항목 삭제
```

### Response 형태 (GET /api/budgets/:id)

```json
{
  "id": "abc123",
  "title": "2025 웨딩 예산",
  "currency": "KRW",
  "summary": {
    "total_min": 39740000,
    "total_max": 67000000,
    "total_avg": 53370000,
    "total_paid": 0,
    "total_remaining": 53370000,
    "total_delta": 53370000
  },
  "categories": [
    {
      "id": "cat1",
      "name": "웨딩홀",
      "parent_id": null,
      "summary": { "min": 5000000, "max": 10000000, "avg": 7500000, "paid": 3800000 },
      "children": [
        {
          "id": "cat2",
          "name": "대관료",
          "items": [
            {
              "id": "item1",
              "name": "꽃, 연출 등",
              "min_amount": 5000000,
              "max_amount": 10000000,
              "avg_amount": 7500000,
              "paid_amount": 3800000,
              "remaining": 3700000,
              "delta": 3700000,
              "note": "그래머시 코엑스 아셈볼룸"
            }
          ]
        }
      ]
    }
  ]
}
```

---

## 6. UI/UX 가이드라인

### 6-1. 색상 시스템 (Sunset Palette)

```css
/* === Alloc Sunset Palette === */
--color-lavender:  #b5b0c5;  /* 연보라 — 배경, 비활성 텍스트 */
--color-coral:     #ef9980;  /* 코랄 — 주요 액션, 강조 */
--color-rose:      #cc8e8c;  /* 로즈 — exceeded (초과) */
--color-mauve:     #a08190;  /* 모브 — 보조 텍스트, 아이콘 */
--color-cream:     #f5e0cc;  /* 크림 — 배경, 카드 bg */

/* === 의미별 매핑 === */
--color-saved:     #b5b0c5;  /* lavender — avg보다 적게 씀 (절감) */
--color-warn:      #ef9980;  /* coral   — avg 80% 근접 (주의) */
--color-exceed:    #cc8e8c;  /* rose    — avg 초과 */
--color-neutral:   #a08190;  /* mauve   — 미지급 */
--color-bg:        #f5e0cc;  /* cream   — 페이지/카드 배경 */
--color-text:      #5c4a52;  /* dark mauve (파생) — 본문 텍스트 */
--color-border:    #e8d5c8;  /* cream 어둡게 — 테이블 구분선 */
```

**다크모드 없음** — sunset 팔레트 특성상 라이트 전용으로 유지 권장.

### 6-2. 테이블 컬럼 구성

| # | 컬럼 | 너비 | 설명 |
|---|------|------|------|
| 1 | 항목명 | flex | 들여쓰기로 계층 표현 |
| 2 | Min | 80px | 최소 예산 |
| 3 | Max | 80px | 최대 예산 |
| 4 | Avg | 80px | 자동계산, 회색 표시 |
| 5 | Paid | 100px | 클릭하여 인라인 수정 |
| 6 | Remaining | 100px | Avg - Paid |
| 7 | Δ Delta | 80px | 색상으로 표시 |
| 8 | Note | flex | 비고 |

### 6-3. 인터랙션

- **Paid 셀 클릭** → 인라인 숫자 수정 (즉시 저장)
- **카테고리 행 클릭** → 접기/펼치기 (collapse)
- **행 우클릭 or 더보기** → 수정 / 삭제 / 하위 항목 추가
- **상단 Summary bar** → 전체 Min / Avg / Max / Paid 진행바
- **공유 버튼** → 읽기 전용 링크 복사

### 6-4. 모바일 대응

- 테이블은 가로 스크롤 허용 (고정 항목명 열)
- Summary bar는 항상 상단 고정
- 수정은 모달로 처리 (모바일 인라인 수정 UX 나쁨)

---

## 7. 초기 데이터 Import

노션 표 → CSV export → `/api/budgets/:id/import` 엔드포인트로 업로드

### CSV 형식 예시

```csv
category,subcategory,item,min,max,paid,note
웨딩홀,대관료,꽃 연출 등,5000000,10000000,3800000,그래머시 코엑스 아셈볼룸
웨딩홀,식대,150명 기준,9750000,13500000,0,술 답례 포함
스드메,스튜디오,아이브,1800000,2500000,2316000,
```

---

## 8. 프로젝트 디렉토리 구조

```
alloc/
├── client/                  # React + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── BudgetTable.jsx
│   │   │   ├── CategoryRow.jsx
│   │   │   ├── ItemRow.jsx
│   │   │   ├── SummaryBar.jsx
│   │   │   └── ShareModal.jsx
│   │   ├── hooks/
│   │   │   └── useBudget.js
│   │   ├── pages/
│   │   │   ├── BudgetPage.jsx
│   │   │   └── SharePage.jsx   # 읽기 전용
│   │   └── main.jsx
│   ├── index.html
│   └── vite.config.js
│
├── server/                  # Node.js + Express
│   ├── db/
│   │   ├── schema.sql
│   │   └── database.js      # better-sqlite3 setup
│   ├── routes/
│   │   ├── budgets.js
│   │   ├── categories.js
│   │   ├── items.js
│   │   └── share.js
│   ├── middleware/
│   │   └── errorHandler.js
│   └── index.js
│
├── .env.example
├── .gitignore               # .env, *.db, node_modules
├── package.json             # root (workspaces or 개별 관리)
└── README.md
```

---

## 9. 배포 가이드 (SSH 호스팅)

### 9-1. 서버 세팅

```bash
# 1. 프로젝트 clone
git clone https://github.com/yourname/alloc.git
cd alloc

# 2. 의존성 설치
cd server && npm install
cd ../client && npm install

# 3. 환경변수 설정
cp .env.example .env
nano .env   # PORT, DB_PATH, SECRET_KEY 등 설정

# 4. 클라이언트 빌드
cd client && npm run build   # dist/ 생성

# 5. PM2로 서버 실행
pm2 start server/index.js --name alloc
pm2 save
```

### 9-2. Nginx 설정

```nginx
server {
    listen 80;
    server_name alloc.yourdomain.com;

    # 정적 파일 (빌드된 React)
    location / {
        root /path/to/alloc/client/dist;
        try_files $uri /index.html;
    }

    # API reverse proxy
    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
    }
}
```

### 9-3. 배포 업데이트 플로우

```bash
# 로컬
git push origin main

# 서버
git pull
cd client && npm run build
pm2 restart alloc
```

---

## 10. 개발 우선순위 (Phase)

### Phase 1 — MVP (Claude Code로 시작)
- [ ] DB 스키마 + Express API (CRUD)
- [ ] React 테이블 뷰 (계층형, 접기/펼치기)
- [ ] Paid 인라인 수정
- [ ] 전체 Summary bar (진행율)
- [ ] 노션 데이터 하드코딩 seed

### Phase 2 — 공유 기능
- [ ] 공유 토큰 생성 + 읽기 전용 뷰
- [ ] CSV import/export

### Phase 3 — 다중 예산
- [ ] 예산 생성/삭제 (여러 이벤트 관리)
- [ ] 간단한 패스워드 보호

---

## 11. .env.example

```env
PORT=3001
DB_PATH=./db/alloc.db
NODE_ENV=development
SECRET_KEY=changeme_random_string
```

---

## 12. Claude Code 시작 프롬프트 예시

```
이 가이드라인 기반으로 Alloc 서비스를 만들어줘.
Phase 1 MVP 먼저 구현해:
1. server/ — better-sqlite3 기반 Express API (budgets, categories, items CRUD)
2. client/ — React+Vite+Tailwind 계층형 예산 테이블
3. 초기 seed 데이터는 [노션 데이터]로 하드코딩해줘

스택: Node.js + Express / React + Vite + TailwindCSS / SQLite
```
