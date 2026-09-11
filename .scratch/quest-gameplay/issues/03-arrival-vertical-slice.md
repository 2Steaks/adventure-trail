Status: open
Type: task
Blocked by: 01, 02

# 03 - Arrival vertical slice (route handler + hook + page extension)

**Description:** `POST /api/adventures/:id/arrival` (`src/app/api/adventures/[id]/arrival/route.ts`) calls `requireUser()`, validates the body with `arrivalCheckSchema`, loads the adventure's quest scoped to the caller (`404` if not found/owned, same pattern as `persistence`'s detail route), and delegates to `checkArrival()`. On `arrived: true` (and the quest isn't already `completed`), updates `quests.status` and `adventures.status` to `'completed'`. Repeat calls after completion are idempotent — no error, no duplicate write.

`useCheckArrival(adventureId)` (`src/lib/game/hooks.ts`) wraps `getCurrentPosition()` (task 01) + a `POST` to the route via `fetchJson()`. `src/app/adventures/[id]/page.tsx` is extended (not replaced) with: a "Check My Distance" button (geolocation prompt fires only on tap), a distance readout after a successful check, a Google Maps deep-link (`https://www.google.com/maps/dir/?api=1&destination=<lat>,<lng>`) to the quest's coordinates, and an arrival celebration state once `arrived: true`.

**Acceptance criteria:**
- [ ] `POST /api/adventures/:id/arrival` rejects unauthenticated requests
- [ ] Returns `404` for another user's adventure id
- [ ] Coordinates far from the quest return `{ arrived: false }` with a real `distanceMeters`
- [ ] Coordinates within `quest.radiusMeters` return `{ arrived: true }` and persist both status updates
- [ ] Calling again after completion doesn't error or re-trigger the write
- [ ] `/adventures/[id]` renders the button, distance readout, Maps link, and arrival state as described above

**Verification:**
- [ ] `pnpm build`/`lint`/`test` pass
- [ ] Manual: as a real logged-in user with an adventure from `persistence`, call the route with coordinates far from Trafalgar Square (expect `arrived: false`) and then with coordinates inside the 40m radius (expect `arrived: true`, confirm via a direct DB query that both `quests.status` and `adventures.status` flipped to `completed`); call again with the same in-radius coordinates and confirm no error
- [ ] Confirm an unauthenticated `curl` to the route is rejected, and a second test user's `curl` against the first user's adventure id gets `404`

**Dependencies:** 01, 02

**Files likely touched:**
- `src/app/api/adventures/[id]/arrival/route.ts`
- `src/app/adventures/[id]/page.tsx`
- `src/lib/game/hooks.ts`

**Estimated scope:** Medium
