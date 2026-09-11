Status: open
Type: task
Blocked by: none (code-independent, but `supabase db push` needs your manual `supabase login`/`supabase link` first)

# 07 - DB schema migration + RLS

**Description:** Install the Supabase CLI (`brew install supabase/tap/supabase`). Author `supabase/migrations/<timestamp>_init.sql` creating `adventures`, `quests`, `game_states`, `messages` per `notes/original_plan.md`'s schema, with RLS policies scoping access to the owning `auth.uid()` (directly on `adventures.user_id`, via `adventure_id` join for child tables).

**Manual step required from you (not me):** `supabase login` and `supabase link` — interactive auth. I'll write and review the SQL; you run those two commands before `supabase db push` can succeed.

**Acceptance criteria:**
- [ ] All four tables created with the columns specified in `notes/original_plan.md`
- [ ] RLS enabled on every table, in the same migration that creates it
- [ ] Policies verified line-by-line against the ownership rules before applying (this is the one place a mistake is a data leak, not just a bug)
- [ ] `supabase db push` applies cleanly against the linked project

**Verification:**
- [ ] `supabase db push` — exits 0
- [ ] Manual check: attempt a cross-user query in the Supabase SQL editor / via a second test user and confirm RLS blocks it

**Dependencies:** None (SQL authorship doesn't depend on other Foundation tasks; execution is gated on your manual CLI auth)

**Files likely touched:**
- `supabase/migrations/<timestamp>_init.sql`

**Estimated scope:** Small (1 file), High risk (RLS correctness)
