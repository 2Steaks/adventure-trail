Status: resolved
Type: task
Blocked by: 01

# 06 - Supabase server client env-validation tests (TDD)

**Description:** No browser-side Supabase client — the frontend only calls Next.js Route Handlers, which use the existing server client (`src/lib/supabase/client.ts`). Write tests proving that client throws a clear error when required env vars are missing, since every later module's Route Handlers depend on it.

**Deviation from strict TDD:** the env-validation throw already existed in `client.ts` before this task (pre-existing scaffolded code, not written as part of this task). There was no new production code to drive via red-green here — this is a characterization/regression test for existing behavior, not TDD in the strict sense. Noted rather than overclaimed.

**Acceptance criteria:**
- [x] Server client factory throws a clear, specific error when `SUPABASE_URL`/`SUPABASE_PUBLISHABLE_KEY` are missing (tested individually, both branches)
- [x] Server client factory constructs successfully given `.env` values
- [x] Test written (see deviation note above on the TDD framing)

**Verification:**
- [x] `pnpm test` — 9/9 pass (3 new + 6 existing Wizard tests)

**Dependencies:** 01

**Files likely touched:**
- `src/lib/supabase/client.test.ts`

**Estimated scope:** Small

## Answer

Done. Mocked `next/headers`'s `cookies()` since it only works inside a real Next.js request scope; the missing-env-var branch throws before reaching that call anyway, but the "constructs successfully" test needed the mock to avoid an unrelated "outside request scope" error.
