Status: resolved
Type: task
Blocked by: 01

# 02 - rankPlaces() filter/rank logic (TDD)

**Description:** Add `rankPlaces(origin, elements)` to `src/lib/places/rank.ts` — takes the caller's `{ latitude, longitude }` and raw Overpass `elements` (a mix of `node`s with `lat`/`lon` and `way`s with a `center: { lat, lon }`), drops any element with no `tags.name`, computes `distanceMeters` via `haversine()` (task 01), sorts nearest-first, and caps the result at 10. This is the pure logic the Route Handler (task 03) delegates to — genuinely new logic, TDD.

`type` is derived as `tags.tourism ?? tags.historic ?? "landmark"`; `id` is `${element.type}/${element.id}` since Overpass node/way ids aren't unique across the two namespaces.

**Acceptance criteria:**
- [x] Elements with no `tags.name` are dropped
- [x] Result is sorted ascending by `distanceMeters`
- [x] A fixture of 15 named elements is capped at 10 results
- [x] A `way` element (using `.center.lat`/`.center.lon`) is handled the same as a `node` (using `.lat`/`.lon`)
- [x] Each result has `{ id, name, type, latitude, longitude, distanceMeters }`
- [x] Tests written first, observed failing (import error, implementation didn't exist) before the implementation existed

**Verification:**
- [x] `pnpm test` passes (41/41)

**Dependencies:** 01 (uses `haversine()`)

**Files likely touched:**
- `src/lib/places/rank.ts`
- `src/lib/places/rank.test.ts`

**Estimated scope:** Small
