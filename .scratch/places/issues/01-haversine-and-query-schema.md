Status: open
Type: task
Blocked by: none

# 01 - Haversine distance + nearby-places query schema (TDD)

**Description:** Add `haversine(a, b)` to `src/lib/geo/haversine.ts` — great-circle distance in meters between two `{ latitude, longitude }` points. This is a shared primitive: `quest-gameplay` (Phase 4) reuses it for arrival detection, per `ROADMAP.md`. Also add `nearbyPlacesQuerySchema` to `src/lib/schemas/places.ts` — `{ lat, lng, radiusMeters? }`, coerced from query-string values, `radiusMeters` defaulting to `1000`. Both are genuinely new logic (TDD).

**Acceptance criteria:**
- [ ] `haversine()` returns ~0 for identical points
- [ ] `haversine()` returns the correct distance (within a small tolerance) between two known real coordinate pairs ~1km apart
- [ ] `nearbyPlacesQuerySchema` accepts valid `lat`/`lng`
- [ ] `nearbyPlacesQuerySchema` rejects an out-of-range `lat` (`> 90`) or missing `lat`/`lng`
- [ ] `nearbyPlacesQuerySchema` defaults `radiusMeters` to `1000` when omitted
- [ ] Tests written first, observed failing before the implementations existed

**Verification:**
- [ ] `pnpm test` passes

**Dependencies:** None

**Files likely touched:**
- `src/lib/geo/haversine.ts`
- `src/lib/geo/haversine.test.ts`
- `src/lib/schemas/places.ts`
- `src/lib/schemas/places.test.ts`

**Estimated scope:** Small
