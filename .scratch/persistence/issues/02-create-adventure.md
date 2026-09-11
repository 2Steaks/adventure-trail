Status: open
Type: task
Blocked by: 01

# 02 - Create Adventure (route handler + hook + page)

**Description:** `POST /api/adventures` (`src/app/api/adventures/route.ts`) calls `requireUser()`, validates the body with `createAdventureSchema`, then inserts one `adventures` row (`starting_lat`/`starting_lng` = `HARD_CODED_QUEST`'s coordinates), one `quests` row (`HARD_CODED_QUEST`'s content, `adventure_id` = the new adventure), and one `game_states` row (`current_quest_id` = that quest's id) — sequential inserts, no transaction (flagged gap, see `SPEC-persistence.md`'s Open Questions). `useCreateAdventure()` mutation added to `src/lib/adventures/hooks.ts`. `src/app/adventures/new/page.tsx` is the Create Adventure form (theme, age range, duration, max distance) via `react-hook-form` + `zodResolver(createAdventureSchema)`. On success, redirect to the new adventure's detail page (`/adventures/[id]`, built in task 04 — link the id now even though the destination page doesn't exist until then).

**Acceptance criteria:**
- [ ] `POST /api/adventures` returns `401` unauthenticated, before touching Supabase
- [ ] `POST /api/adventures` returns `400` for an invalid body (missing theme, `ageMax < ageMin`, or an out-of-set `durationMinutes`/`maxDistanceMeters`), before touching Supabase
- [ ] Valid body creates the adventure + quest + game_state rows described above, scoped to the authenticated user
- [ ] `/adventures/new` form submits via `useCreateAdventure()`, redirects to `/adventures/[new id]` on success

**Verification:**
- [ ] `pnpm build`/`lint` pass
- [ ] Manual: create an adventure as a real logged-in user against the live Supabase project; confirm all three rows exist (Supabase dashboard or a one-off query) and are owned by that user

**Dependencies:** 01

**Files likely touched:**
- `src/app/api/adventures/route.ts`
- `src/app/adventures/new/page.tsx`
- `src/lib/adventures/hooks.ts`

**Estimated scope:** Medium (new route + page + hook, first vertical slice)
