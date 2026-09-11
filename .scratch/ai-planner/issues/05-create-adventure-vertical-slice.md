Status: open
Type: task
Blocked by: 02, 03, 04

# 05 - Real AI-planned Create Adventure (vertical slice)

**Description:** Rewrite `POST /api/adventures` (`src/app/api/adventures/route.ts`): validate the extended `createAdventureSchema` (task 02) → `fetchNearbyPlaces()` (task 03) using the submitted `startingLat`/`startingLng`/`maxDistanceMeters` → if no candidates, return a `502`-class error, no DB writes → `generateAdventurePlan()` (task 04) → if it throws, return a `502`-class error, no DB writes → on success, insert one `adventures` row, one `quests` row **per generated quest** (not just one), and one `game_states` row with `current_quest_id` = the first quest's id.

`src/app/adventures/new/page.tsx`'s submit handler calls `getCurrentPosition()` (the shared helper, from `quest-gameplay`) when the user taps Submit — the click itself is the user gesture, so no separate "get my location" button is needed — then posts the form fields plus the obtained coordinates.

`src/lib/game/hard-coded-quest.ts` is deleted along with the last of its usage.

**Acceptance criteria:**
- [ ] `POST /api/adventures` returns `400` for an invalid body (now including missing/out-of-range `startingLat`/`startingLng`), before calling Overpass or the LLM
- [ ] No candidates found → clean `502`-class error, zero DB rows created
- [ ] `generateAdventurePlan()` failure (after its internal retry) → clean `502`-class error, zero DB rows created
- [ ] Success → one `adventures` row, N `quests` rows (N = however many the plan generated), one `game_states` row with `current_quest_id` = the first quest's id
- [ ] `quest-gameplay`'s existing `/adventures/[id]` page and `POST /api/adventures/:id/arrival` work **unmodified** against the AI-generated quest
- [ ] `HARD_CODED_QUEST` and all remaining references to it are gone
- [ ] `/adventures/new`'s submit button triggers the geolocation prompt on click, not on page mount

**Verification:**
- [ ] `pnpm build`/`lint`/`test` pass
- [ ] Manual, deliberately bounded (real billed API calls): create one real adventure end-to-end as a logged-in test user at a real location; confirm via `supabase db query --linked` that the adventure/quests/game_state rows persisted correctly with real AI-generated content; walk through `quest-gameplay`'s existing arrival check against the first generated quest's real coordinates to confirm it still works unmodified; confirm an unauthenticated/invalid-body/no-candidates case each return their documented error with zero DB writes (these don't need a live LLM call to verify)

**Dependencies:** 02, 03, 04

**Files likely touched:**
- `src/app/api/adventures/route.ts`
- `src/app/adventures/new/page.tsx`
- `src/lib/game/hard-coded-quest.ts` (deleted)

**Estimated scope:** Medium
