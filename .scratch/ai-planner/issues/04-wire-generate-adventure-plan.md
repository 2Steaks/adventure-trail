Status: resolved
Type: task
Blocked by: 01

# 04 - Wire generateAdventurePlan() against a real Anthropic call

**Description:** Add `createAnthropic({ apiKey: process.env.ANTHROPIC })` to `src/lib/ai/client.ts`, and `generateAdventurePlan(input)` to `src/lib/ai/planner.ts` — validates the result with `invalidLocationIds()` (task 01), retries once with the specific error fed back into the prompt on failure, then throws `AdventurePlanError` if the retry also fails. This is the **first task in this module that makes a real, billed Anthropic API call** — deliberately sequenced after all the free/pure logic (tasks 01–03) is fully verified, so any live-call debugging isn't also fighting schema/validation bugs at the same time.

**Corrected from the spec while implementing:** `generateObject` is deprecated in the installed `ai` SDK version (7.0.97) — confirmed via `node_modules`' own type declarations (`@deprecated Use generateText with an output setting instead`), not assumed from training data. Used `generateText` with `output: Output.object({ schema: adventurePlanSchema })` instead — same contract, current API. `SPEC-ai-planner.md`'s Code Style example updated to match.

**Live verification deliberately deferred, by request:** the one deliberate live call meant to prove this end-to-end hit `AI_APICallError: You have reached your specified API usage limits. You will regain access on 2026-10-01 at 00:00 UTC.` The API key itself is valid — auth succeeded, the request reached Anthropic — this is an account-level usage/billing limit, not a code bug. Rather than blocking the rest of the module on it, live verification of this task (and task 05's end-to-end flow) is pushed to a later stage — implementation proceeds on the strength of typecheck/lint/unit tests + code review alone. **This is a real, explicit gap, not a silently-skipped one:** `generateAdventurePlan()` has never actually been proven against a real model response. Re-verify live before treating this module as done.

**Acceptance criteria:**
- [x] `generateAdventurePlan()` implemented, delegates to `generateText`/`Output.object()`, wired to `invalidLocationIds()` for the retry decision
- [ ] `generateAdventurePlan()` returns a valid plan on a normal successful call — **deferred, not yet verified live**
- [ ] The retry path is exercised at least once, live — **deferred, not yet verified live**
- [x] `AdventurePlanError` is thrown (not silently swallowed) if both attempts produce invalid `locationId`s — implemented, not yet exercised live

**Verification:**
- [x] `pnpm build`/`lint`/`test` pass
- [ ] Manual: **a small, deliberate number of live calls** — **deferred to a later stage**, not yet done

**Dependencies:** 01 (uses `invalidLocationIds()` and `adventurePlanSchema`)

**Files likely touched:**
- `src/lib/ai/client.ts`
- `src/lib/ai/planner.ts`
- `package.json` (adds `ai`, `@ai-sdk/anthropic`)

**Estimated scope:** Small
