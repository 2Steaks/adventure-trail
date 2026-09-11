# Implementation Plan: Quest Gameplay Module

Module id: `quest-gameplay` (see `CAPABILITY_MAP.md`, `SPEC-quest-gameplay.md`, `ROADMAP.md` Phase 4). Depends on: `persistence` (complete, merged). Deliberately not `ai-planner` — this module proves GPS/arrival mechanics against `persistence`'s hard-coded landmark first.
Tasks are tracked in the local-markdown tracker under `.scratch/quest-gameplay/issues/` (per `docs/agents/issue-tracker.md`) — this document is the plan; the checklist below is an index into those tracker items, not a duplicate.
Ships as its own `feat/quest-gameplay` PR per `ROADMAP.md`'s Delivery workflow.

## Overview

Smaller than `auth`/`persistence`, similar in shape to `places`: two independent pure primitives (a mechanical refactor + the arrival-check logic/schema), then one vertical slice that wires them into a live route, a hook, and an extension of `persistence`'s existing adventure detail page — not a new screen.

## Architecture Decisions

- **The geolocation-helper refactor is its own task, done first.** `checkArrival()` (task 02) doesn't depend on it, but the vertical slice (task 03) needs both — extracting the shared helper before task 03 starts means task 03's diff is pure feature work, not tangled up with a cross-module refactor.
- **`checkArrival()` + `arrivalCheckSchema` are bundled into one task** (unlike `places`, which split `haversine`+schema from `rankPlaces()`) — here both are small, neither depends on the other, and splitting them further would drop below a meaningful unit of work.
- **The vertical slice extends `persistence`'s `/adventures/[id]` page rather than adding a new route** — per `SPEC-quest-gameplay.md`'s Objective, "Resume" already lands there, and a second screen would fragment the one screen a player actually returns to.
- **TDD for both foundational tasks; the vertical slice is manual-only**, same posture as every prior module.

## Task List

Tracker items: `.scratch/quest-gameplay/issues/01`–`03`.

### Phase: Foundational primitives
- [x] [01 - Extract shared geolocation helper (refactor)](.scratch/quest-gameplay/issues/01-shared-geolocation-helper.md)
- [x] [02 - checkArrival() + arrivalCheckSchema (TDD)](.scratch/quest-gameplay/issues/02-arrival-check-and-schema.md)

### Checkpoint A — after 01-02
- [x] `pnpm test` passes — `places`' existing tests still green after the refactor, plus all new `arrival`/`schemas` tests (49/49)
- [x] `checkArrival()`'s boundary case (`distance === radiusMeters`) reviewed before task 03 wires it to a real DB write

### Phase: Vertical slice
- [x] [03 - Arrival vertical slice (route handler + hook + page extension)](.scratch/quest-gameplay/issues/03-arrival-vertical-slice.md)

### Checkpoint B — Quest Gameplay complete
- [x] Every `SPEC-quest-gameplay.md` Success Criteria box checked
- [x] Manual pass: far-away coordinates → `arrived: false`; in-radius coordinates → `arrived: true` + both status columns flip to `completed`, confirmed via a direct DB query; repeat call is idempotent; cross-user `404` confirmed
- [x] `pnpm build`/`lint`/`test` all pass
- [x] CI green on the PR — [PR #13](https://github.com/2Steaks/dungeon-master-ai/pull/13) passed lint/test/build
- [x] Human reviews and merges — PR #13 merged to `main` (`56552aa`)

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Vercel Deployment Protection blocks a real phone from reaching a preview URL at all | Med | Flagged as a manual, human-only step in `SPEC-quest-gameplay.md`'s Open Questions — not automatable from here; real on-device GPS testing stays unproven until it's done |
| The refactor (task 01) subtly changes `places`' geolocation error behavior | Low | Task 01 is a pure move with an explicit acceptance criterion that `useNearbyPlaces()`'s behavior is unchanged; `places`' existing tests gate it |
| A concurrent/duplicate arrival-check request double-writes the completion status | Low | The route checks `quest.status !== "completed"` before writing — a second request after completion is a no-op read, not a second write |

## Open Questions

None blocking (see `SPEC-quest-gameplay.md`'s Open Questions for the Vercel Deployment Protection manual step).
