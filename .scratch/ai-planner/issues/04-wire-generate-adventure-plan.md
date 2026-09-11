Status: open
Type: task
Blocked by: 01

# 04 - Wire generateAdventurePlan() against a real Anthropic call

**Description:** Add `createAnthropic({ apiKey: process.env.ANTHROPIC })` to `src/lib/ai/client.ts`, and `generateAdventurePlan(input)` to `src/lib/ai/planner.ts` — calls `generateObject` with `claude-opus-5` + `adventurePlanSchema`, validates the result with `invalidLocationIds()` (task 01), retries once with the specific error fed back into the prompt on failure, then throws `AdventurePlanError` if the retry also fails. This is the **first task in this module that makes a real, billed Anthropic API call** — deliberately sequenced after all the free/pure logic (tasks 01–03) is fully verified, so any live-call debugging isn't also fighting schema/validation bugs at the same time.

**Acceptance criteria:**
- [ ] `generateAdventurePlan()` returns a valid plan on a normal successful call
- [ ] The retry path (fed a deliberately narrow candidate list to increase the odds of a first-attempt miss, or verified via the already-tested `invalidLocationIds()` logic plus a manual read of one real response) is exercised at least once, live
- [ ] `AdventurePlanError` is thrown (not silently swallowed) if both attempts produce invalid `locationId`s

**Verification:**
- [ ] `pnpm build`/`lint`/`test` pass
- [ ] Manual: **a small, deliberate number of live calls** (not exploratory looping — this costs real money) — one happy-path call with a real location's candidate list, confirming the returned plan references only supplied ids

**Dependencies:** 01 (uses `invalidLocationIds()` and `adventurePlanSchema`)

**Files likely touched:**
- `src/lib/ai/client.ts`
- `src/lib/ai/planner.ts`
- `package.json` (adds `ai`, `@ai-sdk/anthropic`)

**Estimated scope:** Small
