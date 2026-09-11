# Spec: Places Module

Module id: `places` (see `CAPABILITY_MAP.md`). Depends on: `foundation` (complete). Independent of `persistence` (also complete, merged) — either could have shipped first; `ai-planner` (Phase 5) is what later consumes both.

## Objective

Let a logged-in user grant browser location permission and get back a ranked list of real, nearby landmarks — proving the geolocation → Overpass → filter/rank pipeline works, standalone. Not wired into `persistence`'s Create Adventure form yet; that integration is `ai-planner`'s job once it needs to constrain an LLM's landmark choice to real candidates.

Who: a parent about to create an adventure (per `notes/original_plan.md`'s Create Adventure flow: "Location → OSM nearby POIs → Filter/rank → LLM adventure plan → ..."). This module builds the first two steps only.
Success looks like: a user clicks "Find nearby landmarks," grants the browser's location prompt, and sees 5-10 real, named, walkable-distance landmarks sorted nearest-first — matching `ROADMAP.md`'s Phase 3 exit checkpoint: "a geolocation prompt returns a ranked candidate POI list for the current location."

Out of scope for this module: wiring candidates into adventure creation (`ai-planner`), any caching layer or Overpass fallback (accepted risk per `ROADMAP.md`'s Tech Decisions), LLM selection logic.

## Tech Stack

No new dependencies:

- Browser `navigator.geolocation.getCurrentPosition()`, wrapped in a Promise — called only on user action (a button click), never automatically on page load, so the permission prompt is always user-initiated
- Overpass API (`https://overpass-api.de/api/interpreter`) — called from a Next.js Route Handler, not the browser, per this project's established "frontend never calls a third-party API directly" convention (same rationale as the no-browser-Supabase-client rule)
- `requireUser()` — this module's Route Handler is protected like every other one, to avoid exposing an open Overpass proxy to the internet
- TanStack Query (`useMutation`, since the flow is user-triggered, not a passive fetch) via the existing `fetchJson()` helper (`src/lib/http/fetch-json.ts`, added in `persistence`)
- Zod for query-param validation

## Commands

No new commands beyond `SPEC-foundation.md`'s (`pnpm dev`/`build`/`lint`/`test`).

## Project Structure

```text
src/
  lib/
    geo/
      haversine.ts               # distance(a, b) in meters — shared; quest-gameplay (Phase 4) reuses this
      haversine.test.ts
    schemas/
      places.ts                  # Zod: nearbyPlacesQuerySchema { lat, lng, radiusMeters? }
      places.test.ts
    places/
      rank.ts                    # rankPlaces(origin, overpassElements) -> Place[] (filter unnamed, distance, sort, cap)
      rank.test.ts
      hooks.ts                   # useNearbyPlaces() — wraps geolocation + GET /api/places/nearby

  app/
    places/
      nearby/
        page.tsx                 # demo page: "Find nearby landmarks" button + result list
    api/
      places/
        nearby/
          route.ts                # GET — requireUser(), validate query, call Overpass, rankPlaces()
```

## Code Style

The Route Handler validates query params, queries Overpass, then delegates all filtering/ranking to the pure, tested `rankPlaces()` — the handler itself stays thin wiring, same posture as every other module's routes:

```ts
// src/app/api/places/nearby/route.ts
import { NextResponse } from "next/server";
import { requireUser } from "@/src/lib/supabase/require-user";
import { nearbyPlacesQuerySchema } from "@/src/lib/schemas/places";
import { rankPlaces } from "@/src/lib/places/rank";

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

export async function GET(request: Request) {
  const { user } = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = nearbyPlacesQuerySchema.safeParse({
    lat: searchParams.get("lat"),
    lng: searchParams.get("lng"),
    radiusMeters: searchParams.get("radiusMeters") ?? undefined,
  });
  if (!query.success) {
    return NextResponse.json({ error: "Invalid coordinates." }, { status: 400 });
  }

  const { lat, lng, radiusMeters } = query.data;
  const overpassQuery = `[out:json][timeout:25];(node["tourism"~"attraction|museum|artwork|viewpoint"](around:${radiusMeters},${lat},${lng});node["historic"](around:${radiusMeters},${lat},${lng});way["tourism"~"attraction|museum|artwork|viewpoint"](around:${radiusMeters},${lat},${lng});way["historic"](around:${radiusMeters},${lat},${lng}););out center;`;

  const response = await fetch(OVERPASS_URL, {
    method: "POST",
    body: overpassQuery,
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: "Couldn't find nearby landmarks. Try again." },
      { status: 502 },
    );
  }

  const { elements } = await response.json();
  const places = rankPlaces({ latitude: lat, longitude: lng }, elements);

  return NextResponse.json({ places });
}
```

`rankPlaces()`'s contract: drop elements with no `tags.name`, compute `distanceMeters` via `haversine()`, sort ascending, cap at 10.

## Testing Strategy

- `haversine()` (`haversine.test.ts`): known distance between two real coordinate pairs (e.g. two London landmarks ~1km apart), asserted within a small tolerance; zero distance for identical points. TDD — genuinely new math logic.
- `rankPlaces()` (`rank.test.ts`): drops unnamed elements; sorts nearest-first; caps at 10 candidates from a fixture of 15; handles a `way` element (uses `.center.lat`/`.center.lon` instead of `.lat`/`.lon`). TDD.
- `nearbyPlacesQuerySchema` (`places.test.ts`): valid lat/lng; out-of-range lat (`> 90`) rejected; missing lat/lng rejected; `radiusMeters` defaults to `1000` when omitted.
- **Not unit-tested, verified manually instead** (same posture as every prior module): the Route Handler's actual Overpass call, and the browser geolocation permission flow itself (`getCurrentPosition()` can't be meaningfully unit-tested without mocking away the thing being verified). Manual pass: click "Find nearby landmarks" on a real machine, grant location, confirm a real ranked list of named landmarks near that location renders.

## Boundaries

- **Always:** call Overpass from the Route Handler, never the browser; require `requireUser()` on `/api/places/nearby` (defense against an open proxy, same rule as every protected route); trigger `getCurrentPosition()` only from a user action, never on mount; validate query params with `nearbyPlacesQuerySchema` before building the Overpass query string.
- **Ask first:** changing the Overpass tag set (`tourism`/`historic` — a real curation decision, not a mechanical one); adding a caching layer or a fallback Overpass mirror (currently an accepted risk per `ROADMAP.md`); changing the candidate cap (currently 10) or the default radius (currently 1000m).
- **Never:** call Overpass directly from a client component; auto-request geolocation on page load without a user gesture; add a paid geocoding/places API (Overpass/OSM only, per `ROADMAP.md`'s Tech Stack); cache Overpass responses (explicitly deferred).

## Success Criteria

- [ ] `GET /api/places/nearby` rejects unauthenticated requests
- [ ] `GET /api/places/nearby` returns `400` for missing/out-of-range `lat`/`lng`, before calling Overpass
- [ ] A valid request queries Overpass and returns a `places` array: named landmarks only, sorted nearest-first, capped at 10, each with `{ id, name, type, latitude, longitude, distanceMeters }`
- [ ] An Overpass failure (non-`200`) returns a clean `502` with the message "Couldn't find nearby landmarks. Try again." — not an unhandled crash
- [ ] `/places/nearby` renders a "Find nearby landmarks" button; clicking it triggers the browser's geolocation permission prompt (not on page load) and, on success, renders the ranked list
- [ ] `haversine()`, `rankPlaces()`, and `nearbyPlacesQuerySchema` all tested per the Testing Strategy above, TDD
- [ ] `pnpm build`/`lint`/`test` pass; CI green on the PR

## Open Questions

None blocking. One accepted risk, not silently dropped (per `ROADMAP.md`'s Tech Decisions): the public Overpass instance is rate-limited and occasionally flaky, with no caching or fallback mirror in this module. If it's actually hit in practice (not preemptively), revisit with a fallback mirror or a short-lived cache.
