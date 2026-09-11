# Implementation Plan: Auth Module

Module id: `auth` (see `CAPABILITY_MAP.md`, `SPEC-auth.md`, `ROADMAP.md` Phase 2). Depends on: `foundation` (complete — see `tasks/plan-foundation.md`).
Tasks are tracked in the local-markdown tracker under `.scratch/auth/issues/` (per `docs/agents/issue-tracker.md`) — this document is the plan; the checklist below is an index into those tracker items, not a duplicate.
Ships as its own `feat/auth` PR (possibly split into stacked PRs if it sprawls) per `ROADMAP.md`'s Delivery workflow.

## Overview

Unlike Foundation, this module has a real, testable vertical slice: a user should be able to register, log in, and log out. The plan front-loads the one high-risk, foundational fix (the inert Proxy — see `SPEC-auth.md`'s "Critical finding") because it changes routing behavior for the *entire app*, then builds the two small independent primitives (Zod schema, `requireUser()`) before the three vertical slices (register, login, logout) that depend on them.

## Architecture Decisions

- **The Proxy fix comes first, not last.** Every other task in this module needs `/login`/`/register` to be reachable while unauthenticated and `/` to require auth — that's exactly what's currently broken. Fixing it first also means the rest of the module can be tested as a real user journey (visit `/` while logged out → redirected to `/login` → register → land on `/`), not just in isolation.
- **`requireUser()` is written but not consumed by this module's own routes.** Register/login are intentionally public; logout doesn't need it either (`signOut()` on no session is a harmless no-op). It's built now because `persistence` (next module) needs it immediately, and it's cheap to add alongside the Proxy fix while the "what's the real auth boundary" question is fresh.
- **TDD per `ROADMAP.md`:** the Zod schema, `requireUser()`, and the Proxy matcher regression test are all genuinely new logic — red first, then green. The route handlers and pages themselves are thin wiring around already-tested pieces; verified manually end-to-end instead (see Testing Strategy gap, already flagged in `SPEC-auth.md`).

## Task List

Tracker items: `.scratch/auth/issues/01`–`06`.

### Phase: Foundational fix + primitives
- [ ] [01 - Fix the inert Proxy (move + matcher + regression test)](.scratch/auth/issues/01-fix-proxy.md)
- [ ] [02 - Auth Zod schema (TDD)](.scratch/auth/issues/02-auth-schema.md)
- [ ] [03 - requireUser() helper (TDD)](.scratch/auth/issues/03-require-user.md)

### Checkpoint A — after 01–03
- [ ] `pnpm test`/`build`/`lint` all pass
- [ ] Proxy regression test passes; manually confirmed unauthenticated `/` → `307` → `/login`, and `/login`/`/register` stay `200`
- [ ] Human reviews the Proxy fix specifically (it changes routing for the whole app) before the vertical slices build on top of it

### Phase: Vertical slices
- [ ] [04 - Register (route handler + page + hook)](.scratch/auth/issues/04-register.md)
- [ ] [05 - Login (route handler + page + hook)](.scratch/auth/issues/05-login.md)
- [ ] [06 - Logout (route handler + hook + button)](.scratch/auth/issues/06-logout.md)

### Checkpoint B — Auth complete
- [ ] Every `SPEC-auth.md` Success Criteria box checked
- [ ] Manual end-to-end pass on the live preview URL: register a real account → land on `/` → close browser → reopen → still logged in → log out → redirected to `/login`
- [ ] CI green on the PR(s)
- [ ] Human reviews and merges

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| The Proxy fix changes routing for every route, not just auth's — a matcher mistake could lock out or expose something unrelated | High | Task 01 is isolated and reviewed on its own before the vertical slices build on top of it (Checkpoint A gates this specifically) |
| No automated end-to-end browser test | Med | Manual verification against the live preview URL, explicitly listed as a checkpoint step, not skipped silently |
| Supabase Auth error messages change wording/shape between SDK versions | Low | Route handlers pass through `error.message` as-is rather than pattern-matching specific strings, so a wording change degrades gracefully (still shows *some* message) rather than breaking |

## Open Questions

None blocking.
