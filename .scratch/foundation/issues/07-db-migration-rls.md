Status: resolved
Type: task
Blocked by: none — CLI install/login/link already done earlier in this session

# 07 - DB schema migration + RLS

**Description:** Install the Supabase CLI (`brew install supabase/tap/supabase`). Author `supabase/migrations/<timestamp>_init.sql` creating `adventures`, `quests`, `game_states`, `messages` per `notes/original_plan.md`'s schema, with RLS policies scoping access to the owning `auth.uid()` (directly on `adventures.user_id`, via `adventure_id` join for child tables).

**Bug found and fixed along the way:** `.env`'s `SUPABASE_PUBLISHABLE_KEY` had a stray trailing `1` (typo), which is a different failure mode than "missing" — the client would construct fine but every real request would 401. Caught it while verifying the migration via a REST call. Fixed `.env` directly (not committed — gitignored, as expected).

**Acceptance criteria:**
- [x] All four tables created with the columns specified in `notes/original_plan.md`
- [x] RLS enabled on every table, in the same migration that creates it
- [x] Policies reviewed line-by-line against the ownership rules before applying
- [x] `supabase db push` applies cleanly against the linked project

**Verification:**
- [x] `supabase db push` — exits 0; `supabase migration list` confirms local/remote match
- [x] `GET /rest/v1/adventures` returns `200 []` (table reachable, schema cache picked it up) after fixing the `.env` key
- [ ] **Not done:** an actual cross-user RLS test (two authenticated users, confirm one can't read the other's rows) — needs the `auth` module to exist first to create real users. Flagging as a gap, not silently skipping it.

**Dependencies:** None (SQL authorship doesn't depend on other Foundation tasks; execution is gated on your manual CLI auth)

**Files likely touched:**
- `supabase/migrations/<timestamp>_init.sql`

**Estimated scope:** Small (1 file), High risk (RLS correctness)
