Status: open
Type: task
Blocked by: none

# 02 - checkArrival() + arrivalCheckSchema (TDD)

**Description:** Add `checkArrival(origin, quest)` to `src/lib/game/arrival.ts` — pure, no I/O: `{ distanceMeters: haversine(origin, quest), arrived: distanceMeters <= quest.radiusMeters }`. This is "the real arrival boundary" per `ROADMAP.md` — genuinely new game-rule logic, same TDD bar as `haversine()` itself. Also add `arrivalCheckSchema` to `src/lib/schemas/arrival.ts` — `{ latitude, longitude }`, same shape/pattern as `nearbyPlacesQuerySchema` minus the radius.

**Acceptance criteria:**
- [ ] `checkArrival()` returns `arrived: true` when the origin is within `quest.radiusMeters`
- [ ] `checkArrival()` returns `arrived: false` when outside
- [ ] Boundary case: distance exactly equal to `radiusMeters` counts as arrived (`<=`, not `<`)
- [ ] `arrivalCheckSchema` accepts valid `latitude`/`longitude`; rejects out-of-range or missing values
- [ ] Tests written first, observed failing before the implementations existed

**Verification:**
- [ ] `pnpm test` passes

**Dependencies:** None (uses the existing `haversine()` from `places`, already merged)

**Files likely touched:**
- `src/lib/game/arrival.ts`
- `src/lib/game/arrival.test.ts`
- `src/lib/schemas/arrival.ts`
- `src/lib/schemas/arrival.test.ts`

**Estimated scope:** Small
