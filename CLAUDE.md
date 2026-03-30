# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A home affordability calculator web app ("How Much House"). Users input income, debt, down payment, and other financial details; the server runs a multi-step calculation pipeline and returns scenarios showing what they can afford at various savings rates. Includes an AI chat advisor (OpenAI), Stripe payments, SEO landing pages, and Google Sheets export.

## Commands

- **Dev server:** `npm run dev` (runs Express + Vite on port 3000)
- **Build:** `npm run build` (Vite client build + esbuild server bundle)
- **Production start:** `npm run start`
- **Type check:** `npm run check` (tsc --noEmit)
- **DB push:** `npm run db:push` (drizzle-kit push to PostgreSQL)

## Architecture

### Monorepo layout (single package.json)

- `client/` — React 18 SPA (Vite, wouter router, shadcn/ui components, TailwindCSS)
- `server/` — Express API server
- `db/` — Drizzle ORM schema and connection (PostgreSQL)
- `api/index.ts` — Vercel serverless entry point (wraps the Express app)

### Path aliases

- `@/*` → `client/src/*`
- `@db/*` → `db/*`

### Calculator pipeline (`server/calculatorLogic/`)

The core logic is a 9-step pipeline orchestrated by `Orchestrator.ts`. Each step is in its own file (`Step 1.ts` through `Step 9.ts`):
1. Debt check (debt-to-income ratio)
2. Max mortgage payment (28/36 DIR rule)
3. Loan amount from monthly payment
4. Net income (federal + state tax calculation)
5. Simple monthly budget
6. (used within Step 7)
7. Complex budgets for multiple savings percentages
8. Mortgage stats per savings scenario
9. Transform output for frontend consumption

### API routes (`server/routes.ts`)

- `POST /api/calculate` — runs the calculator pipeline
- `GET /api/current-rate` — fetches 30-year mortgage rate from FRED API
- `POST /api/chat` — SSE-streamed OpenAI chat with calculator context
- `POST /api/create-checkout` — Stripe checkout session
- `POST /api/create-google-sheet` — exports results to Google Sheets

Routes are registered both with and without `/api` prefix for Vercel rewrite compatibility.

### Client routing (wouter)

- `/` — Home (calculator + results)
- `/why` — How It Works page

### SEO routes (`server/seo/`)

Server-rendered HTML pages for income-level affordability (`/affordability-by-income-level`, `/:income/:state`). These bypass the SPA and are handled by Express middleware before the catch-all.

### Deployment

Deployed on Vercel. `vercel.json` rewrites `/api/*` and SEO paths to the serverless function at `api/index.ts`. Static assets are served from `dist/public/`.

### Key environment variables

`DATABASE_URL`, `STRIPE_SECRET_KEY`, `STRIPE_TEST_SECRET_KEY`, `OPENAI_API_KEY`, `AI_CHARGE_MODE`, `SESSION_SECRET`, `VITE_AI_CHARGE_MODE`

### Database schema (`db/schema.ts`)

Three tables: `users`, `ai_chats`, `payments`. Uses separate PostgreSQL schemas for production vs development (`production`/`development`).

### External services

- **FRED API** — mortgage rate data
- **Stripe** — payment processing (test vs prod keys based on NODE_ENV)
- **OpenAI** — AI chat (gpt-4o-mini in prod, gpt-3.5-turbo in dev)
- **Google Sheets API** — export calculator results
- **Mixpanel** — client-side analytics
- **Microsoft Clarity** — session recording
