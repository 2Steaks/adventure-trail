Status: resolved
Type: task
Blocked by: 01, 03

# 04 - TanStack Query provider wiring

**Description:** Add `src/lib/query/provider.tsx` wrapping a `QueryClient` in a `QueryClientProvider`, and wrap the app with it in `src/app/layout.tsx`. Enable React Query Devtools in development only.

**Acceptance criteria:**
- [x] `QueryClientProvider` wraps the app
- [x] React Query Devtools render in `pnpm dev` — `@tanstack/react-query-devtools` v5 no-ops itself out of production builds internally, so no manual `NODE_ENV` gating was needed

**Verification:**
- [x] `pnpm build` — exits 0
- [x] Manual check: confirmed via rendered HTML (`tsqd` devtools markers present) during `pnpm dev` — no browser tool available this session for a visual check of the toggle

## Answer

Done. Also discovered Next 16's dev server runs as a persistent background daemon, not tied to the shell job that started it — `kill %1` from earlier tasks didn't actually stop it, leaving two stray `next dev`/`next-server` processes running since task 02. Found and killed both (PIDs 30314, 33335) via `ps aux`.

**Dependencies:** 01 (package installed), 03 (layout exists to wrap)

**Files likely touched:**
- `src/lib/query/provider.tsx`
- `src/app/layout.tsx`

**Estimated scope:** Small
