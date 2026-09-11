Status: resolved
Type: task
Blocked by: none

# 02 - checkArrival() + arrivalCheckSchema (TDD)

**Description:** Add `checkArrival(origin, quest)` to `src/lib/game/arrival.ts` — pure, no I/O: `{ distanceMeters: haversine(origin, quest), arrived: distanceMeters <= quest.radiusMeters }`. This is "the real arrival boundary" per `ROADMAP.md` — genuinely new game-rule logic, same TDD bar as `haversine()` itself. Also add `arrivalCheckSchema` to `src/lib/schemas/arrival.ts` — `{ latitude, longitude }`, same shape/pattern as `nearbyPlacesQuerySchema` minus the radius.

The boundary case was tested with `radiusMeters: 0` and the origin equal to the quest's own coordinates (distance ≈ 0), rather than trying to construct two coordinate pairs with an exactly-equal floating-point distance — directly exercises the `<=` vs `<` choice without floating-point brittleness. This schema takes a parsed JSON body (not query-string values like `places`'), so no `blankToUndefined`-style coercion guard was needed — `z.number()` on a real JSON number fails cleanly on `null`/missing already.

**Acceptance criteria:**
- [x] `checkArrival()` returns `arrived: true` when the origin is within `quest.radiusMeters`
- [x] `checkArrival()` returns `arrived: false` when outside
- [x] Boundary case: distance exactly equal to `radiusMeters` counts as arrived (`<=`, not `<`)
- [x] `arrivalCheckSchema` accepts valid `latitude`/`longitude`; rejects out-of-range or missing values
- [x] Tests written first, observed failing (import error, implementations didn't exist) before the implementations existed

**Verification:**
- [x] `pnpm test` passes (49/49)

**Dependencies:** None (uses the existing `haversine()` from `places`, already merged)

**Files likely touched:**
- `src/lib/game/arrival.ts`
- `src/lib/game/arrival.test.ts`
- `src/lib/schemas/arrival.ts`
- `src/lib/schemas/arrival.test.ts`

**Estimated scope:** Small
