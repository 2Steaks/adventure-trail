# Implementation Plan: Persistence Module

Module id: `persistence` (see `CAPABILITY_MAP.md`, `SPEC-persistence.md`, `ROADMAP.md` Phase 3). Depends on: `foundation`, `auth` (both complete).
Tasks are tracked in the local-markdown tracker under `.scratch/persistence/issues/` (per `docs/agents/issue-tracker.md`) — this document is the plan; the checklist below is an index into those tracker items, not a duplicate.
Ships as its own `feat/persistence` PR per `ROADMAP.md`'s Delivery workflow. Independent of `places` (the other Phase 3 module) — either can merge first.

## Overview

Unlike `places` (Phase 3's other module), `persistence` has a real, testable vertical slice: a user should be able to create an adventure, see it in a list, and resume it — backed by real Supabase rows, not mock data. The plan front-loads the one shared primitive both vertical slices need (`createAdventureSchema` + the `HARD_CODED_QUEST` constant), then builds three vertical slices in the order a user would actually hit them: create → list → detail/resume.

## Architecture Decisions

- **List and detail are separate tasks from create, not bundled into one giant slice.** `auth`'s three vertical slices (register/login/logout) were each independently useful; the same logic applies here — create, list, and detail are each a complete, verifiable unit, and bundling them would blow past the ~5-file task-sizing guideline.
- **`GET` and `POST /api/adventures` share one route file** (`src/app/api/adventures/route.ts`), per Next.js Route Handler convention (one file per path, one exported function per HTTP method) — not a design choice specific to this module.
- **No database transaction for the three-row create.** Already flagged as an accepted gap in `SPEC-persistence.md`'s Open Questions; the plan does not add scope to fix it now (an RPC/Postgres function is a bigger change than this MVP module's bar, per the spec's Boundaries).
- **TDD only for `createAdventureSchema`** (task 01) — genuinely new validation logic. Route handlers, hooks, and pages are thin wiring around the already-tested schema and Supabase, verified manually end-to-end instead, matching `SPEC-auth.md`'s established Testing Strategy gap.

## Task List

Tracker items: `.scratch/persistence/issues/01`–`04`.

### Phase: Foundational primitive
- [x] [01 - Adventure Zod schema + hard-coded quest constant (TDD)](.scratch/persistence/issues/01-adventure-schema.md)

### Checkpoint A — after 01
- [x] `pnpm test` passes with the new schema tests (31/31)
- [x] `HARD_CODED_QUEST` reviewed against `SPEC-persistence.md`'s coordinates/radius before it's referenced by task 02's insert

### Phase: Vertical slices
- [x] [02 - Create Adventure (route handler + hook + page)](.scratch/persistence/issues/02-create-adventure.md)
- [x] [03 - Adventures list (route handler + hook + page)](.scratch/persistence/issues/03-adventures-list.md)
- [x] [04 - Adventure detail (route handler + hook + page)](.scratch/persistence/issues/04-adventure-detail.md)

### Checkpoint B — Persistence complete
- [x] Every `SPEC-persistence.md` Success Criteria box checked
- [x] Manual end-to-end pass: create an adventure → appears on `/` → "Resume" → detail page shows the hard-coded quest → confirmed absent from a second test user's list and returns `404` via a guessed id
- [x] `pnpm build`/`lint`/`test` all pass
- [x] CI green on the PR — [PR #9](https://github.com/2Steaks/dungeon-master-ai/pull/9) passed lint/test/build
- [x] Human reviews and merges — PR #9 merged to `main` (`429fac2`)

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Three-row create partially fails (e.g. network blip between the `adventures` and `quests` inserts), leaving an orphaned adventure with no quest | Low | Accepted gap per `SPEC-persistence.md` — RLS/ownership contains the blast radius to one user's own data; revisit with a Postgres function only if actually hit |
| RLS misconfiguration lets one user see another's adventures | High | Task 03 and 04 both include an explicit second-test-account manual check, not just a single-user happy path — same posture as `auth`'s cross-account verification |
| Hard-coded landmark coordinates typo'd, silently shipping a wrong/unwalkable location to every adventure | Med | Checkpoint A explicitly gates review of `HARD_CODED_QUEST` before task 02 consumes it |

## Open Questions

None blocking (see `SPEC-persistence.md`'s Open Questions for the two accepted gaps: no create-transaction, and "Last played" has no dedicated column yet).
