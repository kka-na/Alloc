# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Alloc** (short for Allocation) — A minimal budget range tracker web service. Users set budget ranges (min/max) by category, track actual spending, and see savings/overages in real-time. Designed for large-scale budgeting (weddings, renovations, travel, events).

## Tech Stack

- **Frontend:** React + Vite + TailwindCSS
- **Backend:** Node.js + Express
- **Database:** SQLite (via better-sqlite3)
- **Deployment:** SSH hosting + PM2 + Nginx reverse proxy

## Project Structure

```
alloc/
├── client/                  # React + Vite frontend
│   └── src/
│       ├── components/      # BudgetTable, CategoryRow, ItemRow, SummaryBar, ShareModal
│       ├── hooks/           # useBudget.js
│       └── pages/           # BudgetPage, SharePage (read-only)
├── server/                  # Node.js + Express backend
│   ├── db/                  # schema.sql, database.js (better-sqlite3)
│   ├── routes/              # budgets.js, categories.js, items.js, share.js
│   └── middleware/
└── .env                     # PORT, DB_PATH, SECRET_KEY
```

## Build & Run Commands

```bash
# Install dependencies (first time only)
cd server && npm install
cd client && npm install

# Development - run both in separate terminals:
cd server && npm run dev      # Backend at http://localhost:3001
cd client && npm run dev      # Frontend at http://localhost:5173 (proxies /api to :3001)

# Production build
cd client && npm run build    # Creates dist/
```

## Important: Data Storage

- SQLite database is stored at `server/db/alloc.db`
- Database files (*.db) are excluded from git via `.gitignore`
- Data stays local and will not be pushed to the repository

## Data Model

Hierarchical budget structure:
- **Budget** → Contains Categories
- **Category** (supports nesting via parent_id) → Contains Items
- **Item** → Has min/max amounts, paid amount, and auto-calculated fields (avg, remaining, delta)

Auto-calculated fields:
- `avg = (min + max) / 2`
- `remaining = avg - paid`
- `delta = avg - paid` (positive = saved, negative = exceeded)

## API Patterns

REST API at `/api`:
- `POST/GET/PATCH /api/budgets/:id` — Budget CRUD
- `POST/PATCH/DELETE /api/categories/:id` — Category management
- `POST/PATCH/DELETE /api/items/:id` — Item management (primarily paid_amount updates)
- `GET /api/share/:token` — Public read-only access via token

## UI/UX Notes

- **Sunset color palette** (lavender, coral, rose, mauve, cream) — light mode only
- Hierarchical table with collapsible categories
- Inline editing for Paid amounts
- Delta column color-coded: lavender (saved), coral (warning at 80%), rose (exceeded)
- Mobile: horizontal scroll with fixed item name column, modal for editing

## Environment Variables

```env
PORT=3001
DB_PATH=./db/alloc.db
NODE_ENV=development
SECRET_KEY=changeme_random_string
```
