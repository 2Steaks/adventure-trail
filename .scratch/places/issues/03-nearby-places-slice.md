Status: open
Type: task
Blocked by: 01, 02

# 03 - Nearby places vertical slice (route handler + hook + demo page)

**Description:** `GET /api/places/nearby` (`src/app/api/places/nearby/route.ts`) calls `requireUser()`, validates `lat`/`lng`/`radiusMeters` with `nearbyPlacesQuerySchema`, queries Overpass (`https://overpass-api.de/api/interpreter`) for `tourism`/`historic`-tagged elements within `radiusMeters`, and returns `rankPlaces()`'s output. A non-`200` Overpass response returns a clean `502` ("Couldn't find nearby landmarks. Try again.") rather than crashing. `useNearbyPlaces()` (`src/lib/places/hooks.ts`) wraps a Promise-ified `navigator.geolocation.getCurrentPosition()` followed by a `GET` to the route, via `fetchJson()` (from `persistence`). `src/app/places/nearby/page.tsx` is a bare-bones demo page: a "Find nearby landmarks" button (geolocation prompt fires only on click, never on mount) that renders the ranked list on success.

**Acceptance criteria:**
- [ ] `GET /api/places/nearby` rejects unauthenticated requests
- [ ] `GET /api/places/nearby` returns `400` for missing/out-of-range `lat`/`lng`, before calling Overpass
- [ ] A valid request returns `rankPlaces()`'s output for that location
- [ ] A non-`200` Overpass response returns `502` with the documented message, not an unhandled error
- [ ] `/places/nearby` renders the button; clicking it triggers the geolocation prompt and, on success, renders the ranked list; on error (permission denied, Overpass failure), shows a clear retry message

**Verification:**
- [ ] `pnpm build`/`lint`/`test` pass
- [ ] Manual: as a real logged-in user on a real machine, click "Find nearby landmarks," grant location, confirm a real ranked list of named landmarks near that location renders; separately confirm an unauthenticated `curl` to the route is rejected

**Dependencies:** 01, 02

**Files likely touched:**
- `src/app/api/places/nearby/route.ts`
- `src/app/places/nearby/page.tsx`
- `src/lib/places/hooks.ts`

**Estimated scope:** Medium
