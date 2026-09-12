Status: resolved
Type: task
Blocked by: 01, 02

# 03 - Arrival vertical slice (route handler + hook + page extension)

**Description:** `POST /api/adventures/:id/arrival` (`src/app/api/adventures/[id]/arrival/route.ts`) calls `requireUser()`, validates the body with `arrivalCheckSchema`, loads the adventure's quest scoped to the caller (`404` if not found/owned, same pattern as `persistence`'s detail route), and delegates to `checkArrival()`. On `arrived: true` (and the quest isn't already `completed`), updates `quests.status` and `adventures.status` to `'completed'`. Repeat calls after completion are idempotent — no error, no duplicate write.

`useCheckArrival(adventureId)` (`src/lib/game/hooks.ts`) wraps `getCurrentPosition()` (task 01) + a `POST` to the route via `fetchJson()`. `src/app/adventures/[id]/page.tsx` is extended (not replaced) with: a "Check My Distance" button (geolocation prompt fires only on tap), a distance readout after a successful check, a Google Maps deep-link (`https://www.google.com/maps/dir/?api=1&destination=<lat>,<lng>`) to the quest's coordinates, and an arrival celebration state once `arrived: true`.

**Acceptance criteria:**
- [x] `POST /api/adventures/:id/arrival` rejects unauthenticated requests (`307` via the Proxy, same nuance as every `/api/adventures/**` route)
- [x] Returns `404` for another user's adventure id
- [x] Coordinates far from the quest return `{ arrived: false }` with a real `distanceMeters`
- [x] Coordinates within `quest.radiusMeters` return `{ arrived: true }` and persist both status updates
- [x] Calling again after completion doesn't error or re-trigger the write
- [x] `/adventures/[id]` renders the button, distance readout, Maps link, and arrival state as described above

**Verification:**
- [x] `pnpm build`/`lint`/`test` pass (49/49)
- [x] Manual: registered a real test account, created an adventure; called the route with coordinates far from Trafalgar Square (`arrived: false`, real `distanceMeters`) then with the exact landmark coordinates (`arrived: true`); confirmed via `supabase db query --linked` that both `quests.status` and `adventures.status` flipped to `completed`; called again with the same coordinates and got the same `200` response, no error, no duplicate write
- [x] Confirmed an unauthenticated `curl` gets `307` (Proxy), and a second test user's `curl` against the first user's adventure id gets `404`. Test adventure deleted afterward.

**Three real issues found by code review after this task first shipped, all fixed:**
1. The quest lookup used `.maybeSingle()` filtered only by `adventure_id`, assuming exactly one quest row — already contradicted by `AdventureSummary.questsTotal`/`questsCompleted` in `serialize.ts`, which model multiple quests per adventure. Masked today only because adventure creation currently inserts exactly one. Fixed by resolving the *current* quest via `game_states.current_quest_id` instead — the actual source of truth for "which quest is active" once `ai-planner` adds more. Combined into the adventure-ownership query as an embedded `game_states(current_quest_id)` select (one round trip instead of two), which also addressed a separate finding about avoiding redundant sequential queries.
2. The two completion writes (`quests.status`, `adventures.status`) were both gated behind a single `quest.status !== "completed"` check. If the quest write succeeded but the adventure write failed (transient DB error), any retry would see the quest as already completed and skip *both* writes — permanently stranding the adventure in a half-completed state. Fixed by gating each write on its own current status independently, so a partial failure is recoverable on retry.
3. `useCheckArrival`'s mutation never invalidated the `useAdventure(id)`/`useAdventures()` query cache, so the quest's status caption stayed stale ("pending") after a successful arrival even though the arrival banner (driven by the mutation's own response) correctly showed "You've Arrived!" — a visible inconsistency on the same screen. Fixed with `queryClient.invalidateQueries({ queryKey: ["adventures"] })` on a successful `arrived: true` response (matches both query keys via TanStack Query's prefix matching).

One finding not acted on: the adventure-ownership-lookup pattern (`select` + `maybeSingle` + `404` branch) is similar in both this route and the existing `GET` detail route. Left as-is — this codebase deliberately keeps ownership checks explicit per route rather than sharing them (the `auth` module's stated rule: "every protected Route Handler checks the result itself"), and the two routes now select different columns for different purposes, so a shared helper would need its own genericization to fit both.

Also found and fixed while addressing the above: the embedded `game_states(current_quest_id)` select returns a **single object** at runtime (confirmed live) — `game_states.adventure_id` is that table's primary key, a true 1:1 relationship — but supabase-js's untyped-client type inference (no generated DB types in this project) mistypes it as an array, which silently broke the first attempt at this fix (`?.[0]?.current_quest_id` on an actual object returns `undefined`, not a type error). Caught by testing live against the real database rather than trusting the type checker alone.

**Dependencies:** 01, 02

**Files likely touched:**
- `src/app/api/adventures/[id]/arrival/route.ts`
- `src/app/adventures/[id]/page.tsx`
- `src/lib/game/hooks.ts`

**Estimated scope:** Medium

## Comments

**2026-09-12, superseded by `ai-encounter`:** this task's original acceptance criteria ("on `arrived: true`, updates `quests.status` and `adventures.status` to `'completed'`") was correct for the single-quest-per-adventure model in place when this shipped, but became a real bug once `ai-planner`/`ai-encounter` introduced multi-quest adventures. Found live: creating a 3-quest adventure and confirming arrival at quest 1 immediately flagged the *entire adventure* `completed` — before the wizard encounter ever ran and with two quests still `pending` — because this route unconditionally completed "the current quest" and "the adventure" on mere proximity. Per `SPEC-ai-encounter.md` ("Completing a quest's objective advances the adventure to its next quest; completing the last quest completes the adventure" — decided by `generateEncounter()`'s validated `COMPLETE_OBJECTIVE` action, never by arrival), this route should only ever report `{ distanceMeters, arrived }`. Fixed by deleting both completion writes from `arrival/route.ts`, leaving it a pure proximity check; `encounter/route.ts` (ai-encounter task 05) is now the sole writer of quest/adventure completion. Re-verified live end-to-end afterward: a fresh 3-quest adventure completed quest-by-quest correctly, with `adventures.status` staying `active` until the actual final quest's `COMPLETE_OBJECTIVE` landed.
