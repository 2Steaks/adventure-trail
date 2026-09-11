# Implementation Plan: AI Encounter Module

Module id: `ai-encounter` (see `CAPABILITY_MAP.md`, `SPEC-ai-encounter.md`, `ROADMAP.md` Phase 6). Depends on: `quest-gameplay`, `ai-planner` (both complete, merged).
Tasks are tracked in the local-markdown tracker under `.scratch/ai-encounter/issues/` (per `docs/agents/issue-tracker.md`) — this document is the plan; the checklist below is an index into those tracker items, not a duplicate.
Ships as its own `feat/ai-encounter` PR per `ROADMAP.md`'s Delivery workflow.

## Overview

The second module with real per-call Anthropic cost, so the same sequencing principle from `ai-planner` applies: build and test every free/pure piece first (output schema, action validator, the `GET` extension, the flavor-only choice endpoint), then isolate the first live LLM call into its own task, then ship the vertical slice on top of an already-proven `generateEncounter()`. Unlike `ai-planner`, this module also has to fix a latent gap in `persistence`'s original `GET /api/adventures/:id` — it never returned `game_states`, so the detail page has been silently guessing the current quest as `quests[0]` instead of `game_states.current_quest_id`. That fix is pulled forward into task 02, before any encounter logic depends on it.

## Architecture Decisions

- **`GET /api/adventures/:id`'s `game_states` gap is fixed as its own task (02), not folded into the vertical slice (05).** It's a pure additive extension to an existing route with no LLM involvement — sequencing it early means task 05 can assume "current quest" is always correct, rather than debugging quest-selection and encounter-generation bugs at the same time.
- **The choice-tap endpoint (03) ships before the live-call task (04)** even though it depends on nothing task 04 produces — it's free (no Anthropic call) and mechanical, same reasoning `ai-planner` used to sequence `fetchNearbyPlaces()` before its live-call task.
- **`generateEncounter()`'s retry path (04) is verified with a small number of deliberate live calls, not a full test matrix** — same posture as `ai-planner`'s task 04: `validateEncounterActions()`'s own unit tests (task 01) already prove the validation logic; the live call only needs to prove the SDK plumbing (the call, the schema-as-contract, one retry) works end to end.
- **`ADD_ITEM`'s inventory write is a plain application-code read-modify-write**, not a Postgres function — per `SPEC-ai-encounter.md`'s Resolved Decisions, consistent with this project's other accepted-risk shortcuts.
- **No new Wizard states.** The existing six (`idle`, `thinking`, `quest-available`, `waiting`, `quest-completed`, `unexpected-event`) already cover this module (see `SPEC-ai-encounter.md`'s Wizard State Mapping) — task 05 is wiring, not a `Wizard.tsx` redesign.

## Task List

Tracker items: `.scratch/ai-encounter/issues/01`–`05`.

### Phase: Free, pure primitives (zero API cost)
- [x] [01 - encounterOutputSchema + validateEncounterActions() (TDD)](.scratch/ai-encounter/issues/01-encounter-schema-and-validation.md)
- [x] [02 - Extend GET /api/adventures/:id with game_states (fix current-quest gap)](.scratch/ai-encounter/issues/02-extend-adventure-detail-with-game-state.md) — implemented; live confirmation of the actual `gameState` payload deferred, see ticket
- [x] [03 - POST /api/adventures/:id/choice (flavor-only message, no LLM)](.scratch/ai-encounter/issues/03-choice-endpoint.md) — implemented; live confirmation against a real adventure deferred, see ticket

### Checkpoint A — after 01-03
- [x] `pnpm test` passes (73/73) — all new schema/validation tests, `persistence`/`quest-gameplay`'s existing tests still green after the `GET` extension
- [x] No live Anthropic calls made yet; nothing billed so far
- [ ] Manual: `GET /api/adventures/:id` now returns `gameState.currentQuestId`/`gameState.inventory` for an existing adventure, confirmed against a real row — **deferred**: no existing test adventure and no DB/service-role access this session; creating one requires the same live-billed Adventure Planner call blocked by `ai-planner`'s usage limit (resets 2026-10-01). Unauthenticated-request behavior (`307`) was confirmed live instead.

### Phase: First live integration
- [x] [04 - Wire generateEncounter() against a real Anthropic call](.scratch/ai-encounter/issues/04-wire-generate-encounter.md) — implemented; live verification deferred, see below

### Checkpoint B — after 04
- [ ] `generateEncounter()` proven against at least one real, live call — **confirmed deferred**: the one attempt made hit the same Anthropic account usage limit `ai-planner` hit (`AI_APICallError`, resets 2026-10-01 at 00:00 UTC) — a billing/account block, not a code bug. Live verification of task 04 and task 05's end-to-end flow moves to after that date; implementation of task 05 proceeds on typecheck/lint/unit-test/code-review confidence alone, same as `ai-planner`. **Re-verify live before treating this module as done.**
- [x] Live-call count for this checkpoint stayed small and deliberate (one attempt, no retry-looping to work around the limit)

### Phase: Vertical slice
- [x] [05 - Real AI-narrated encounter (vertical slice)](.scratch/ai-encounter/issues/05-encounter-vertical-slice.md) — implemented; live confirmation deferred, see ticket

### Checkpoint C — AI Encounter complete
- [ ] Every `SPEC-ai-encounter.md` Success Criteria box checked — **not yet: the live-dependent boxes (wrong-owner `404`, no-current-quest `409` live, full encounter flow) are deferred, see Checkpoint B**
- [x] Failure paths not needing a live LLM call (unauthenticated on `arrival`/`choice`/`encounter`) confirmed live
- [ ] Manual pass: one real end-to-end encounter (arrive → talk to Wizard → AI message + choices → objective completed → next quest, or adventure completed on the last quest) — **deferred, same dependency as Checkpoint B**
- [x] `pnpm build`/`lint`/`test` all pass (73/73 tests; production build compiles)
- [ ] CI green on the PR — pending, will confirm once pushed
- [ ] Human reviews and merges — **outstanding**

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Same Anthropic account usage limit that blocked `ai-planner`'s live verification (resets 2026-10-01) is likely still in effect | Med | Free/pure logic and all non-LLM routes built and tested first (tasks 01–03); if task 04 hits the same limit, defer live verification explicitly (Checkpoint B) rather than stalling the module, exactly as `ai-planner` did |
| `game_states.inventory`'s application-code read-modify-write has a race window under concurrent requests | Low | Accepted per `SPEC-ai-encounter.md`'s Resolved Decisions — single player per adventure, no concurrent-tab story anywhere else in the codebase; revisit only if actually hit |
| Advancing `game_states.current_quest_id` picks the wrong "next" quest if two quests share a `position` | Low | `quests.position` is assigned sequentially by `ai-planner`'s insert (task 05 of that module) — no known path produces duplicates; "next pending quest by position" is unambiguous given that invariant |
| Detail page's existing `quests[0]` current-quest guess (a latent bug predating this module) silently breaks something else that assumed it | Low | Task 02 fixes it before task 05 builds on it; `quest-gameplay`'s arrival route already resolves the current quest independently via `game_states.current_quest_id`, so it's unaffected either way |

## Open Questions

None blocking local implementation. Same confirmed infra gap as `ai-planner` applies here too: the `ANTHROPIC` env var still needs adding to the Vercel project (Development/Preview/Production) before this module can be exercised on a live preview/production deployment — not re-litigated here, tracked once in `ai-planner`'s plan.
