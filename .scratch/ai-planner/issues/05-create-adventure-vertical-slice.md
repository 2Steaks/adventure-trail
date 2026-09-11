Status: resolved
Type: task
Blocked by: 02, 03, 04

# 05 - Real AI-planned Create Adventure (vertical slice)

**Description:** Rewrite `POST /api/adventures` (`src/app/api/adventures/route.ts`): validate the extended `createAdventureSchema` (task 02) → `fetchNearbyPlaces()` (task 03) using the submitted `startingLat`/`startingLng`/`maxDistanceMeters` → if no candidates, return a `502`-class error, no DB writes → `generateAdventurePlan()` (task 04) → if it throws, return a `502`-class error, no DB writes → on success, insert one `adventures` row, one `quests` row **per generated quest** (not just one), and one `game_states` row with `current_quest_id` = the first quest's id.

`src/app/adventures/new/page.tsx`'s submit handler calls `getCurrentPosition()` (the shared helper, from `quest-gameplay`) when the user taps Submit — the click itself is the user gesture, so no separate "get my location" button is needed — then posts the form fields plus the obtained coordinates.

`src/lib/game/hard-coded-quest.ts` is deleted along with the last of its usage.

**Live verification deferred, same as task 04, by explicit request:** the happy-path success criteria below (Success → DB rows persisted with real AI content; `quest-gameplay` working against an AI-generated quest) have **not** been exercised — they depend on `generateAdventurePlan()` actually completing, which is blocked on the Anthropic account usage limit from task 04 (resets 2026-10-01). Everything that doesn't require a live model response has been verified live.

**Acceptance criteria:**
- [x] `POST /api/adventures` returns `400` for an invalid body (now including missing/out-of-range `startingLat`/`startingLng`), before calling Overpass or the LLM
- [x] No candidates found → clean `502`-class error, zero DB rows created
- [ ] `generateAdventurePlan()` failure (after its internal retry) → clean `502`-class error, zero DB rows created — **not yet verified live** (would need a live call that then fails, which isn't the same as never calling it — deferred along with the happy path)
- [ ] Success → one `adventures` row, N `quests` rows (N = however many the plan generated), one `game_states` row with `current_quest_id` = the first quest's id — **deferred, not yet verified live**
- [ ] `quest-gameplay`'s existing `/adventures/[id]` page and `POST /api/adventures/:id/arrival` work **unmodified** against the AI-generated quest — **deferred, not yet verified live**
- [x] `HARD_CODED_QUEST` and all remaining references to it are gone
- [x] `/adventures/new`'s submit button triggers the geolocation prompt on click, not on page mount

**Verification:**
- [x] `pnpm build`/`lint`/`test` pass (57/57)
- [x] Manual (no live LLM call needed): registered a real test account; unauthenticated request → `307` (Proxy); missing `startingLat`/`startingLng` → `400` before any Overpass/LLM call; ocean coordinates (30, -40, no nearby landmarks) → clean `502`, confirmed via `GET /api/adventures` that zero rows were created; `GET /api/places/nearby` (the shared `fetchNearbyPlaces()` extraction) still returns real Trafalgar Square landmarks unchanged; `/adventures/new` page shell renders
- [ ] Manual, deliberately bounded (real billed API calls): full happy-path create → DB persistence → `quest-gameplay` arrival check against a real AI-generated quest — **deferred to a later stage**, not yet done

**Dependencies:** 02, 03, 04

**Files likely touched:**
- `src/app/api/adventures/route.ts`
- `src/app/adventures/new/page.tsx`
- `src/lib/game/hard-coded-quest.ts` (deleted)

**Estimated scope:** Medium
