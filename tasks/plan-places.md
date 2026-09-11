# Implementation Plan: Places Module

Module id: `places` (see `CAPABILITY_MAP.md`, `SPEC-places.md`, `ROADMAP.md` Phase 3). Depends on: `foundation` (complete). Independent of `persistence` (also complete, merged) — reuses its `fetchJson()` helper but has no other coupling.
Tasks are tracked in the local-markdown tracker under `.scratch/places/issues/` (per `docs/agents/issue-tracker.md`) — this document is the plan; the checklist below is an index into those tracker items, not a duplicate.
Ships as its own `feat/places` PR per `ROADMAP.md`'s Delivery workflow.

## Overview

Smaller than `auth`/`persistence`: one real vertical slice (find nearby landmarks) sitting on top of two pure, independently testable primitives. The plan builds the primitives first — `haversine()` (shared with `quest-gameplay` later) and the query schema, then the filter/rank logic that depends on `haversine()` — before the single vertical slice that wires them into a live Overpass call, a hook, and a demo page.

## Architecture Decisions

- **Two foundational tasks, not one, despite both being small.** `haversine()` + the query schema (task 01) and `rankPlaces()` (task 02) are kept separate because `rankPlaces()` depends on `haversine()` — task 02 needs task 01 done and reviewed first, and bundling them would blur that dependency and push task 01 past a clean 2-file-pair-per-concern shape.
- **One vertical slice, not three.** Unlike `auth` (register/login/logout) or `persistence` (create/list/detail), `places` has exactly one user-facing capability in this module — there's nothing to slice further without going below a meaningful unit of work.
- **`fetchJson()` reused from `persistence`**, not reimplemented — it already does the right thing (content-type-checked JSON parsing with a clean error), and this module's Route Handler is protected the same way `persistence`'s are, so the same failure mode (session-expiry redirect) applies here too.
- **TDD for both foundational tasks; the vertical slice is manual-only**, same posture as every prior module — the Route Handler is thin wiring around already-tested logic, and the geolocation permission flow can't be meaningfully unit-tested without mocking away the thing being verified.

## Task List

Tracker items: `.scratch/places/issues/01`–`03`.

### Phase: Foundational primitives
- [x] [01 - Haversine distance + nearby-places query schema (TDD)](.scratch/places/issues/01-haversine-and-query-schema.md)
- [x] [02 - rankPlaces() filter/rank logic (TDD)](.scratch/places/issues/02-rank-places.md)

### Checkpoint A — after 01-02
- [x] `pnpm test` passes with all new tests (haversine, schema, rankPlaces)
- [x] `rankPlaces()` reviewed against a hand-checked fixture before task 03 wires it to a live Overpass response

### Phase: Vertical slice
- [x] [03 - Nearby places vertical slice (route handler + hook + demo page)](.scratch/places/issues/03-nearby-places-slice.md)

### Checkpoint B — Places complete
- [x] Every `SPEC-places.md` Success Criteria box checked
- [x] Manual pass: unauthenticated `curl` rejected; valid request against real coordinates returned real Trafalgar Square landmarks; the literal browser click-and-grant-permission interaction was **not** driven end-to-end — no browser automation available this session, flagged rather than claimed
- [x] `pnpm build`/`lint`/`test` all pass
- [x] CI green on the PR — [PR #11](https://github.com/2Steaks/dungeon-master-ai/pull/11) passed lint/test/build
- [x] Human reviews and merges — PR #11 merged to `main` (`94d557a`), including a follow-up `createOverpassQuery()` extraction pushed to the branch before merge

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Public Overpass instance is rate-limited/flaky | Med | Accepted risk per `ROADMAP.md` — clean `502` + retry message, no caching/fallback built; revisit only if actually hit |
| Overpass tag set (`tourism`/`historic`) misses or over-includes landmark types | Low | `SPEC-places.md`'s Boundaries gate any tag-set change behind an explicit ask — not something to silently tune during implementation |
| Geolocation permission denied by the browser/OS | Low | Demo page shows a clear error state per `SPEC-places.md`'s Success Criteria — not a hard blocker, just an expected user path |

## Open Questions

None blocking (see `SPEC-places.md`'s Open Questions for the one accepted risk: no Overpass caching/fallback).
