Status: open
Type: task
Blocked by: none

# 02 - Extend GET /api/adventures/:id with game_states (fix current-quest gap)

**Description:** `GET /api/adventures/:id` (`src/app/api/adventures/[id]/route.ts`) currently returns only `adventure` and `quests` — it never selects `game_states`, so `src/app/adventures/[id]/page.tsx` has been guessing the current quest as `quests[0]` instead of the authoritative `game_states.current_quest_id`. This predates `ai-encounter` (it was fine while every adventure had exactly one quest) but must be fixed before task 05 builds quest-advancement on top of it.

Add a `serializeGameState()` (`src/lib/adventures/serialize.ts`, same camelCase-row-mapping pattern as `serializeAdventure`/`serializeQuest`) and select `game_states` (`current_quest_id`, `inventory`) scoped by `adventure_id` alongside the existing `adventure`/`quests` queries. Return it as a third top-level `gameState` key: `{ adventure, quests, gameState: { currentQuestId, inventory } }`. Update `useAdventure()`'s (`src/lib/adventures/hooks.ts`) return type to match — this is the only consumer today.

Every adventure gets a `game_states` row at creation time already (`ai-planner` task 05), so `gameState` is never null for an existing adventure; no need to handle a missing row beyond the same 404/ownership check the route already does for `adventure`.

**Acceptance criteria:**
- [ ] `GET /api/adventures/:id` response includes `gameState: { currentQuestId: string | null, inventory: string[] }`
- [ ] `adventure`/`quests` shape and behavior (404 on wrong owner, 401 unauthenticated) are unchanged
- [ ] `useAdventure()`'s TypeScript type reflects the new `gameState` field

**Verification:**
- [ ] `pnpm test` passes (existing tests unaffected; add a `serializeGameState()` mapping test alongside the existing serialize tests if one exists, otherwise a small new one)
- [ ] `pnpm build`/`lint` pass
- [ ] Manual: `GET /api/adventures/:id` against a real adventure returns a `gameState` matching that adventure's actual `game_states` row (`current_quest_id`, `inventory`) via a direct DB query

**Dependencies:** None

**Files likely touched:**
- `src/app/api/adventures/[id]/route.ts`
- `src/lib/adventures/serialize.ts`
- `src/lib/adventures/hooks.ts`

**Estimated scope:** Small
