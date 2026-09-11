# Implementation Plan: AI Adventure Planner Module

Module id: `ai-planner` (see `CAPABILITY_MAP.md`, `SPEC-ai-planner.md`, `ROADMAP.md` Phase 5). Depends on: `persistence`, `places` (both complete, merged). Runs on top of `quest-gameplay`'s already-proven mechanics without changing them.
Tasks are tracked in the local-markdown tracker under `.scratch/ai-planner/issues/` (per `docs/agents/issue-tracker.md`) — this document is the plan; the checklist below is an index into those tracker items, not a duplicate.
Ships as its own `feat/ai-planner` PR per `ROADMAP.md`'s Delivery workflow.

## Overview

The first module with a real per-call cost: every live Anthropic API call during implementation and verification is billed. The plan is sequenced specifically around that — all free/pure logic (schema, validation, the Overpass-extraction refactor) is fully built and tested first, so the one task that makes the first live LLM call (task 04) is debugging *only* the LLM integration itself, not also chasing schema or validation bugs at the same time. The final vertical slice (task 05) then reuses an already-proven planner function, keeping its own live-call count small.

## Architecture Decisions

- **Four small foundational tasks (01–04), not two.** Unlike `places`/`quest-gameplay`'s two-task foundational phase, this module splits further because task 04 (the first live LLM call) needs to stand alone — bundling it with any of 01–03 would mean a failed live call could be masked by (or confused with) a schema/refactor bug in the same task.
- **`generateAdventurePlan()`'s retry logic is verified with a small number of deliberate live calls, not a full test matrix.** The retry path itself (feeding a validation error back into the prompt) can't be reliably *forced* on demand against a real model — `invalidLocationIds()`'s own unit tests (task 01) already prove the validation logic is correct; the live call only needs to prove the plumbing (the SDK call, the schema-as-contract, one retry attempt) actually works end to end.
- **`fetchNearbyPlaces()` extraction (task 03) is sequenced before the live-call task (04) even though it's unrelated to Anthropic** — it's free (Overpass, not billed) and mechanical, so there's no reason to interleave it after the point where live-call budget starts mattering.
- **The vertical slice (task 05) creates zero DB rows on any failure path** (no candidates, planner failure) — per `SPEC-ai-planner.md`'s Boundaries, cleaner than needing a rollback since nothing is written until a valid plan exists.

## Task List

Tracker items: `.scratch/ai-planner/issues/01`–`05`.

### Phase: Free, pure primitives (zero API cost)
- [ ] [01 - adventurePlanSchema + invalidLocationIds() (TDD)](.scratch/ai-planner/issues/01-adventure-plan-schema-and-validation.md)
- [ ] [02 - Extend createAdventureSchema with startingLat/startingLng (TDD)](.scratch/ai-planner/issues/02-extend-create-adventure-schema.md)
- [ ] [03 - Extract fetchNearbyPlaces() (refactor)](.scratch/ai-planner/issues/03-extract-fetch-nearby-places.md)

### Checkpoint A — after 01-03
- [ ] `pnpm test` passes — all new schema/validation tests, `places`' existing tests still green after the refactor
- [ ] No live Anthropic calls made yet; nothing billed so far

### Phase: First live integration
- [ ] [04 - Wire generateAdventurePlan() against a real Anthropic call](.scratch/ai-planner/issues/04-wire-generate-adventure-plan.md)

### Checkpoint B — after 04
- [ ] `generateAdventurePlan()` proven against at least one real, live call
- [ ] Live-call count for this checkpoint stayed small and deliberate — reviewed before task 05 starts making its own live calls on top

### Phase: Vertical slice
- [ ] [05 - Real AI-planned Create Adventure (vertical slice)](.scratch/ai-planner/issues/05-create-adventure-vertical-slice.md)

### Checkpoint C — AI Planner complete
- [ ] Every `SPEC-ai-planner.md` Success Criteria box checked
- [ ] Manual pass: one real end-to-end adventure creation, confirmed via a direct DB query; `quest-gameplay`'s arrival flow confirmed working unmodified against the AI-generated quest; failure paths (no candidates, invalid body) confirmed without needing a live LLM call
- [ ] `pnpm build`/`lint`/`test` all pass
- [ ] CI green on the PR
- [ ] Human reviews and merges

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Live Anthropic calls cost real money; exploratory debugging could run up an unexpected bill | Med | Free/pure logic built and tested first (tasks 01–03); live calls confined to tasks 04–05 and kept deliberately small in number, not looped |
| `generateObject`'s retry path is hard to force live, so it might ship under-tested | Low | `invalidLocationIds()` itself is fully unit-tested (task 01) — the live call only needs to prove the SDK plumbing works, not re-prove logic already covered |
| The multi-quest persistence (task 05) breaks something in `quest-gameplay` that assumed one quest | Low | Already mitigated — `quest-gameplay`'s arrival route resolves the current quest via `game_states.current_quest_id`, specifically designed for this |
| `ANTHROPIC` env var missing in a deployed environment (Vercel preview/production) | Med | **Confirmed via `vercel env ls`: not set on Vercel at all** (only `SUPABASE_URL`/`SUPABASE_PUBLISHABLE_KEY` exist there, across Development/Preview/Production). Local `pnpm dev` will work throughout implementation; the live Vercel preview will not, until this is added — same class of gap `auth` hit once before (`SPEC-foundation.md`'s Vercel env-vars history). Not blocking implementation, but blocking a real preview-URL exit-checkpoint verification. |

## Open Questions

None blocking local implementation. **Confirmed gap, not yet fixed:** the `ANTHROPIC` env var needs to be added to the Vercel project (Development/Preview/Production, matching how `SUPABASE_URL`/`SUPABASE_PUBLISHABLE_KEY` are already set up) — `vercel env add ANTHROPIC` — before this module can be exercised on a live preview/production deployment, not just local dev. This is a decision for you (adding a secret is a real action on shared infra), not something to do silently.
