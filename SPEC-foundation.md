# Spec: Foundation Module

Module id: `foundation` (see `CAPABILITY_MAP.md`). Depends on: —.

## Objective

Establish the technical scaffold so the app **boots and already looks like a pixel-art game**, with the database schema and RLS in place, ready for the `auth` and `persistence` modules to build on.

Who: the solo developer building this technical challenge submission.
Success looks like: running `pnpm dev` on a mobile viewport shows a pixel-art-styled shell (not the default create-next-app page), backed by a real Supabase schema with RLS, with the client/server plumbing (Supabase, TanStack Query, Zod, shadcn/ui) wired and provable via a smoke test — before any real feature (auth, adventures) exists.

Out of scope for this module: actual auth flows, adventure/quest CRUD, OSM/LLM integration, wizard artwork. Those belong to `auth`, `persistence`, `places`, `ai-planner`, `ai-encounter` respectively.

## Tech Stack

- Next.js 16.3.4 (App Router), React 19.2.8, TypeScript 5 — already pinned in `package.json`
- Tailwind CSS 4 (CSS-based `@theme`, no `tailwind.config.js`) — already installed
- shadcn/ui — not yet installed; this module runs `pnpm dlx shadcn@latest init`
- TanStack Query — not yet installed
- Supabase Auth + Postgres via `@supabase/ssr` + `@supabase/supabase-js` — already installed, client/proxy already scaffolded in `src/lib/supabase/`
- Zod — not yet installed
- Vitest + `@testing-library/react` + `jsdom` — not yet installed
- Supabase CLI — this module installs it (e.g. `brew install supabase/tap/supabase`) as an explicit task; `supabase login` and `supabase link` are interactive and must be run by you, not me — that's the one manual gate on this module's migration checkpoint
- pnpm (pinned `pnpm@11.24.0`), deployed to Vercel — continuous deployment starts in this module (per `ROADMAP.md`), not deferred to the `testing-deploy` module

**Assumption:** LLM provider/model selection is out of scope here — deferred to the `ai-planner` module spec.

## Commands

```text
Dev:              pnpm dev
Build:             pnpm build
Start:              pnpm start
Lint:                pnpm lint
Test:               pnpm test               # vitest run
Test (watch):    pnpm test:watch     # vitest
Add shadcn component: pnpm dlx shadcn@latest add <component>
Install Supabase CLI: brew install supabase/tap/supabase   # one-time, macOS
Link project (manual, interactive): supabase login && supabase link
New migration:  supabase migration new <name>
Apply migration: supabase db push
Deploy: vercel --prod   # or via Vercel's Git integration once the repo is connected
```

This module also adds `.github/workflows/ci.yml`, running `pnpm lint`, `pnpm test`, `pnpm build` on every PR — the mechanism that makes every later module's PR actually "testable" rather than a promise.

`package.json` needs `"test"` and `"test:watch"` scripts added; `vitest`, `@vitejs/plugin-react`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom` added as dev dependencies.

## Project Structure

Only what this module actually creates or touches — later modules add their own subtrees (`lib/ai`, `lib/places`, `lib/game`, `app/adventures/*`, etc.) when they need them, not pre-scaffolded here as empty folders:

```text
src/
  app/
    layout.tsx        # mobile-first shell, pixel-art shell, safe-area base styles
    page.tsx           # placeholder landing (replaced by auth/adventures later)
    globals.css        # Tailwind v4 @theme: pixel-art color tokens, font, borders

  components/
    ui/                 # shadcn primitives, restyled pixel-art variant
    game/
      wizard/
        Wizard.tsx    # state-driven placeholder (no art yet)

  lib/
    supabase/          # already scaffolded: client.ts (server), proxy.ts (middleware helper)
      browser-client.ts  # new: browser-side Supabase client for TanStack Query hooks
    query/
      provider.tsx    # TanStack QueryClientProvider wrapper
    schemas/            # empty until a module needs a Zod schema — not created here

supabase/
  migrations/
    <timestamp>_init.sql   # adventures, quests, game_states, messages tables + RLS

vitest.config.ts
vitest.setup.ts
```

`proxy.ts` (repo root) already wires `src/lib/supabase/proxy.ts` as Next's middleware — kept as-is.

## Code Style

Match the existing scaffold's conventions (functional components, named exports for utilities, default export for page/layout components, no semicolon-free style changes beyond what's already there). Example for the Wizard placeholder (state-driven, no art):

```tsx
// src/components/game/wizard/Wizard.tsx
export type WizardState =
  | "idle"
  | "thinking"
  | "quest-available"
  | "waiting"
  | "quest-completed"
  | "unexpected-event"

export function Wizard({ state }: { state: WizardState }) {
  return (
    <div
      role="img"
      aria-label={`Wizard: ${state}`}
      className="flex h-24 w-24 items-center justify-center border-4 border-foreground bg-background text-xs uppercase"
    >
      {state}
    </div>
  )
}
```

Tailwind v4 tokens go in `globals.css` under `@theme`, not a `tailwind.config.js`. Pixel-art look via `border-4`/hard shadows/no border-radius, not new abstractions.

## Testing Strategy

- Framework: Vitest + Testing Library, `jsdom` environment, config in `vitest.config.ts` (excluded from `tsconfig`'s Next build).
- Location: colocated `*.test.ts(x)` next to source, or `src/**/__tests__/`.
- This module's own test bar (later modules add their own): one component test asserting `Wizard` renders each `WizardState` value with the expected `aria-label`, and one smoke test that the Supabase browser/server client factories throw a clear error when env vars are missing (already partly true in `client.ts`).
- No coverage threshold enforced yet — introduce one later via `constraint-driven-development` if desired, once real logic (Haversine, Zod schemas, action validation) exists to measure.

## Boundaries

- **Always:** mobile-first Tailwind classes (base styles target ~375px viewport); enable RLS on every new table in the same migration that creates it; run `pnpm lint` and `pnpm test` before treating a task as done; keep `src/` layout consistent with `CAPABILITY_MAP.md` module ownership; ship this module's implementation as its own `feat/foundation` PR (see `ROADMAP.md` Delivery workflow), not folded into other modules' work; write a failing test before implementation code for anything with real logic (the `Wizard` state rendering, the Supabase client factories' error-on-missing-env behavior) — pure scaffolding steps (shadcn init, env file, dependency install) don't need an invented test.
- **Ask first:** any dependency beyond what's listed in Tech Stack; shadcn theme/style choice beyond a minimal pixel-art restyle; any change to the `supabase/migrations/<timestamp>_init.sql` schema after it has been applied to a shared/remote Supabase project (migrations are append-only across modules).
- **Never:** use Prisma; use `localStorage` or Zustand; generate wizard artwork dynamically; commit `.env`; run `supabase db reset` against a linked remote project without explicit confirmation; edit `node_modules/` (including the auto-regenerated AGENTS.md block, which is expected to reappear — see `AGENTS.md`).

## Success Criteria

- [ ] `pnpm dev` boots; at a 375px-wide viewport the page shows a pixel-art-styled shell, not the default create-next-app content
- [ ] `pnpm build` and `pnpm lint` both pass
- [ ] `pnpm test` runs Vitest and passes, including the `Wizard` state test
- [ ] shadcn/ui initialized (`components.json` present); at least one primitive (e.g. `Button`) restyled with the pixel-art treatment (hard border, no radius, chunky padding)
- [ ] TanStack Query's `QueryClientProvider` wraps the app; React Query Devtools available in `pnpm dev`
- [ ] `src/lib/supabase/browser-client.ts` added alongside the existing server client; both construct successfully given `.env` values
- [ ] `supabase/migrations/<timestamp>_init.sql` creates `adventures`, `quests`, `game_states`, `messages` with RLS policies scoping access to the owning `auth.uid()` (directly on `adventures.user_id`, and via `adventure_id` join for child tables); applies cleanly with `supabase db push` against a linked project
- [ ] `Wizard` component exists, accepts the six-value `state` prop, renders a bordered placeholder (no art asset) labelled with the state
- [ ] Supabase CLI installed; you have run `supabase login`/`supabase link` (manual — I flag this as the remaining blocker if it hasn't happened)
- [ ] Repo connected to Vercel; the Foundation shell is reachable on a live preview/production URL, not just localhost
- [ ] `.github/workflows/ci.yml` exists and runs `pnpm lint`, `pnpm test`, `pnpm build` on pull requests
- [ ] This module's implementation lands as its own `feat/foundation` PR against `main`, separate from the planning-artifacts PR

## Open Questions

None blocking. Resolved during the grilling session on `ROADMAP.md`:
- Real wizard artwork stays deferred — this module only wires the state-driven component shell.
- LLM provider/model choice is decided at the roadmap level (`@ai-sdk/anthropic`, split models) but exact model IDs are still deferred to the `ai-planner`/`ai-encounter` module specs.
- The previously-empty `src/features/`, `src/server/`, `src/pages/`, `src/app/adventure/[id]/` directories were confirmed as leftover noise and deleted — not a structural decision this module needs to honor.
