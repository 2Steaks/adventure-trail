Status: resolved
Type: task
Blocked by: none

# 01 - Haversine distance + nearby-places query schema (TDD)

**Description:** Add `haversine(a, b)` to `src/lib/geo/haversine.ts` — great-circle distance in meters between two `{ latitude, longitude }` points. This is a shared primitive: `quest-gameplay` (Phase 4) reuses it for arrival detection, per `ROADMAP.md`. Also add `nearbyPlacesQuerySchema` to `src/lib/schemas/places.ts` — `{ lat, lng, radiusMeters? }`, coerced from query-string values, `radiusMeters` defaulting to `1000`. Both are genuinely new logic (TDD).

Used a synthetic coordinate pair (same longitude, `0.009°` latitude apart, ≈1001.88m via the standard 111,320m/degree approximation) rather than a real landmark pair — precise and independently verifiable, rather than trusting a remembered real-world distance.

**Acceptance criteria:**
- [x] `haversine()` returns ~0 for identical points
- [x] `haversine()` returns the correct distance (within a small tolerance) between two known coordinate pairs ~1km apart
- [x] `nearbyPlacesQuerySchema` accepts valid `lat`/`lng`
- [x] `nearbyPlacesQuerySchema` rejects an out-of-range `lat` (`> 90`) or missing `lat`/`lng`
- [x] `nearbyPlacesQuerySchema` defaults `radiusMeters` to `1000` when omitted
- [x] Tests written first, observed failing (import error, implementations didn't exist) before the implementations existed

**Verification:**
- [x] `pnpm test` passes (37/37)

**Dependencies:** None

**Files likely touched:**
- `src/lib/geo/haversine.ts`
- `src/lib/geo/haversine.test.ts`
- `src/lib/schemas/places.ts`
- `src/lib/schemas/places.test.ts`

**Estimated scope:** Small
