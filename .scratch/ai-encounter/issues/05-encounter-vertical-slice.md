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
- [ ] Returns `404` for another user's adventure id — implemented (same ownership-scoped query pattern as every other adventure route), not yet exercised live, see Verification
- [x] Returns a `409`-class error with no LLM call when the adventure has no current quest (already fully completed) — implemented (`generateEncounter()` is only called after `currentQuestId` is confirmed non-null)
- [x] A validated `COMPLETE_OBJECTIVE` completes the quest, advances `game_states.current_quest_id` to the next quest by position, and completes the adventure when it was the last quest — implemented
- [x] A validated `ADD_ITEM` appends to `game_states.inventory` without clobbering existing items — implemented via a fresh read-modify-write per action
- [x] An `EncounterError` (retry exhausted) returns `502` with zero DB writes — implemented: all writes happen strictly after `generateEncounter()` returns successfully
- [x] Calling the route again after a quest is already completed reads the freshly-advanced `current_quest_id` each time, so it can't re-complete the same objective — it generates a new encounter for the new current quest instead (see code comment); this is the achievable idempotency given the module's flavor-only choice/no-dedup-key design, not literal same-response-twice idempotency
- [x] `/adventures/[id]` derives the current quest from `gameState`, renders the Wizard through all six mapped states, and shows `EncounterPanel` with tappable choices once an encounter has run
- [x] `HARD_CODED_QUEST`-era assumptions (single-quest-per-adventure UI) are fully gone from the detail page — `quests[0]` is gone, replaced by `gameState.currentQuestId` lookup

**Verification:**
- [x] `pnpm build`/`lint`/`test` pass (73/73 tests; production build compiles and registers all new routes)
- [x] Manual, no live LLM call needed: unauthenticated → `307`, confirmed live
- [ ] **Deferred, same dependency as tasks 02-04:** wrong-owner `404`, no-current-quest `409`, and the full live encounter flow (arrive → talk to Wizard → AI message + choices → objective completed → quest/adventure advancement) all need an existing adventure, which needs a live-billed Adventure Planner call — blocked by the same Anthropic usage limit (resets 2026-10-01). Not silently accepted.
- [ ] Every `SPEC-ai-encounter.md` Success Criteria box checked — the live-dependent ones are explicitly deferred, matching task 04's status, not silently skipped

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
