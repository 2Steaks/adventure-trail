Status: open
Type: task
Blocked by: none

# 03 - Extract fetchNearbyPlaces() (refactor)

**Description:** Extract the Overpass query + fetch + error handling + `rankPlaces()` call currently inlined in `src/app/api/places/nearby/route.ts` into `fetchNearbyPlaces({ lat, lng, radiusMeters }): Promise<Place[]>` (`src/lib/places/fetch-nearby-places.ts`). `places/nearby/route.ts` calls it instead of inlining the logic; `POST /api/adventures` (task 05) will call the same function. Pure refactor — no behavior change, no new logic, zero API cost (Overpass, not Anthropic — no billing concern, but still verify live per `places`' existing manual-verification posture).

**Acceptance criteria:**
- [ ] `fetchNearbyPlaces()` lives in `src/lib/places/fetch-nearby-places.ts`, exported
- [ ] `src/app/api/places/nearby/route.ts` delegates to it; no duplicate Overpass-call logic remains
- [ ] `GET /api/places/nearby`'s behavior is unchanged (same `502` on Overpass failure, same ranked output)

**Verification:**
- [ ] `pnpm test` passes (existing `places` tests unaffected)
- [ ] `pnpm build`/`lint` pass
- [ ] Manual: one live call against `GET /api/places/nearby` with real coordinates, confirm unchanged output shape

**Dependencies:** None

**Files likely touched:**
- `src/lib/places/fetch-nearby-places.ts`
- `src/app/api/places/nearby/route.ts`

**Estimated scope:** Small
