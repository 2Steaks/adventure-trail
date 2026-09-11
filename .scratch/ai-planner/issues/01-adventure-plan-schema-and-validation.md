Status: open
Type: task
Blocked by: none

# 01 - adventurePlanSchema + invalidLocationIds() (TDD)

**Description:** Add `adventurePlanSchema` to `src/lib/schemas/adventure-plan.ts` — `{ title, quests: [{ locationId, objective, type }] }`, mirroring `notes/original_plan.md`'s Adventure Planner contract exactly. Add `invalidLocationIds(plan, locations)` to `src/lib/ai/planner.ts` (or a co-located pure module) — returns the subset of a plan's `locationId`s that don't match any supplied candidate's `id`. This is the actual game-rule check per `ROADMAP.md`'s "Location ID validation" — genuinely new logic, TDD, same bar as `checkArrival()`. Zero API cost — pure logic, no LLM call.

**Acceptance criteria:**
- [ ] `adventurePlanSchema` accepts a valid shape; rejects an empty `quests` array; rejects an invalid `type` value
- [ ] `invalidLocationIds()` returns `[]` when every `locationId` matches a supplied candidate
- [ ] `invalidLocationIds()` returns the offending id(s) when one or more don't match
- [ ] Tests written first, observed failing before the implementations existed

**Verification:**
- [ ] `pnpm test` passes

**Dependencies:** None

**Files likely touched:**
- `src/lib/schemas/adventure-plan.ts`
- `src/lib/schemas/adventure-plan.test.ts`
- `src/lib/ai/planner.ts` (just the pure `invalidLocationIds()` export for now)
- `src/lib/ai/planner.test.ts`

**Estimated scope:** Small
