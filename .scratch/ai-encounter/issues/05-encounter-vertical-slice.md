Status: resolved
Type: task
Blocked by: 01, 02, 03, 04

# 05 - Real AI-narrated encounter (vertical slice)

**Description:** Add `POST /api/adventures/:id/encounter` (`src/app/api/adventures/[id]/encounter/route.ts`), protected via `requireUser()`. Loads the adventure (404/ownership check, same pattern as every other adventure route), the current quest via `game_states.current_quest_id` (400/409-class error if there is no current quest — the adventure is already fully completed), the adventure's completed quests + `game_states.inventory`, and the last 10 `messages` rows — then calls `generateEncounter()` (task 04). On success:

- For each `COMPLETE_OBJECTIVE` action: set that quest's `status = "completed"`, find the next `pending` quest by `position` for `game_states.current_quest_id` (`null` if none left), and if there was no next quest, set `adventures.status = "completed"` too.
- For each `ADD_ITEM` action: read-modify-write `game_states.inventory`, appending the item (per `SPEC-ai-encounter.md`'s Resolved Decisions — plain application code, no Postgres function).
- Insert one `messages` row (`role: "assistant"`, `content: output.message`).

On `EncounterError` (retry exhausted), return a `502`-class error with **zero writes** — nothing above happens until `generateEncounter()` has already returned a validated result. Idempotency: calling this again after a quest is already completed should not error or re-apply the same completion (mirrors `quest-gameplay`'s arrival-route idempotency).

Add `useEncounter(adventureId)` (`src/lib/game/hooks.ts`, `useMutation` + `fetchJson`, invalidates the `["adventures", id]` query on success so the page re-fetches the new `gameState`/`quests`). Add `EncounterPanel.tsx` (`src/components/game/encounter/`): renders `output.message` and tappable choice buttons (each tap calls `useSendChoice()` from task 03). Wire both into `src/app/adventures/[id]/page.tsx`: derive the current quest from `gameState.currentQuestId` (not `quests[0]`, fixed in task 02), render `Wizard` through the six mapped states from `SPEC-ai-encounter.md`'s Wizard State Mapping table, and show a "Talk to the Wizard" button once arrival is confirmed (`checkArrival.data?.arrived`) that calls `useEncounter()`.

**Acceptance criteria:**
- [x] `POST /api/adventures/:id/encounter` rejects unauthenticated requests (`307` via the Proxy) — confirmed live
- [x] Returns `404` for another user's adventure id — **verified live 2026-09-12**
- [x] Returns a `409`-class error with no LLM call when the adventure has no current quest (already fully completed) — **verified live 2026-09-12**, calling `.../encounter` again on a fully-completed adventure returned `409` with no further LLM cost
- [x] A validated `COMPLETE_OBJECTIVE` completes the quest, advances `game_states.current_quest_id` to the next quest by position, and completes the adventure when it was the last quest — **verified live 2026-09-12**, see the full-flow note below
- [x] A validated `ADD_ITEM` appends to `game_states.inventory` without clobbering existing items — implemented via a fresh read-modify-write per action; not exercised live (no live encounter happened to produce an `ADD_ITEM` action)
- [x] An `EncounterError` (retry exhausted) returns `502` with zero DB writes — implemented: all writes happen strictly after `generateEncounter()` returns successfully; not exercised live (no live call has failed validation yet)
- [x] Calling the route again after a quest is already completed reads the freshly-advanced `current_quest_id` each time, so it can't re-complete the same objective — it generates a new encounter for the new current quest instead (see code comment); this is the achievable idempotency given the module's flavor-only choice/no-dedup-key design, not literal same-response-twice idempotency
- [x] `/adventures/[id]` derives the current quest from `gameState`, renders the Wizard through all six mapped states, and shows `EncounterPanel` with tappable choices once an encounter has run
- [x] `HARD_CODED_QUEST`-era assumptions (single-quest-per-adventure UI) are fully gone from the detail page — `quests[0]` is gone, replaced by `gameState.currentQuestId` lookup

**Verification:**
- [x] `pnpm build`/`lint`/`test` pass (73/73 tests; production build compiles and registers all new routes)
- [x] Manual, no live LLM call needed: unauthenticated → `307`, confirmed live
- [x] **2026-09-12, unblocked and verified** (the account usage limit lifted before the stated 2026-10-01 reset). Full session: registered two test users against local dev; user 1 created two real adventures via `POST /api/adventures` (2 and 3 real quests, Trafalgar Square) via a live `claude-opus-5` call; ran the complete arrive → `POST .../encounter` (live `claude-haiku-4-5`) → objective completed → quest advanced loop through every quest of the 3-quest adventure, ending with the adventure correctly marked `completed` only once the *actual* final quest resolved; confirmed `409` on a further `.../encounter` call once fully completed; confirmed user 2's `curl` against user 1's adventures got `404` on `GET .../[id]`, `.../encounter`, and `.../choice`; confirmed `.../choice` inserts a real `messages` row. All state checked via direct PostgREST reads (bypassing the Next.js layer) to rule out any caching artifact. Both test adventures deleted afterward via the REST API.
- [x] Every `SPEC-ai-encounter.md` Success Criteria box checked — see above; `ADD_ITEM` and the `EncounterError`/`502` path remain implemented-but-live-unexercised since no live response happened to trigger them

**Real bug found and fixed during this live pass (2026-09-12):**
`quest-gameplay`'s `arrival/route.ts` — predating this module — unconditionally marked *both* the current quest and the **entire adventure** `"completed"` the moment the player was merely within range of a landmark. That was correct back when every adventure had exactly one quest, but nobody updated it when `ai-planner`/`ai-encounter` introduced multi-quest adventures where `generateEncounter()`'s `COMPLETE_OBJECTIVE` action is supposed to be the sole authority on objective/adventure completion (per `SPEC-ai-encounter.md`). Caught live: a 3-quest adventure got flagged `adventures.status = "completed"` the instant the player arrived at quest 1's landmark — before the wizard encounter ever ran, with two quests still `pending`. Root-caused by instrumenting the route with temporary debug logging (removed before commit) and cross-checking raw table state via direct PostgREST queries with the session's bearer token, since the Next.js-level reads and the actual Postgres state needed to be compared independently to rule out any caching artifact. Fixed by deleting `arrival/route.ts`'s two completion writes entirely — it's now a pure `{ distanceMeters, arrived }` proximity check, exactly matching `SPEC-ai-encounter.md`'s completion model. Re-verified live end-to-end afterward (see above): a fresh 3-quest adventure completed quest-by-quest correctly, `adventures.status` staying `active` until the real final quest resolved. Full writeup in `quest-gameplay`'s [task 03](../../quest-gameplay/issues/03-arrival-vertical-slice.md) comment.

**Code review findings (applied):**
- `checkArrival`'s result stayed stuck `arrived: true` after the current quest advanced to a new landmark (the `??` fallback never re-evaluates a real boolean) — fixed by resetting `checkArrival` on `currentQuestId` change.
- Tapping a choice called `encounter.reset()` immediately instead of after `sendChoice` actually succeeded, silently losing both the submitted choice and any error on failure — fixed by moving `encounter.reset()` into `sendChoice`'s `onSuccess`, and rendering `sendChoice.error`.
- An encounter with `choices: []` on a non-final quest (schema allows it; nothing enforced "final quest only") left the player stuck with no way to proceed — fixed with a `Continue` fallback button in `EncounterPanel`.
- The `!currentQuest` gate hid an unread encounter message (including the adventure's final "The End" narration) the instant the server-side quest position advanced past it, racing the query invalidation against the user actually reading the message — fixed by gating on `!currentQuest && !encounter.data` instead, so the panel persists until explicitly dismissed.
- `ADD_ITEM` did a wasted extra `SELECT` per action to re-read inventory already loaded at the top of the function — fixed with a local accumulator.
- The independent `quests`/`messages` fetches ran as two sequential round trips — fixed with `Promise.all`.

**Code review findings (not applied, accepted as-is):**
- Action-application logic living inline in the route handler rather than a separately-testable domain function — consistent with `quest-gameplay`'s `arrival/route.ts`, which has the same shape and was never extracted either.
- No locking/idempotency-key guard against two concurrent `POST .../encounter` calls racing each other — same accepted-risk posture as `SPEC-ai-encounter.md`'s Resolved Decisions on `ADD_ITEM`'s race window (single player per adventure, no concurrent-tab story anywhere else in the codebase).

**Dependencies:** 01, 02, 03, 04

**Files likely touched:**
- `src/app/api/adventures/[id]/encounter/route.ts`
- `src/lib/game/hooks.ts`
- `src/components/game/encounter/EncounterPanel.tsx`
- `src/app/adventures/[id]/page.tsx`

**Estimated scope:** Medium
