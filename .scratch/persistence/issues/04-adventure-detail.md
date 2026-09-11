Status: resolved
Type: task
Blocked by: 02, 03

# 04 - Adventure detail (route handler + hook + page)

**Description:** `GET /api/adventures/:id` (`src/app/api/adventures/[id]/route.ts`) calls `requireUser()`, returns the adventure with its quest and game_state, or `401`/`404` if it doesn't belong to the caller. `useAdventure(id)` query hook added to `src/lib/adventures/hooks.ts`. `src/app/adventures/[id]/page.tsx` renders the quest's landmark name + objective and current status — this is what "Resume" (task 03) and the create-form redirect (task 02) both link to.

Added `serializeQuest()`/`serializeGameState()` alongside `serializeAdventure()` in `src/lib/adventures/serialize.ts` — the detail route's nested `quests`/`gameState` are mapped to camelCase too, closing a gap where the first draft returned raw snake_case rows for the nested resources while the top-level `adventure` was already serialized.

**Acceptance criteria:**
- [x] `GET /api/adventures/:id` rejects unauthenticated (`307` via the Proxy, same nuance as tasks 02/03)
- [x] `GET /api/adventures/:id` returns `404` for another user's adventure id, even when guessed correctly (query is scoped by both `id` and `user_id`, so a mismatch reads as "not found," not a distinguishable 403 — doesn't leak whether the id exists)
- [x] Valid, owned id returns the adventure + quest + game_state
- [x] `/adventures/[id]` renders the quest's landmark name and objective, reachable via "Resume" from `/`

**Verification:**
- [x] `pnpm build`/`lint`/`test` pass (31/31)
- [x] Manual: full loop — created an adventure as user A, `GET` detail as A returned the adventure + quest (Nelson's Column) + game_state with `currentQuestId` correctly linked; `GET` the same id as user B returned `404`. Test adventure deleted afterward.

**Dependencies:** 02, 03

**Files likely touched:**
- `src/app/api/adventures/[id]/route.ts`
- `src/app/adventures/[id]/page.tsx`
- `src/lib/adventures/hooks.ts`

**Estimated scope:** Small
