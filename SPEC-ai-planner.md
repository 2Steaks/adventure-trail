# Spec: AI Adventure Planner Module

Module id: `ai-planner` (see `CAPABILITY_MAP.md`, `ROADMAP.md` Phase 5). Depends on: `persistence`, `places` (both complete, merged). Runs on top of the already-proven `quest-gameplay` mechanics (Phase 4) without changing them.

## Objective

Replace `persistence`'s hard-coded quest with a real, LLM-generated adventure — grounded in real nearby landmarks (`places`), constrained so the model can never invent a location, and only ever persisted once a valid plan exists.

Who: a parent creating an adventure for their kids, now getting a real plan instead of always the same Trafalgar Square quest.
Success looks like `ROADMAP.md`'s Phase 5 exit checkpoint: creating an adventure with a real location produces an LLM-generated title + quest sequence referencing only supplied landmarks, validated and stored; the Phase 4 walk-to-arrival loop now works against a real, AI-selected landmark.

Out of scope: the Encounter Generator (`ai-encounter`, Phase 6) and anything about in-quest LLM interaction — this module only runs once, at adventure creation.

## Tech Stack

New dependencies: `ai` (Vercel AI SDK) and `@ai-sdk/anthropic`.

- **`generateText` with an `Output.object()` output spec** (a Zod schema as the contract, `adventurePlanSchema`) — the LLM's raw output is never trusted past shape validation. Not `generateObject`: confirmed deprecated in the installed `ai` SDK version (7.0.97) via its own type declarations.
- **`claude-opus-5`** — the "stronger" model `ROADMAP.md` calls for; runs once per adventure, quality-sensitive, latency tolerance is high.
- **Direct `@ai-sdk/anthropic` wiring**, not the AI Gateway — matches `ROADMAP.md`'s explicit decision. `createAnthropic({ apiKey: process.env.ANTHROPIC })` reads the existing `ANTHROPIC` env var explicitly (already funded, confirmed present in `.env`) — this project already reads `SUPABASE_URL`/`SUPABASE_PUBLISHABLE_KEY` explicitly rather than relying on library-default env var names, and this follows the same precedent rather than requiring a rename to the SDK's default `ANTHROPIC_API_KEY`.
- Reuses `places`' Overpass query + `rankPlaces()` — extracted into a shared `fetchNearbyPlaces()` (see Project Structure), since it's now called from two routes, not duplicated.

## Commands

No new commands beyond `SPEC-foundation.md`'s (`pnpm dev`/`build`/`lint`/`test`). New deps: `pnpm add ai @ai-sdk/anthropic`. No new migration.

## Project Structure

```text
src/
  lib/
    ai/
      client.ts                   # createAnthropic({ apiKey: process.env.ANTHROPIC })
      planner.ts                   # generateAdventurePlan(input) -> plan | throws AdventurePlanError
      planner.test.ts               # validateLocationIds() only (see Testing Strategy) — not the LLM call itself
    places/
      fetch-nearby-places.ts       # EXTRACTED from api/places/nearby/route.ts: fetchNearbyPlaces({lat,lng,radiusMeters}) -> Place[]
    schemas/
      adventure.ts                 # EXTENDED: createAdventureSchema gains startingLat/startingLng
      adventure-plan.ts             # Zod: adventurePlanSchema { title, quests: [{ locationId, objective, type }] }
      adventure-plan.test.ts

  app/
    api/
      places/
        nearby/
          route.ts                 # UPDATED: delegates to fetchNearbyPlaces() instead of inlining the Overpass call
      adventures/
        route.ts                   # REWRITTEN POST: real geolocation -> fetchNearbyPlaces() -> generateAdventurePlan() -> persist
    adventures/
      new/
        page.tsx                    # UPDATED: submit handler gets the user's position first (still user-gesture-triggered — the submit click itself), then posts
```

`src/lib/game/hard-coded-quest.ts` is deleted — its only consumer (the old `POST /api/adventures`) no longer exists.

## Code Style

`generateAdventurePlan()` is the one bounded-retry orchestration point — the Route Handler stays thin, delegating to it and to `fetchNearbyPlaces()` rather than inlining either:

```ts
// src/lib/ai/planner.ts
// generateObject is deprecated in the installed `ai` SDK version (7.0.97) —
// confirmed via node_modules' own type declarations, not assumed from training
// data (per this repo's source-driven-development convention). generateText
// with an Output.object() output spec is the current replacement.
import { generateText, Output } from "ai";
import { anthropic } from "@/src/lib/ai/client";
import { adventurePlanSchema, type AdventurePlan } from "@/src/lib/schemas/adventure-plan";
import type { Place } from "@/src/lib/places/rank";

export class AdventurePlanError extends Error {}

type PlannerInput = {
  theme: string;
  ageMin: number;
  ageMax: number;
  durationMinutes: number;
  locations: Place[];
};

function invalidLocationIds(plan: AdventurePlan, locations: Place[]): string[] {
  const validIds = new Set(locations.map((l) => l.id));
  return plan.quests
    .map((q) => q.locationId)
    .filter((id) => !validIds.has(id));
}

async function requestPlan(input: PlannerInput, correction?: string) {
  const { output } = await generateText({
    model: anthropic("claude-opus-5"),
    prompt: buildPrompt(input, correction),
    output: Output.object({ schema: adventurePlanSchema }),
  });
  return output;
}

export async function generateAdventurePlan(
  input: PlannerInput,
): Promise<AdventurePlan> {
  const first = await requestPlan(input);
  const firstInvalid = invalidLocationIds(first, input.locations);
  if (firstInvalid.length === 0) return first;

  const retry = await requestPlan(
    input,
    `Your previous response used locationId(s) not in the supplied list: ${firstInvalid.join(", ")}. You may only use the ids given.`,
  );
  const retryInvalid = invalidLocationIds(retry, input.locations);
  if (retryInvalid.length === 0) return retry;

  throw new AdventurePlanError(
    `Adventure Planner produced invalid locationIds twice: ${retryInvalid.join(", ")}`,
  );
}
```

`adventurePlanSchema` mirrors `notes/original_plan.md`'s Adventure Planner contract exactly:

```ts
// src/lib/schemas/adventure-plan.ts
import { z } from "zod";

export const adventurePlanSchema = z.object({
  title: z.string().min(1),
  quests: z
    .array(
      z.object({
        locationId: z.string().min(1),
        objective: z.string().min(1),
        type: z.enum(["riddle", "exploration", "discovery"]),
      }),
    )
    .min(1),
});

export type AdventurePlan = z.infer<typeof adventurePlanSchema>;
```

## Testing Strategy

- `invalidLocationIds()` (`planner.test.ts`): returns `[]` when every `locationId` is valid; returns the offending ids when one or more aren't; empty `quests` never happens (schema enforces `.min(1)`) so not tested as a case. TDD — this is the actual game-rule check per `ROADMAP.md`'s "Location ID validation," same bar as `checkArrival()`.
- `adventurePlanSchema` (`adventure-plan.test.ts`): valid shape accepted; empty `quests` array rejected; an invalid `type` value rejected — same pattern as every other schema in this codebase.
- **Not unit-tested, verified manually instead** (same posture as every prior module, now with a real cost attached): the actual `generateText`/`Output.object()` call, the retry behavior against a real model, and the full create-adventure flow end to end. Manual pass: create an adventure with a real location, confirm the persisted title/quests reference only real supplied landmarks, confirm `quest-gameplay`'s existing arrival flow works unmodified against the AI-selected first quest.

## Boundaries

- **Always:** validate every `locationId` in application code against the actual candidate list — never trust the model's own claim that its output is grounded; retry exactly once with the specific validation error fed back, then fail explicitly (no silent partial adventure, no infinite retry loop); create zero DB rows if planning fails — don't insert an adventure and then discover the plan is bad.
- **Ask first:** changing the model (`claude-opus-5`) or switching to the AI Gateway; changing the one-retry policy; changing the Overpass tag set (already gated by `places`' own Boundaries); any change to `adventurePlanSchema`'s shape (it's the actual contract between this module and the LLM).
- **Never:** trust a client-submitted candidate list instead of re-deriving it server-side; let the LLM decide whether the player has arrived (that's `checkArrival()`'s job, unchanged); ask the LLM to validate its own `locationId`s (real code does that); add a fallback/mock LLM provider — a real, funded Anthropic key is required, per `ROADMAP.md`.

## Success Criteria

- [x] `POST /api/adventures` rejects unauthenticated requests, same as before
- [x] `POST /api/adventures` returns `400` for an invalid body (now including missing/out-of-range `startingLat`/`startingLng`), before calling Overpass or the LLM
- [x] A valid request with no nearby landmarks found returns a clear `502`-class error — no adventure row created (verified live with ocean coordinates)
- [ ] A valid request generates a real plan via `generateText`/`Output.object()`, validates every `locationId` against the real candidate list, retries once on an invalid result, and fails explicitly (no DB writes) if the retry also fails — **implemented, live verification deferred** (see Open Questions)
- [ ] A successful plan persists one `adventures` row, one `quests` row per generated quest (not just one), and one `game_states` row with `current_quest_id` = the first quest's id — **implemented, live verification deferred**
- [ ] `quest-gameplay`'s existing `/adventures/[id]` page and arrival flow work unmodified against an AI-generated quest — **not yet exercised against a real AI-generated quest**, deferred
- [x] `invalidLocationIds()` and `adventurePlanSchema` tested per the Testing Strategy above, TDD
- [x] `HARD_CODED_QUEST` and its only consumer are removed — no dead code left behind
- [x] `pnpm build`/`lint`/`test` pass; CI green on the PR — pending, will confirm once the PR is up

## Open Questions

None blocking implementation. **Live verification is deferred to a later stage, by explicit request** — the one attempt made hit a real Anthropic account usage limit (`AI_APICallError`, resets 2026-10-01), a billing/account block rather than a code bug. `generateAdventurePlan()` and the full create-adventure flow are implemented and pass typecheck/lint/unit tests/code review, but `generateAdventurePlan()` has never actually been proven against a real model response, and neither has the retry path. This is a tracked, explicit gap: re-run the live verification described in this spec's Testing Strategy before treating this module as done, not something to quietly forget once the code merges.
