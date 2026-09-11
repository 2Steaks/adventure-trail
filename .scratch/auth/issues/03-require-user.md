Status: open
Type: task
Blocked by: none

# 03 - requireUser() helper (TDD)

**Description:** Add `requireUser()` to `src/lib/supabase/require-user.ts` — the real authorization boundary for protected Route Handlers (not this module's own public register/login routes, but `persistence` and every later module's). Calls `supabase.auth.getUser()` and returns `{ user: null }` or `{ user, supabase }`.

**Acceptance criteria:**
- [ ] Returns `{ user: null }` when `getUser()` reports no user (mocked)
- [ ] Returns `{ user, supabase }` when `getUser()` reports a user (mocked)
- [ ] Test written first, observed failing before the helper existed

**Verification:**
- [ ] `pnpm test` passes

**Dependencies:** None

**Files likely touched:**
- `src/lib/supabase/require-user.ts`
- `src/lib/supabase/require-user.test.ts`

**Estimated scope:** Extra small
