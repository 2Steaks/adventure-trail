Status: resolved
Type: task
Blocked by: none

# 01 - Extract shared geolocation helper (refactor)

**Description:** Move `getCurrentPosition()` (the Promise-ified `navigator.geolocation.getCurrentPosition()` wrapper, including the timeout and the geolocation-error-code-to-message map) out of `src/lib/places/hooks.ts` into `src/lib/geo/geolocation.ts`. `places/hooks.ts` imports it from the new location instead of defining its own copy. Pure refactor — no behavior change, no new logic, so no new test beyond confirming `places`' existing tests still pass.

**Acceptance criteria:**
- [x] `getCurrentPosition()` lives in `src/lib/geo/geolocation.ts`, exported
- [x] `src/lib/places/hooks.ts` imports it from the new location; no duplicate definition remains
- [x] `useNearbyPlaces()`'s behavior is unchanged (still a 10s timeout, still the same error messages)

**Verification:**
- [x] `pnpm test` passes (43/43, existing `places` tests unaffected)
- [x] `pnpm build`/`lint` pass

**Dependencies:** None

**Files likely touched:**
- `src/lib/geo/geolocation.ts`
- `src/lib/places/hooks.ts`

**Estimated scope:** Extra small
