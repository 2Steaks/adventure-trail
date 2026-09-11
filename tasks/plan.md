# Implementation Plan: Foundation Module

Module id: `foundation` (see `CAPABILITY_MAP.md`, `SPEC-foundation.md`, `ROADMAP.md` Phase 1).
Tasks are tracked in the local-markdown tracker under `.scratch/foundation/issues/` (per `docs/agents/issue-tracker.md`) — this document is the plan; the checklist below is an index into those tracker items, not a duplicate.
Ships as its own `feat/foundation` PR per `ROADMAP.md`'s Delivery workflow, gated on the CI workflow this module adds.

## Overview

Foundation has no end user yet, so this isn't a user-facing vertical slice in the usual sense — it's the infrastructure every later module's vertical slice stands on. The ordering below still follows dependency-first, fail-fast principles: install and prove the tooling first (Task 1), then the two things most likely to reveal Next 16/React 19 surprises (shadcn + pixel-art shell), then the independent, easily-tested pieces (TanStack Query, Wizard, the server Supabase client), then the two manually-gated pieces (DB migration, Vercel connection) last, since those are blocked on you, not on code, and shouldn't hold up everything else.

## Architecture Decisions

- **TDD for anything with real logic** (Wizard state rendering, Supabase client env-validation): write the failing test first. Pure scaffolding steps (shadcn init, dependency installs, CI YAML) don't get an invented test — per `ROADMAP.md`'s Delivery workflow.
- **Manual gates are scheduled last, not blocking:** Supabase CLI login/link and Vercel project connection both require your interactive auth. Code tasks (1–6) don't depend on either, so they can all complete and be reviewed while you do those two steps in parallel.
- **shadcn init before manual pixel-art CSS tokens:** `shadcn init` writes baseline CSS variables into `globals.css`. Doing the pixel-art `@theme` customization after init (not before) avoids the init step clobbering hand-written tokens.
- **No browser-side Supabase client.** The frontend only ever calls Next.js Route Handlers; those use the server client. Foundation doesn't add a browser client file — it just proves the server client's error handling is solid, since every later module's Route Handlers depend on it.

## Task List

Tracker items: `.scratch/foundation/issues/01`–`09`.

### Phase: Tooling
- [ ] [01 - Install core dependencies + Vitest harness](.scratch/foundation/issues/01-install-core-dependencies.md)

### Phase: Visual shell
- [ ] [02 - shadcn/ui init + pixel-art theme tokens + Button restyle](.scratch/foundation/issues/02-shadcn-init-pixel-theme.md)
- [ ] [03 - Mobile-first pixel-art layout + placeholder page](.scratch/foundation/issues/03-mobile-shell-layout.md)

### Checkpoint A — after 01–03
- [ ] `pnpm test`, `pnpm build`, `pnpm lint` all pass
- [ ] `pnpm dev` at a 375px viewport shows the pixel-art shell, not create-next-app boilerplate
- [ ] Human visually reviews the shell before continuing

### Phase: Independent, testable pieces
- [ ] [04 - TanStack Query provider wiring](.scratch/foundation/issues/04-tanstack-query-provider.md)
- [ ] [05 - Wizard component (TDD)](.scratch/foundation/issues/05-wizard-component.md)
- [ ] [06 - Supabase server client env-validation tests (TDD)](.scratch/foundation/issues/06-supabase-server-client-tests.md)

### Checkpoint B — after 04–06
- [ ] `pnpm test` passes including new Wizard and Supabase-client tests
- [ ] React Query Devtools visible in `pnpm dev`
- [ ] Human reviews test coverage for these three pieces

### Phase: Manually-gated infra
- [ ] [07 - DB schema migration + RLS (blocked on your `supabase login`/`link`)](.scratch/foundation/issues/07-db-migration-rls.md)
- [ ] [08 - CI workflow (lint/test/build on PRs)](.scratch/foundation/issues/08-ci-workflow.md)
- [ ] [09 - Vercel connection + first deploy (blocked on your Vercel auth)](.scratch/foundation/issues/09-vercel-connection.md)

### Checkpoint C — Foundation complete
- [ ] Every `SPEC-foundation.md` Success Criteria box checked
- [ ] CI green on the `feat/foundation` PR
- [ ] Live Vercel URL reachable, showing the pixel-art shell
- [ ] Migration applied against the linked Supabase project with RLS verified
- [ ] Human reviews and merges `feat/foundation`

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Next 16 + React 19 App Router conventions diverge from training data | Med | Read `node_modules/next/dist/docs/01-app/` before touching layout/routing code (per `AGENTS.md`); confirmed during grilling these are real bundled docs, not a custom fork |
| RLS policy written incorrectly (over- or under-scoped) | High | Write the migration's RLS policies against the exact `auth.uid()` ownership rules in `SPEC-foundation.md`; this is the one task where a mistake is a real data leak, not just a bug — review the SQL line-by-line before `supabase db push`, don't rush it because it's "just one file" |
| `shadcn init` re-run later clobbers hand-tuned pixel-art tokens | Low | Don't re-run `shadcn init` after Task 02; add further primitives with `shadcn add <component>` only |
| Vitest/Testing Library config friction with Next 16's bundled React canary in the App Router vs. the project's stable React 19 in `package.json` | Low | Foundation's only tested component (`Wizard`) is a simple presentational client component with no Server Component/canary-only features, so this risk is low here — re-assess if later modules hit it |
| Two manual gates (Supabase link, Vercel connection) block final verification | Med | Scheduled last (Tasks 07/09) so they don't block Tasks 01–06 or Checkpoints A/B; flagged explicitly in each task |

## Open Questions

None blocking — all prior open questions were resolved in the `ROADMAP.md` grilling session.
