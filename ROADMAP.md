# Roadmap: Dungeon Master AI

Status: **approved** (grilled and signed off — see decision log below).

This is the whole-project phased plan, derived from `CAPABILITY_MAP.md`'s module build order and `notes/original_plan.md`'s intent. It exists one level above per-module work: each phase below still goes through its own Specify → Plan → Tasks → Implement cycle (module specs live at `SPEC-<module-id>.md`), but this document is the thing checked against for progress.

## Tech decisions (resolving `notes/original_plan.md`'s generic placeholders)

- **LLM integration:** Vercel AI SDK (`ai` package), using `generateObject` with the existing Zod schemas as the contract for both the Adventure Planner and Encounter Generator. Replaces the plan's generic "LLM API" entry.
- **LLM provider:** `@ai-sdk/anthropic`. No free tier — requires a funded Anthropic API key; budget for actual usage costs (expected low for a demo project's call volume).
- **LLM model split:** a stronger Claude model for the Adventure Planner (runs once per adventure, quality-sensitive, latency less visible) and a faster/cheaper Claude model for the Encounter Generator (runs on every arrival, latency visible to a waiting kid, called repeatedly against the API budget). Exact model IDs are decided in the `ai-planner`/`ai-encounter` module specs, not here.
- **Structured-output failure policy:** on a `generateObject` result that passes Zod shape validation but fails a cross-field game rule (invalid `locationId`, action referencing a non-existent quest), retry once with the specific validation error fed back into the prompt; if the retry also fails, surface an explicit error/"unexpected event" Wizard state rather than looping or silently applying an invalid result.
- **Overpass reliability:** accept the public API's rate-limit/flakiness risk. No caching layer. On failure, show a simple "couldn't find nearby landmarks, try again" retry state. Revisit only if the risk is actually hit during use, not preemptively.
- **Continuous deployment:** Vercel deploy starts in **Phase 1**, not at the end. Every phase from there on is checked against a live preview URL (needed for real-phone geolocation testing), not just localhost.

## Delivery workflow (PRs, review, TDD)

- **One PR per module, not one PR per phase-number.** Most phases map 1:1 to a module and get exactly one PR. Phase 3 bundles two independent modules (`persistence`, `places`) — those ship as **two separate PRs**, since they touch disjoint files and reviewing them together would just make the diff harder to read for no benefit. They can merge in either order; both must be merged before Phase 4 starts.
- **Branch naming:** `feat/<module-id>` off `main` (e.g. `feat/foundation`, `feat/auth`). The already-open `chore/project-setup-and-plan` PR is a one-time exception — it carries the planning artifacts (`CAPABILITY_MAP.md`, `SPEC-foundation.md`, this file) plus the pre-existing `src/` scaffold reorg, not the Foundation module's actual implementation work. Foundation's real implementation (shadcn setup, Tailwind pixel-art theme, TanStack Query provider, Wizard component, DB migration, CI workflow) ships as its own `feat/foundation` PR on top of it.
- **Every module PR must be:**
  - **Scoped** — one module, matching its `SPEC-<module-id>.md`. PR description checks off that spec's Success Criteria as a checklist.
  - **Reviewable** — small enough to read in one sitting; if a module's implementation is going to sprawl, split it into stacked PRs rather than one giant diff (see `incremental-implementation`).
  - **Testable** — CI must pass before merge. A GitHub Actions workflow (`.github/workflows/ci.yml`, added in the `foundation` PR) runs `pnpm lint`, `pnpm test`, `pnpm build` on every PR. No merging on a red build.
- **TDD, no exceptions for real logic:** every module's Implement step follows red → green → refactor (`test-driven-development`) — write the failing test first, write the minimum code to pass it, then refactor. This applies to anything with actual logic (Haversine, Zod schemas, arrival detection, action validation, RLS-scoped queries, LLM output validation). It does not apply to pure config/scaffolding with nothing to assert on (running `shadcn init`, writing a `.env.example`, installing a dependency) — don't invent a test for those.

## Decision log (from grilling session)

- Deleted `src/features/`, `src/server/`, `src/pages/`, `src/app/adventure/[id]/` — empty, untracked leftover scaffolding with no bearing on the plan.
- Supabase CLI install is now an explicit Foundation task; `supabase login`/`supabase link` remain manual steps only the human can run (interactive auth) — this is the one thing that can block the Foundation migration checkpoint.
- **Quest Gameplay moved ahead of AI Planner** (see Phase 4/5 below) — proving Haversine/arrival/Google-Maps-deep-link against Phase 3's hard-coded adventure derisks GPS/permissions issues independently of LLM output-validation issues, rather than debugging both at once.
- Auth ships bare-minimum: register/login/logout/persistent session. No email verification, no password reset — addable later as a config change, not a rearchitecture.
- shadcn/ui base: `new-york` style, `neutral` base color, CSS variables — inert choice since Foundation immediately restyles for pixel-art.

## Phases

### Phase 1 — Foundation
**Modules:** `foundation`
**Ships:** Next.js/Tailwind/shadcn (`new-york`/`neutral`)/TanStack Query/Supabase/Zod scaffold, pixel-art visual shell, Supabase schema + RLS migration, Wizard component shell (no art), Supabase CLI installed, initial Vercel deployment wired up (continuous from here on).
**Exit checkpoint:** `pnpm dev` shows a pixel-art-styled shell on a mobile viewport; `pnpm build`/`lint`/`test` pass; migration applies with RLS via `supabase db push`; the shell is live on a Vercel preview URL.
**Spec status:** `SPEC-foundation.md` drafted, needs a follow-up pass to add the CLI-install task and Vercel wiring.
**Manual step (you, not me):** `supabase login` and `supabase link` — interactive auth I can't do on your behalf.
**Key risk:** Next.js 16 + React 19 diverge from training-data conventions (per `AGENTS.md`) — mitigated by reading `node_modules/next/dist/docs/` before writing framework-touching code. (Checked during grilling: these are the real, current Next.js docs bundled with this release — no hidden custom fork.)

### Phase 2 — Auth
**Modules:** `auth`
**Ships:** `/register`, `/login`, logout, protected routes, persistent Supabase session. Email/password only — no verification email, no password reset.
**Exit checkpoint:** a new user can register, land on an authenticated route, close the browser, reopen, and remain logged in; an unauthenticated visitor is redirected to `/login`; verified against the live Vercel preview, not just localhost.
**Key risk:** proxy/middleware session refresh subtleties (already flagged in `src/lib/supabase/proxy.ts` comments) — get this right early since every later module depends on a working session.

### Phase 3 — Persistence + Places (parallel)
**Modules:** `persistence`, `places` — independent of each other, both only need Phase 1+2 done.
**Ships:**
- `persistence`: Adventures/Quests/GameState TanStack Query hooks, Adventures list screen, Create Adventure screen against a **hard-coded** adventure (no AI/OSM yet) — including at least one hard-coded quest with a real, walkable lat/lng and radius so Phase 4 has something genuine to test arrival against.
- `places`: browser geolocation permission flow, Overpass query, POI filter/rank to 5–10 candidates.
**Exit checkpoint:** a hard-coded adventure (with a real walkable landmark) can be created, listed, fetched, and resumed end-to-end through Supabase; independently, a geolocation prompt returns a ranked candidate POI list for the current location.
**Key risk:** Overpass rate limits / flaky public instance — accepted risk, simple retry/error UX, no caching (see Tech decisions).

### Phase 4 — First Playable Quest (moved ahead of AI Planner)
**Modules:** `quest-gameplay`
**Ships:** mobile quest screen, Haversine distance display, Google Maps deep link, backend-determined arrival (`distance <= quest.radiusMeters`) — all exercised against Phase 3's **hard-coded** landmark, no AI involved yet.
**Exit checkpoint:**
> Create (hard-coded) → landmark → Maps → walk → distance changes → arrive
**Key risk:** browser geolocation accuracy/permissions on real devices — test on the live Vercel preview on an actual phone outdoors, not just desktop devtools (now possible from Phase 1's continuous deployment).

### Phase 5 — AI Adventure Planner
**Modules:** `ai-planner`
**Ships:** Adventure Planner LLM call via the Vercel AI SDK's `generateObject`, using a stronger Claude model, passed the Zod schema directly, constrained to `places`' candidate `locationId`s, persisted via `persistence`. Real AI-selected landmarks now replace Phase 3's hard-coded one, running through the already-proven Phase 4 quest-gameplay mechanics.
**Exit checkpoint:** creating an adventure with a real location produces an LLM-generated title + quest sequence referencing only supplied landmarks, validated and stored; the Phase 4 walk-to-arrival loop now works against a real, AI-selected landmark.
**Key risk:** LLM selecting an invalid/hallucinated `locationId` — hard validation failure (not a soft warning), one bounded retry with the error fed back, then fail to an explicit error state (see Tech decisions).

### Phase 6 — AI Encounter
**Modules:** `ai-encounter`
**Ships:** Wizard state UI wired to real game state, Encounter Generator LLM call via the Vercel AI SDK's `generateObject` (same Zod-schema-as-contract pattern as the Planner, faster/cheaper Claude model), choices, backend-validated actions (`COMPLETE_OBJECTIVE`, `ADD_ITEM`), inventory, quest completion → next quest.
**Exit checkpoint:** arriving at a landmark triggers an encounter; player choices produce LLM-proposed actions that the backend validates before applying; invalid/out-of-rule actions are rejected server-side (one bounded retry, then explicit error/"unexpected event" state).
**Key risk:** LLM proposing actions that violate game rules (wrong quest id, duplicate completion) — backend must reject silently-invalid actions rather than trusting LLM output. `generateObject` guarantees shape, not game-rule legality.

### Phase 7 — Mobile Polish
**Modules:** `mobile-polish`
**Ships:** loading/error states, outdoor-readability pass, touch target audit, wizard animation, arrival celebration, quest transitions, safe-area handling, and the resume check.
**Exit checkpoint (from `notes/original_plan.md`):**
> Play → complete quest → close browser → reopen → same progress
**Key risk:** none architecturally — mostly UI/UX time sink; time-box this phase.

### Phase 8 — Testing + Final Verification
**Modules:** `testing-deploy`
**Ships:** unit tests for Haversine, arrival threshold, Zod AI-output schemas, invalid-landmark rejection, game action validation, quest progression; a final regression pass; full real-phone demo verification against the (already continuously deployed since Phase 1) Vercel production URL.
**Exit checkpoint (final demo, from `notes/original_plan.md`):**
> Register → Create adventure → Discover real landmark → Open Maps → Walk → Arrive → Wizard encounter → Complete quest → Close/reopen → Resume
**Key risk:** none new — this phase is a verification pass over everything above.

## If time runs short

Cut features before compromising the core loop (unchanged from `notes/original_plan.md`):

```text
Mobile UI → Auth → Supabase persistence → Geolocation → OSM → AI adventure
→ Quest screen → Distance tracking → Arrival → Wizard → AI encounter
→ Quest completion → Resume
```

Candidates to cut first if a phase overruns: Phase 7 polish items (animation, celebration flourishes), then Phase 3's `places` ranking sophistication (fall back to "nearest N of any allowed type"), before ever cutting persistence, auth, or the arrival/validation logic that makes the "AI inside the rules, not the AI as the rules" story hold up.

## Tracking

Per-module work (Plan → Tasks → Implement) is tracked as local-markdown tickets under `.scratch/<module-id>/` per `docs/agents/issue-tracker.md`, one `spec.md` and numbered issue files per module, in the phase order above.

## Sign-off

- [x] Phase breakdown and order approved (including the Quest Gameplay / AI Planner swap)
- [x] Exit checkpoints agreed as the right "done" signal per phase
- [x] Cut-list order agreed
- [x] Tech decisions (Vercel AI SDK, Anthropic, model split, retry policy, Overpass risk acceptance, continuous deployment) agreed
