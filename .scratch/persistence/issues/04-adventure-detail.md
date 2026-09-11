Status: open
Type: task
Blocked by: 02, 03

# 04 - Adventure detail (route handler + hook + page)

**Description:** `GET /api/adventures/:id` (`src/app/api/adventures/[id]/route.ts`) calls `requireUser()`, returns the adventure with its quest and game_state, or `401`/`404` if it doesn't belong to the caller. `useAdventure(id)` query hook added to `src/lib/adventures/hooks.ts`. `src/app/adventures/[id]/page.tsx` renders the quest's landmark name + objective and current status — this is what "Resume" (task 03) and the create-form redirect (task 02) both link to.

**Acceptance criteria:**
- [ ] `GET /api/adventures/:id` returns `401` unauthenticated
- [ ] `GET /api/adventures/:id` returns `401`/`404` for another user's adventure id, even when guessed correctly
- [ ] Valid, owned id returns the adventure + quest + game_state
- [ ] `/adventures/[id]` renders the quest's landmark name and objective, reachable via "Resume" from `/`

**Verification:**
- [ ] `pnpm build`/`lint` pass
- [ ] Manual: full loop — create (task 02) → appears on `/` (task 03) → "Resume" → detail page shows the hard-coded quest; separately, confirm a second user hitting the first user's adventure id directly gets `401`/`404`

**Dependencies:** 02, 03

**Files likely touched:**
- `src/app/api/adventures/[id]/route.ts`
- `src/app/adventures/[id]/page.tsx`
- `src/lib/adventures/hooks.ts`

**Estimated scope:** Small
