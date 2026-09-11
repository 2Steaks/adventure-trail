Status: resolved
Type: task
Blocked by: none

# 03 - requireUser() helper (TDD)

**Description:** Add `requireUser()` to `src/lib/supabase/require-user.ts` — the real authorization boundary for protected Route Handlers (not this module's own public register/login routes, but `persistence` and every later module's). Calls `supabase.auth.getUser()` and returns `{ user: null }` or `{ user, supabase }`.

**Acceptance criteria:**
- [x] Returns `{ user: null }` when `getUser()` reports no user (mocked)
- [x] Returns `{ user, supabase }` when `getUser()` reports a user (mocked)
- [x] Test written first, observed failing before the helper existed

**Verification:**
- [x] `pnpm test` passes (22/22)

## Answer

Mocked both `next/headers`'s `cookies()` and `@supabase/ssr`'s `createServerClient` (returning a fake `auth.getUser`), same pattern as `client.test.ts` from the foundation module plus one more layer for the auth call itself.

**Dependencies:** None

**Files likely touched:**
- `src/lib/supabase/require-user.ts`
- `src/lib/supabase/require-user.test.ts`

**Estimated scope:** Extra small
