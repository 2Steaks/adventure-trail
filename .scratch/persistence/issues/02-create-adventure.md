Status: resolved
Type: task
Blocked by: 01

# 02 - Create Adventure (route handler + hook + page)

**Description:** `POST /api/adventures` (`src/app/api/adventures/route.ts`) calls `requireUser()`, validates the body with `createAdventureSchema`, then inserts one `adventures` row (`starting_lat`/`starting_lng` = `HARD_CODED_QUEST`'s coordinates), one `quests` row (`HARD_CODED_QUEST`'s content, `adventure_id` = the new adventure), and one `game_states` row (`current_quest_id` = that quest's id) — sequential inserts, no transaction (flagged gap, see `SPEC-persistence.md`'s Open Questions). `useCreateAdventure()` mutation added to `src/lib/adventures/hooks.ts`. `src/app/adventures/new/page.tsx` is the Create Adventure form (theme, age range, duration, max distance) via `react-hook-form` + `zodResolver(createAdventureSchema)`. On success, redirect to the new adventure's detail page (`/adventures/[id]`, built in task 04 — link the id now even though the destination page doesn't exist until then).

**Note on the `401` criterion:** `/api/adventures` isn't in the Proxy's public-path allowlist (correctly — it's protected data), so a fully unauthenticated request (no session cookie at all) gets a `307 → /login` from the Proxy before it ever reaches the route handler; `requireUser()`'s own `401` is defense-in-depth for when Proxy coverage doesn't apply (e.g. a stale/invalid session), same rationale as `SPEC-auth.md`'s "never rely on the Proxy redirect alone." Verified below.

**Acceptance criteria:**
- [x] `POST /api/adventures` rejects an unauthenticated request before touching Supabase (`307` via the Proxy for a cookie-less request; `requireUser()`'s `401` is the fallback boundary — see note above)
- [x] `POST /api/adventures` returns `400` for an invalid body (`ageMax < ageMin` verified), before touching Supabase
- [x] Valid body creates the adventure + quest + game_state rows described above, scoped to the authenticated user
- [x] `/adventures/new` form submits via `useCreateAdventure()`, redirects to `/adventures/[new id]` on success (route exists from task 04's dependency; page itself lands in task 04)

**Verification:**
- [x] `pnpm build`/`lint` pass
- [x] Manual: registered a fresh throwaway test account (`dm-ai-test-persistence-*@gmail.com`) against local dev hitting the live Supabase project; created an adventure; confirmed via `supabase db query --linked` that the `quests` row (`landmark_name`, `radius_meters`, `status: pending`) and `game_states` row (`current_quest_id` matching the quest's id) were both created and correctly linked. Test adventure deleted afterward (cascade removed the quest/game_state rows too); the throwaway auth user account was left lingering, same as `auth`'s test accounts — delete from the Supabase dashboard if unwanted.

**Dependencies:** 01

**Files likely touched:**
- `src/app/api/adventures/route.ts`
- `src/app/adventures/new/page.tsx`
- `src/lib/adventures/hooks.ts`

**Estimated scope:** Medium (new route + page + hook, first vertical slice)
