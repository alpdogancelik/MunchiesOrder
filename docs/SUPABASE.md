# Supabase setup

Use Supabase as a managed Postgres for the backend (server connects with node-postgres via Drizzle).

## 1) Create a Supabase project
- Go to Database > Connection string > URI
- Copy the Postgres connection string
- IMPORTANT: append `?sslmode=require` to the URI for external connections

Example
```
postgresql://postgres:YOUR_PASSWORD@db.ABCDEFGHIJK.supabase.co:5432/postgres?sslmode=require
```

## 2) Configure the app
Create a `.env` file at repository root (next to `package.json`) and set (preferred: no single connection string):
```
# Postgres (prefer the Supabase Session Pooler host)
PGHOST=aws-0-<region>.pooler.supabase.com
PGPORT=6543
PGDATABASE=postgres
PGUSER=postgres
PGPASSWORD=YOUR_PASSWORD
PGSSLMODE=require

SESSION_SECRET=choose-a-long-random-string
HOST=127.0.0.1
PORT=5000
VITE_ENABLE_MOCK=false
```

Alternatively, you can still use `DATABASE_URL` for backward compatibility, but the app now works without it.

Notes
- SSL is automatically enabled for Supabase hosts. Keep `PGSSLMODE=require`.
- The session store also uses the same PG config (via conObject), no need for a URL.

## 3) Create tables
Option A: Push schema directly using Drizzle
- Windows PowerShell
```
npm run db:push
```
This reads `shared/schema.ts` and creates the tables in your Supabase database.

Option B: Generate SQL migrations and run in Supabase SQL Editor
```
npm run db:generate
```
This writes SQL files to `./migrations`. You can copy-paste the content into the Supabase SQL Editor if you prefer manual control.

## 4) Seed demo data (optional)
```
npm run seed
```
Creates demo users: owner/student/courier, one restaurant, a default address, a couple of menu items.

## 5) Run the app
```
npm run dev
```
Opens the full-stack dev server on http://127.0.0.1:5000 (the client and API share the same port).

## 6) (Optional) Use supabase-js in the client
If you want the React client to talk directly to Supabase (e.g., for Realtime, Storage, or quick reads), set the Vite env vars and install the SDK:

1. Create `client/.env.local` and add
```
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-or-publishable-key>
```
2. Install the SDK in the project root (where `package.json` is):
```
npm i @supabase/supabase-js@^2
```
3. The client initializer is in `client/src/lib/supabase.ts` and will read the Vite env vars above.

Notes
- Keep `client/.env.local` out of git (see `.gitignore`).
- The app already uses the server API and Postgres (Drizzle) for most data; using supabase-js on the client is optional.
 
## 7) Import sample data via CSV (optional)
You can quickly populate your Supabase tables from CSV samples in the `data/` folder:

- `data/restaurants.sample.csv` → import into `restaurants`
- `data/menu_categories.sample.csv` → import into `menu_categories`
- `data/menu_items.sample.csv` → import into `menu_items`

Steps:
1. Supabase → Table editor → Choose table → Import → Upload CSV → Map the columns.
2. You can omit `id` columns; they will auto-increment.
3. If you import `menu_categories` and `menu_items`, make sure `restaurant_id` and `category_id` values match existing rows.

Tip: If your local dev machine can't resolve the Supabase DB host (DNS), you can still import through the web UI, and the app will see the data once connectivity is fixed.

## Troubleshooting
- ECONNREFUSED / SSL errors: ensure the `DATABASE_URL` ends with `?sslmode=require`.
- Session store errors: the sessions table is managed by `connect-pg-simple`; if needed, run their init SQL, but the default usage works with the URI provided.
- If you want to use Supabase RLS, keep it OFF for tables accessed by this server (or create service role keys and set policies). This project expects full server-side access to tables.
