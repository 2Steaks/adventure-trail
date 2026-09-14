# Dungeon Master AI

> An AI game master that turns the real world around you into an adventure.

A mobile-first, pixel-art adventure game for parents and kids. A parent creates a short adventure; the app finds real nearby landmarks (via OpenStreetMap), an AI Game Master builds a quest sequence around them, and the player walks to each location in the real world to trigger an AI-narrated encounter.

**Core principle:** the backend owns truth and rules; the AI supplies creativity. The LLM chooses from real, validated data and proposes actions — it never controls game state directly.

**Golden path:**

> Register → Create adventure → Discover a real landmark → Open Google Maps → Walk → Arrive → Wizard encounter → Complete quest → Close/reopen → Resume

## Tech stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS** + **shadcn/ui**, heavily restyled into a pixel-art visual system
- **TanStack Query** for server state/cache (no Zustand, no localStorage — Supabase is the single source of truth)
- **Supabase** — Postgres + Auth + Row Level Security
- **Zod** for schema validation, including as the contract for LLM structured output
- **Vercel AI SDK** (`ai` + `@ai-sdk/anthropic`) with `generateObject` for the two AI calls:
  - **Adventure Planner** — a stronger Claude model, run once per adventure, picks a quest sequence from a candidate list of real landmarks
  - **Encounter Generator** — a faster/cheaper Claude model, run on every arrival, narrates the encounter and proposes game actions
- **OpenStreetMap / Overpass API** for nearby points of interest
- **react-hook-form** + `@hookform/resolvers` for form validation
- **Vitest** + Testing Library for unit tests
- Deployed on **Vercel**, with CI (lint, test, build) on every PR via GitHub Actions

All Supabase and Anthropic calls happen server-side, behind Next.js Route Handlers (`src/app/api/**`) — the browser never talks to Supabase or the LLM directly. RLS is defense-in-depth; the primary access boundary is the authenticated API route.

## How I used AI

This was built as a timeboxed (6–8h) technical challenge, using AI deliberately at two different stages:

**Planning (OpenAI):**
- Explored the idea and talked through trade-offs, keeping scope realistic for the time box
- Worked out a cost-effective deployment setup
- Produced a handoff brief for Claude Code

**Build (Claude Code):**
- Installed a skill set for spec-driven development ([mattpocock/skills](https://github.com/mattpocock/skills))
- Grilled the plan for gaps, then generated the [roadmap](./ROADMAP.md), per-module specs (`SPEC-*.md`), and task breakdowns
- Implemented the app in small, TDD-driven, per-module PRs, including its own code review passes

**What I did myself, directing the AI:**
- Chose the tooling and tech decisions in the roadmap
- Instructed TDD workflow (red → green → refactor) for anything with real logic
- Instructed moving API clients and API keys server-side, out of the browser
- Instructed extracting fonts into a dedicated module
- Instructed moving Supabase queries behind dedicated domain clients
- Refactored Overpass fetching into a proper client, and cleaned up the query formatting
- Reviewed and merged every PR module-by-module rather than accepting one large diff

See [`notes/process.md`](./notes/process.md) for the raw log and [`CAPABILITY_MAP.md`](./CAPABILITY_MAP.md) / [`ROADMAP.md`](./ROADMAP.md) for how the work was broken down and sequenced.

## Setup instructions

**Prerequisites:** Node.js, [pnpm](https://pnpm.io) (`packageManager: pnpm@11.24.0`), a [Supabase](https://supabase.com) project, and an [Anthropic API key](https://console.anthropic.com).

1. **Clone and install dependencies**

   ```bash
   pnpm install
   ```

2. **Configure environment variables**

   Copy `.env.example` to `.env` and fill in the values:

   ```bash
   ANTHROPIC=anthropic_api_key

   SUPABASE_URL=supabase_project_url
   SUPABASE_PUBLISHABLE_KEY=supabase_publishable_key
   ```

3. **Set up the database**

   Migrations live in `supabase/migrations`. With the [Supabase CLI](https://supabase.com/docs/guides/cli) installed and linked to your project:

   ```bash
   supabase login
   supabase link
   supabase db push
   ```

   To regenerate TypeScript types from the linked database after a schema change:

   ```bash
   pnpm db:types
   ```

4. **Run the dev server**

   ```bash
   pnpm dev
   ```

   The app is mobile-first — use your browser's device toolbar, or open the dev URL on a phone on the same network, to get a realistic view. Geolocation-dependent features (nearby landmarks, arrival detection) need a real or simulated GPS position and, on a real device, HTTPS (a Vercel preview URL rather than plain `http://localhost`).

**Other scripts:**

```bash
pnpm lint         # next typegen + eslint + tsc --noEmit
pnpm test         # vitest run
pnpm test:watch   # vitest, watch mode
pnpm build        # production build
```

## Trade-offs

Decisions made to fit a 6–8 hour build, and what each cost:

- **Next.js vs. separate React + Node API** — reduces setup/deployment overhead, at the cost of tighter frontend/backend coupling.
- **Supabase vs. a custom backend/database** — much faster to get auth, Postgres, and RLS working, at the cost of vendor coupling.
- **TanStack Query vs. server components only** — adds client-side complexity, but gives consistent caching/mutations, better suited to an interactive game.
- **No localStorage** — more network/database dependency, but avoids stale/duplicated game state and keeps Supabase as the single source of truth.
- **OSM/Overpass vs. Google Places** — free and open, demonstrating real data integration, but with less predictable coverage and reliability than a paid API.
- **LLM chooses from a candidate POI list vs. inventing locations** — less creative freedom, but eliminates hallucinated landmarks and keeps the AI grounded in real-world data.
- **Backend-owned game rules vs. LLM-controlled state** — less AI autonomy, but a deterministic, testable, and secure game.
- **Structured output (Zod) vs. free-form LLM responses** — a more constrained narrative, but dramatically more reliable to build against.
- **Google Maps deep link vs. building navigation** — less control over the UX, but removes a large amount of unnecessary complexity.
- **Browser GPS on arrival vs. continuous location tracking** — less sophisticated tracking, but sufficient for arrival detection without battery/privacy complexity.
- **Single-player vs. multiplayer** — less technically flashy, but lets the core game loop be substantially more polished.
- **Pixel-art UI vs. generic shadcn styling** — more implementation effort, but far more memorable and demonstrates product/UX thinking.
- **Pre-made wizard art vs. AI-generated imagery** — less dynamic, but faster, cheaper, and visually consistent.
- **Simple relational game state vs. event sourcing** — less auditability/history, but far simpler and appropriate for the scope.
- **Vercel + Supabase vs. self-hosting** — less infrastructure control, but near-zero operational overhead for a challenge project.

## Improvements, given more time

Roughly in priority order:

- **Overpass caching and resilience** — the public Overpass API has no caching layer today and is accepted as a flaky dependency; add a cache and a backoff/retry strategy rather than a bare "try again" error state.
- **Richer POI ranking** — the current candidate-selection logic favors simplicity ("nearest N of any allowed type") over sophistication; a smarter ranking (variety of landmark types, distance/walkability weighting) would produce better adventures.
- **Auth hardening** — email verification and password reset were explicitly cut for scope; both are needed before this could be used by real families.
- **Continuous location tracking during a quest** — arrival is currently detected via a point-in-time GPS check rather than live tracking, which is simpler but less responsive; live tracking with a progress indicator would feel more like a real game.
- **Multiplayer / shared adventures** — the game is single-player by design to keep the core loop polished within the time box; a shared parent+child session is a natural next step.
- **AI-generated or animated wizard art** — the wizard currently uses pre-made static sprites per state; generated or animated art would make the companion feel more alive.
- **Deeper LLM failure handling** — invalid AI output (bad `locationId`, illegal game action) currently gets one bounded retry before falling back to an explicit error state; broader coverage of failure modes and telemetry on how often retries trigger would harden this further.
- **Tailwind class extraction** — moving inline Tailwind class strings into shared style objects was started but left as a work-in-progress cleanup pass (see `notes/process.md`).
- **End-to-end tests** — current tests are unit-level (Haversine, arrival threshold, Zod schemas, action validation); a Playwright pass over the full register → adventure → arrival → encounter → resume loop would catch regressions unit tests can't.
- **Event sourcing for game state** — traded away for simplicity; would be worth revisiting if audit history or replay of a player's adventure becomes a real requirement.
