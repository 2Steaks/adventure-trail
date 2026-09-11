# Spec: Quest Gameplay Module

Module id: `quest-gameplay` (see `CAPABILITY_MAP.md`, `ROADMAP.md` Phase 4). Depends on: `persistence` (complete, merged). Deliberately not on `ai-planner` — this module proves the GPS/arrival mechanics against `persistence`'s hard-coded landmark first, independent of any LLM output-validation risk (per `ROADMAP.md`'s Decision log).

## Objective

Let a player at the hard-coded landmark (Nelson's Column, Trafalgar Square) check their real-world distance to it, get there via Google Maps, and have the backend — not the client, and never an LLM — confirm arrival.

Who: a parent/kid physically walking toward the quest's landmark (per `notes/original_plan.md`'s Gameplay section).
Success looks like `ROADMAP.md`'s Phase 4 exit checkpoint: *Create (hard-coded) → landmark → Maps → walk → distance changes → arrive.*

Out of scope for this module: any AI-generated content (`ai-planner`), a live map UI (`notes/original_plan.md` explicitly says "No map UI"), multi-quest advancement (only one hard-coded quest exists per adventure until `ai-planner` ships), continuous background location tracking.

## Tech Stack

No new dependencies:

- Browser `navigator.geolocation.getCurrentPosition()` — **one-shot per user tap**, not continuous `watchPosition()`. Reuses the same one-shot pattern `places` already established (simpler lifecycle, no watch/cleanup surface, consistent with this project's bare-bones-MVP posture so far).
- The shared `haversine()` (`src/lib/geo/haversine.ts`, from `places`) for both the live client-side distance readout and the server-side arrival check.
- `requireUser()` — this module's Route Handler is protected like every other one.
- TanStack Query (`useMutation`) + `fetchJson()` (from `persistence`).

**Refactor carried in from `places`:** its `getCurrentPosition()` wrapper (Promise-ify + timeout + friendly error-code mapping) moves from `src/lib/places/hooks.ts` into `src/lib/geo/geolocation.ts`, since it's now known to be needed by two modules, not duplicated. `places/hooks.ts` imports it from there afterward.

## Commands

No new commands beyond `SPEC-foundation.md`'s (`pnpm dev`/`build`/`lint`/`test`). No new migration — reuses `quests.status` and `adventures.status`, already columns on the existing tables.

## Project Structure

```text
src/
  lib/
    geo/
      haversine.ts                # existing, from places
      geolocation.ts               # MOVED here from places/hooks.ts: getCurrentPosition()
      geolocation.test.ts           # error-mapping behavior, if not already covered
    game/
      hard-coded-quest.ts          # existing, from persistence
      arrival.ts                    # checkArrival(origin, quest) -> { distanceMeters, arrived }
      arrival.test.ts
    schemas/
      arrival.ts                    # Zod: arrivalCheckSchema { latitude, longitude }
      arrival.test.ts
    game-hooks/
      hooks.ts                      # useCheckArrival(adventureId)

  app/
    adventures/
      [id]/
        page.tsx                    # EXTENDED (not replaced): "Check My Distance" button,
                                      # distance readout, Google Maps link, arrival state
    api/
      adventures/
        [id]/
          arrival/
            route.ts                # POST — requireUser(), checkArrival(), persists on arrival
```

## Code Style

The Route Handler recomputes distance itself from the submitted coordinates and the quest's own stored lat/lng/radius — it never trusts a client-submitted "arrived" claim:

```ts
// src/app/api/adventures/[id]/arrival/route.ts
import { NextResponse } from "next/server";
import { requireUser } from "@/src/lib/supabase/require-user";
import { arrivalCheckSchema } from "@/src/lib/schemas/arrival";
import { checkArrival } from "@/src/lib/game/arrival";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, supabase } = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = arrivalCheckSchema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid location." }, { status: 400 });
  }

  const { data: quest } = await supabase
    .from("quests")
    .select("*")
    .eq("adventure_id", id)
    .maybeSingle();
  // ... 404 if quest or adventure isn't found/owned (same ownership check as
  // persistence's detail route) ...

  const result = checkArrival(body.data, quest);

  if (result.arrived && quest.status !== "completed") {
    await supabase.from("quests").update({ status: "completed" }).eq("id", quest.id);
    await supabase.from("adventures").update({ status: "completed" }).eq("id", id);
  }

  return NextResponse.json(result);
}
```

`checkArrival()`'s contract: pure, no I/O — `{ distanceMeters: haversine(origin, quest), arrived: distanceMeters <= quest.radiusMeters }`.

## Testing Strategy

- `checkArrival()` (`arrival.test.ts`): `arrived: true` when within radius; `arrived: false` when outside; boundary case at exactly `radiusMeters`. TDD — this is "the real arrival boundary," the game-rule check `ROADMAP.md` explicitly names as needing a test, same bar as `haversine()` itself.
- `arrivalCheckSchema` (`schemas/arrival.test.ts`): valid lat/lng; out-of-range rejected; missing rejected — same pattern as `nearbyPlacesQuerySchema`.
- **Not unit-tested, verified manually instead** (same posture as every prior module): the Route Handler's Supabase calls, ownership scoping, and the actual browser geolocation tap-to-check flow.

## Boundaries

- **Always:** recompute distance server-side from the submitted coordinates and the quest's own stored data — never trust a client-submitted `arrived` value; scope the arrival route to the caller's own adventure (`404` otherwise, same as `persistence`'s detail route); make the completion write idempotent (calling again after completion doesn't error or re-trigger); request geolocation only from a user tap, never on page mount.
- **Ask first:** switching to continuous `watchPosition()` (explicitly deferred by this spec); adding any map UI (`notes/original_plan.md` says no map UI); changing what "arrived" means beyond the `distance <= radiusMeters` rule.
- **Never:** ask an LLM whether the player arrived; implement multi-quest advancement (out of scope until `ai-planner`); add a paid maps/directions API (a plain Google Maps deep-link URL needs no key).

## Success Criteria

- [ ] `POST /api/adventures/:id/arrival` rejects unauthenticated requests
- [ ] `POST /api/adventures/:id/arrival` returns `404` for another user's adventure id
- [ ] Coordinates far from the quest return `{ arrived: false }` with a real `distanceMeters`
- [ ] Coordinates within `quest.radiusMeters` return `{ arrived: true }`, and persist `quests.status = 'completed'` + `adventures.status = 'completed'`
- [ ] Calling the route again after completion is idempotent — no error, no duplicate write
- [ ] `/adventures/[id]` renders a "Check My Distance" button (geolocation prompt fires only on tap), shows the returned distance, links to Google Maps for the quest's coordinates, and shows an arrival celebration state once `arrived: true`
- [ ] `checkArrival()` and `arrivalCheckSchema` tested per the Testing Strategy above, TDD
- [ ] `pnpm build`/`lint`/`test` pass; CI green on the PR

## Open Questions

None blocking. One manual, human-only step this module's real-device verification depends on (per `ROADMAP.md`'s Phase 4 key risk): **Vercel Deployment Protection needs to be disabled for Preview deployments** (Vercel dashboard → Project Settings → Deployment Protection) before a logged-out phone browser can reach a preview URL at all — no CLI path exists for this setting, confirmed via `vercel project inspect`, so it's a dashboard-only step for you, not something automatable here. Until that's done (or as an alternative), on-device GPS verification of this module stays unproven the same way `places`' browser-permission flow did — flagged, not silently skipped.
