Status: resolved
Type: task
Blocked by: none

# 02 - Extend GET /api/adventures/:id with game_states (fix current-quest gap)

**Description:** `GET /api/adventures/:id` (`src/app/api/adventures/[id]/route.ts`) currently returns only `adventure` and `quests` — it never selects `game_states`, so `src/app/adventures/[id]/page.tsx` has been guessing the current quest as `quests[0]` instead of the authoritative `game_states.current_quest_id`. This predates `ai-encounter` (it was fine while every adventure had exactly one quest) but must be fixed before task 05 builds quest-advancement on top of it.

Add a `serializeGameState()` (`src/lib/adventures/serialize.ts`, same camelCase-row-mapping pattern as `serializeAdventure`/`serializeQuest`) and select `game_states` (`current_quest_id`, `inventory`) scoped by `adventure_id` alongside the existing `adventure`/`quests` queries. Return it as a third top-level `gameState` key: `{ adventure, quests, gameState: { currentQuestId, inventory } }`. Update `useAdventure()`'s (`src/lib/adventures/hooks.ts`) return type to match — this is the only consumer today.

Every adventure gets a `game_states` row at creation time already (`ai-planner` task 05), so `gameState` is never null for an existing adventure; no need to handle a missing row beyond the same 404/ownership check the route already does for `adventure`.

**Acceptance criteria:**
- [x] `GET /api/adventures/:id` response includes `gameState: { currentQuestId: string | null, inventory: string[] }`
- [x] `adventure`/`quests` shape and behavior (404 on wrong owner, 401 unauthenticated) are unchanged
- [x] `useAdventure()`'s TypeScript type reflects the new `gameState` field

**Verification:**
- [x] `pnpm test` passes (existing tests unaffected; added `serialize.test.ts` covering `serializeGameState()`, 70/70 total)
- [x] `pnpm build`/`lint` pass
- [x] Manual: unauthenticated request against `GET /api/adventures/:id` still returns `307` via the Proxy, confirming the route's auth gate is unchanged
- [x] **2026-09-12, verified live** (account limit lifted early): created a real adventure via `POST /api/adventures`, then `GET /api/adventures/:id` returned `gameState: { currentQuestId: <first quest's real id>, inventory: [] }` matching the actual `game_states` row exactly, and correctly advanced to the next quest's id after each encounter's `COMPLETE_OBJECTIVE`.

**Dependencies:** None

**Files likely touched:**
- `src/app/api/adventures/[id]/route.ts`
- `src/lib/adventures/serialize.ts`
- `src/lib/adventures/hooks.ts`

**Estimated scope:** Small
