Status: resolved
Type: task
Blocked by: 01, 02

# 03 - Nearby places vertical slice (route handler + hook + demo page)

**Description:** `GET /api/places/nearby` (`src/app/api/places/nearby/route.ts`) calls `requireUser()`, validates `lat`/`lng`/`radiusMeters` with `nearbyPlacesQuerySchema`, queries Overpass (`https://overpass-api.de/api/interpreter`) for `tourism`/`historic`-tagged elements within `radiusMeters`, and returns `rankPlaces()`'s output. A non-`200` Overpass response returns a clean `502` ("Couldn't find nearby landmarks. Try again.") rather than crashing. `useNearbyPlaces()` (`src/lib/places/hooks.ts`) wraps a Promise-ified `navigator.geolocation.getCurrentPosition()` followed by a `GET` to the route, via `fetchJson()` (from `persistence`). `src/app/places/nearby/page.tsx` is a bare-bones demo page: a "Find nearby landmarks" button (geolocation prompt fires only on click, never on mount) that renders the ranked list on success.

**Two real bugs found by manual testing, not by any written test:**
1. `searchParams.get()` returns `null` (not `undefined`) for a missing query param, and `z.coerce.number()` coerces `null` to `0` rather than failing — so a request with no `lat`/`lng` at all was silently accepted as `(0, 0)` instead of rejected with `400`. Fixed at the schema level (`nullToUndefined` preprocess step on all three fields in `nearbyPlacesQuerySchema`) rather than patching each call site, since any future caller would hit the same trap. Added a regression test (`places.test.ts`) using `null` explicitly, matching `URLSearchParams.get()`'s real return value — the original test only covered `{}` (an omitted key, i.e. `undefined`), which doesn't reproduce this.
2. Every live Overpass call failed with `406 Not Acceptable` — traced to `fetch()` sending no `User-Agent` header by default (unlike `curl`, which always sends one); Overpass's server rejects headerless requests outright. Fixed by adding an explicit `User-Agent` header. Confirmed via a standalone repro script before touching the route: identical query succeeded once a `User-Agent` was added, including one real `504` on a follow-up call — i.e. once past the 406, real request failures are exactly the flakiness `SPEC-places.md` already accepted as a risk, not a new one.

**Acceptance criteria:**
- [x] `GET /api/places/nearby` rejects unauthenticated requests
- [x] `GET /api/places/nearby` returns `400` for missing/out-of-range `lat`/`lng`, before calling Overpass
- [x] A valid request returns `rankPlaces()`'s output for that location
- [x] A non-`200` Overpass response returns `502` with the documented message, not an unhandled error
- [x] `/places/nearby` renders the button and, given a location, renders the ranked list — verified via the API + page-shell HTML (see Verification's browser-testing gap below)

**Verification:**
- [x] `pnpm build`/`lint`/`test` pass (43/43)
- [x] Manual: registered a real test account against local dev; unauthenticated `curl` to the route got `307` (Proxy, not a public path); missing/out-of-range `lat`/`lng` got `400`; a valid request against Trafalgar Square's real coordinates returned real landmarks (Nelson's Column, the plinth lions, Fourth Plinth) sorted nearest-first and capped at 10 — confirmed twice, with one subsequent `502` demonstrating the accepted-flakiness path also works cleanly

**Four more issues found by code review after this task first shipped, all fixed:**
1. The `null`-only preprocess fix from bug 1 above didn't cover an empty/whitespace query string (`?lat=`) — `z.coerce.number()` turns `""` into `0` too. Widened the preprocess (`blankToUndefined`) to cover both, with a new regression test; re-verified live (`?lat=&lng=` now `400`).
2. A malformed/truncated `200` response from Overpass (it streams output and can hit internal limits mid-generation) would throw unhandled inside `response.json()`, bypassing the documented `502`. Wrapped in `try`/`catch`.
3. `getCurrentPosition()` had no timeout, so a stalled GPS fix could leave the mutation pending forever with no way to retry short of a reload. Added a `10s` timeout.
4. `GeolocationPositionError.message` can be empty on some browsers, and the page renders it directly — added a code-to-message map (`PERMISSION_DENIED`/`POSITION_UNAVAILABLE`/`TIMEOUT`) so the error is never blank.
- [ ] **Not verified — no browser automation available this session:** the actual click-button-grant-permission browser interaction. Confirmed everything server-side (the API, the schema, the ranking) and that the page shell renders and contains the button, but did not drive a real geolocation permission grant end-to-end in a browser. Flagging this explicitly rather than claiming full coverage — worth a real hands-on check on an actual device before calling `SPEC-places.md`'s Phase 3 exit checkpoint fully proven.

**Dependencies:** 01, 02

**Files likely touched:**
- `src/app/api/places/nearby/route.ts`
- `src/app/places/nearby/page.tsx`
- `src/lib/places/hooks.ts`

**Estimated scope:** Medium
