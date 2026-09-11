Status: resolved
Type: task
Blocked by: none

# 03 - Extract fetchNearbyPlaces() (refactor)

**Description:** Extract the Overpass query + fetch + error handling + `rankPlaces()` call currently inlined in `src/app/api/places/nearby/route.ts` into `fetchNearbyPlaces({ lat, lng, radiusMeters }): Promise<Place[]>` (`src/lib/places/fetch-nearby-places.ts`). `places/nearby/route.ts` calls it instead of inlining the logic; `POST /api/adventures` (task 05) will call the same function. Pure refactor — no behavior change, no new logic, zero API cost (Overpass, not Anthropic — no billing concern, but still verify live per `places`' existing manual-verification posture).

The extracted function throws a `NearbyPlacesFetchError` on any failure (network error, non-`200` response, malformed JSON) rather than returning a `NextResponse` directly — keeps it usable from a plain function context (task 05's `POST /api/adventures`, not just a Route Handler). Each caller catches it and maps to its own response.

**Acceptance criteria:**
- [x] `fetchNearbyPlaces()` lives in `src/lib/places/fetch-nearby-places.ts`, exported
- [x] `src/app/api/places/nearby/route.ts` delegates to it; no duplicate Overpass-call logic remains
- [x] `GET /api/places/nearby`'s behavior is unchanged (same `502` on Overpass failure, same ranked output)

**Verification:**
- [x] `pnpm test` passes (57/57, existing `places` tests unaffected)
- [x] `pnpm build`/`lint` pass
- [x] Manual: one live call against `GET /api/places/nearby` with real coordinates (Trafalgar Square), confirmed unchanged output — same real landmarks, same shape

**Dependencies:** None

**Files likely touched:**
- `src/lib/places/fetch-nearby-places.ts`
- `src/app/api/places/nearby/route.ts`

**Estimated scope:** Small
