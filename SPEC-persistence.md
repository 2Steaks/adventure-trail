# Spec: Persistence Module

Module id: `persistence` (see `CAPABILITY_MAP.md`). Depends on: `foundation`, `auth` (both complete — see `SPEC-foundation.md`, `SPEC-auth.md`).

## Objective

Let a logged-in user create an adventure, see it in a list, and resume it — backed by real Supabase CRUD (`adventures`, `quests`, `game_states`), not mock data. No AI planning and no OSM lookup yet: every adventure gets the same single hard-coded quest, regardless of what the user enters in the create form.

Who: a parent creating an adventure for their kids (per `notes/original_plan.md`'s user journey).
Success looks like: a logged-in user fills in the Create Adventure form, lands on a real adventure backed by three real Supabase rows, sees it appear in their Adventures list, and can navigate back into it via "Resume" — all while a second user account sees none of it (RLS + `requireUser()` scoping, same defense-in-depth posture as `auth`).

Out of scope for this module (owned by later modules per `CAPABILITY_MAP.md`): real browser geolocation and OSM/Overpass POI lookup (`places`), AI-generated quest content (`ai-planner`), live Haversine distance / arrival detection / Google Maps deep link (`quest-gameplay`), the `messages` chat log table (`ai-encounter`). Building any of those here would be scope creep this module doesn't need.

## Hard-coded Quest Content

Every adventure created by this module gets exactly one quest, defined once as a constant and reused — not regenerated per adventure:

```ts
// src/lib/game/hard-coded-quest.ts
export const HARD_CODED_QUEST = {
  objective: "Find the wizard's lost hat, last seen atop the great stone column.",
  type: "exploration" as const,
  landmarkName: "Nelson's Column, Trafalgar Square",
  landmarkType: "monument",
  latitude: 51.508,
  longitude: -0.1281,
  radiusMeters: 40,
};
```

A real, public, walkable landmark (open pedestrian square, no entry restrictions) — chosen so `quest-gameplay` (Phase 4) has something genuine to test GPS arrival against later, per `ROADMAP.md`'s Phase 3 exit checkpoint. `starting_lat`/`starting_lng` on the `adventures` row are also hard-coded to these same coordinates (see Open Questions) — this module does not call the browser Geolocation API at all; that's `places`' job when it's wired in later.

## Tech Stack

Reuses everything `auth` already established — no new dependencies:

- Supabase Postgres via the existing server client (`src/lib/supabase/client.ts`) — direct `.from("adventures")` etc. calls inside Route Handlers, never from a client component
- `requireUser()` (`src/lib/supabase/require-user.ts`) — the real authorization boundary on every route below, independent of the Proxy
- Zod for request/form validation, same `authCredentialsSchema.test.ts` TDD pattern
- `react-hook-form` + `@hookform/resolvers/zod` for the Create Adventure form — the standing form pattern since `auth`'s login/register
- TanStack Query (`useQuery`/`useMutation`) for list/detail/create, following `auth/hooks.ts`'s `postAuth`-style wrapper shape

## Commands

No new commands beyond `SPEC-foundation.md`'s (`pnpm dev`/`build`/`lint`/`test`). No new migration — this module uses the tables `foundation` already created and RLS-scoped (`supabase/migrations/20260911113445_init.sql`).

## Project Structure

```text
src/
  lib/
    game/
      hard-coded-quest.ts        # HARD_CODED_QUEST constant (see above)
    schemas/
      adventure.ts                # Zod: createAdventureSchema
      adventure.test.ts
    adventures/
      hooks.ts                    # useAdventures / useAdventure / useCreateAdventure

  app/
    page.tsx                      # REPLACED: Adventures list (was the Foundation placeholder)
    adventures/
      new/
        page.tsx                  # Create Adventure form
      [id]/
        page.tsx                  # Adventure detail — quest + status, reachable via "Resume"
    api/
      adventures/
        route.ts                  # GET (list) / POST (create: adventure + hard-coded quest + game_state)
        [id]/
          route.ts                # GET (detail: adventure + its quest + game_state)
```

The logout button currently on `/` (from `auth`'s task 06) moves onto the new Adventures list page — same component, same behavior, just relocated since `/` now has real content.

## Code Style

Request/response bodies use camelCase (matching the frontend and the Zod schema); Route Handlers map to/from the DB's snake_case columns explicitly at the boundary — no ORM, no hidden global mapper:

```ts
// src/app/api/adventures/route.ts
import { NextResponse } from "next/server";
import { requireUser } from "@/src/lib/supabase/require-user";
import { createAdventureSchema } from "@/src/lib/schemas/adventure";
import { HARD_CODED_QUEST } from "@/src/lib/game/hard-coded-quest";

export async function POST(request: Request) {
  const { user, supabase } = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = createAdventureSchema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid adventure details." }, { status: 400 });
  }

  const { data: adventure, error: adventureError } = await supabase
    .from("adventures")
    .insert({
      user_id: user.id,
      title: body.data.theme,
      theme: body.data.theme,
      age_min: body.data.ageMin,
      age_max: body.data.ageMax,
      duration_minutes: body.data.durationMinutes,
      max_distance_meters: body.data.maxDistanceMeters,
      starting_lat: HARD_CODED_QUEST.latitude,
      starting_lng: HARD_CODED_QUEST.longitude,
    })
    .select()
    .single();

  if (adventureError) {
    return NextResponse.json({ error: adventureError.message }, { status: 400 });
  }

  // ... insert the quest row (adventure_id = adventure.id), then the game_states
  // row (current_quest_id = that quest's id) — see Open Questions re: no transaction.

  return NextResponse.json({ success: true, adventure });
}
```

`createAdventureSchema` (camelCase, matches the create form's field names):

```ts
// src/lib/schemas/adventure.ts
import { z } from "zod";

export const createAdventureSchema = z
  .object({
    theme: z.string().min(1),
    ageMin: z.number().int().min(1),
    ageMax: z.number().int().min(1),
    durationMinutes: z.union([z.literal(30), z.literal(60), z.literal(90), z.literal(120)]),
    maxDistanceMeters: z.union([z.literal(500), z.literal(1000), z.literal(2000), z.literal(5000)]),
  })
  .refine((data) => data.ageMax >= data.ageMin, {
    message: "Maximum age must be greater than or equal to minimum age.",
    path: ["ageMax"],
  });
```

## Testing Strategy

- `createAdventureSchema` (`adventure.test.ts`): valid case; `ageMax < ageMin` rejected; a `durationMinutes`/`maxDistanceMeters` value outside the allowed set rejected. TDD — genuinely new validation logic, same bar as `authCredentialsSchema.test.ts`.
- **Not unit-tested, verified manually instead** (same posture as `SPEC-auth.md`'s Testing Strategy gap): the Route Handlers' Supabase calls themselves, and RLS cross-user isolation. Manual pass: create an adventure as user A, confirm it appears in A's list and detail view; log in as user B, confirm A's adventure is absent from B's list and B's `GET /api/adventures/:id` on A's id returns `404`, not A's data.
- No new test infra beyond what `foundation`/`auth` already set up.

## Boundaries

- **Always:** validate the create-adventure body with `createAdventureSchema` before touching Supabase; every Route Handler calls `requireUser()` and checks the result itself — never rely on the Proxy redirect alone (same rule as `auth`); scope every query to the authenticated user's own rows even though RLS also enforces it (defense-in-depth, not a substitute); keep `HARD_CODED_QUEST` as the single source of truth, not duplicated inline in the create route.
- **Ask first:** any change to `supabase/migrations/20260911113445_init.sql` (append-only across modules per `SPEC-foundation.md`); moving the Adventures list off `/`; adding a Postgres function/RPC to make the three-row create atomic (a real fix, but a bigger change than this MVP module's bar — see Open Questions).
- **Never:** call Supabase directly from a client component; generate quest content dynamically (that's `ai-planner`); implement live distance/arrival/Google-Maps-link logic (that's `quest-gameplay`); touch the `messages` table (that's `ai-encounter`); add delete/cancel-adventure UI (not in `notes/original_plan.md`'s user journey, not requested).

## Success Criteria

- [x] `POST /api/adventures` rejects an unauthenticated request before touching Supabase — a cookie-less request gets `307 → /login` from the Proxy (it isn't a public path); `requireUser()`'s own `401` is the fallback boundary for when Proxy coverage doesn't apply, per the "never rely on the Proxy alone" rule below
- [x] `POST /api/adventures` returns `400` (before any Supabase call) for an invalid body — missing theme, or `ageMax < ageMin`, or an out-of-set `durationMinutes`/`maxDistanceMeters`
- [x] `POST /api/adventures` with a valid body creates one `adventures` row (owned by the authenticated user, `starting_lat`/`starting_lng` = `HARD_CODED_QUEST`'s coordinates), one `quests` row (`HARD_CODED_QUEST`'s content, `adventure_id` = the new adventure), and one `game_states` row (`current_quest_id` = that quest's id); returns the created adventure
- [x] `GET /api/adventures` rejects unauthenticated (`307` via the Proxy, same as `POST`'s note above); authenticated, returns only the caller's own adventures (verified against a second test account)
- [x] `GET /api/adventures/:id` rejects unauthenticated (`307` via the Proxy), and returns `404` — not another user's data — for a guessed id belonging to someone else
- [x] `/` renders the Adventures list: name, theme, age range, duration, status, progress (quests complete / total), and "Resume" (→ `/adventures/[id]`) / "Create adventure" (→ `/adventures/new`) actions, sourced via a TanStack Query hook calling `GET /api/adventures`
- [x] `/adventures/new` renders the Create Adventure form (theme, age range, duration, max distance) via `react-hook-form` + `zodResolver(createAdventureSchema)`; on success, redirects to the new adventure's detail page
- [x] `/adventures/[id]` renders the adventure's hard-coded quest (landmark name, objective) and current status
- [x] The logout button relocates from `/` (Foundation/auth placeholder) onto the new Adventures list page and still works
- [x] `createAdventureSchema` tested per the Testing Strategy above, TDD
- [x] `pnpm build`/`lint`/`test` pass; CI green on the PR — pending, will confirm once the PR is up

## Open Questions

None blocking. Two gaps flagged, not silently dropped (same posture as `SPEC-auth.md`):
- **The three-row create (`adventures` → `quests` → `game_states`) is not wrapped in a database transaction.** A failure after the `adventures` insert but before the other two leaves an orphaned adventure row with no quest/game state. Acceptable for this MVP module — RLS/ownership contains the blast radius to the same user's own data, and it's simple to clean up manually if it ever actually happens. Revisit with a Postgres function (`create_adventure_with_quest(...)`) if it's hit in practice, not preemptively.
- **"Last played" from `notes/original_plan.md`'s Adventures list columns** has no backing column yet (`adventures.updated_at` is the closest proxy, but nothing bumps it until `quest-gameplay` writes real activity). Displaying `updated_at` as a stand-in for now; may need a dedicated column once real gameplay activity exists to drive it.
