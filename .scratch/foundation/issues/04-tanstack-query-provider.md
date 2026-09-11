Status: open
Type: task
Blocked by: 01, 03

# 04 - TanStack Query provider wiring

**Description:** Add `src/lib/query/provider.tsx` wrapping a `QueryClient` in a `QueryClientProvider`, and wrap the app with it in `src/app/layout.tsx`. Enable React Query Devtools in development only.

**Acceptance criteria:**
- [ ] `QueryClientProvider` wraps the app
- [ ] React Query Devtools render in `pnpm dev`, absent in production build

**Verification:**
- [ ] `pnpm build` — exits 0
- [ ] Manual check: `pnpm dev`, confirm the Devtools toggle appears

**Dependencies:** 01 (package installed), 03 (layout exists to wrap)

**Files likely touched:**
- `src/lib/query/provider.tsx`
- `src/app/layout.tsx`

**Estimated scope:** Small
