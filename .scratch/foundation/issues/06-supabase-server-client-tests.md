Status: open
Type: task
Blocked by: 01

# 06 - Supabase server client env-validation tests (TDD)

**Description:** No browser-side Supabase client — the frontend only calls Next.js Route Handlers, which use the existing server client (`src/lib/supabase/client.ts`). Write tests proving that client throws a clear error when required env vars are missing, since every later module's Route Handlers depend on it.

**Acceptance criteria:**
- [ ] Server client factory throws a clear, specific error when `SUPABASE_URL`/`SUPABASE_PUBLISHABLE_KEY` are missing
- [ ] Server client factory constructs successfully given `.env` values
- [ ] Test was written and observed failing before any implementation change

**Verification:**
- [ ] `pnpm test` — new Supabase client tests pass

**Dependencies:** 01

**Files likely touched:**
- `src/lib/supabase/client.test.ts`

**Estimated scope:** Small
