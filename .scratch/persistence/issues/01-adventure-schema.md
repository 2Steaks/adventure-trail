Status: open
Type: task
Blocked by: none

# 01 - Adventure Zod schema + hard-coded quest constant (TDD)

**Description:** Add `createAdventureSchema` to `src/lib/schemas/adventure.ts` — `{ theme, ageMin, ageMax, durationMinutes, maxDistanceMeters }`, with a `.refine()` rejecting `ageMax < ageMin`. Also add the `HARD_CODED_QUEST` constant to `src/lib/game/hard-coded-quest.ts` (Nelson's Column, Trafalgar Square — see `SPEC-persistence.md`'s "Hard-coded Quest Content"). The schema is genuinely new validation logic (TDD); the constant is plain data (no test needed).

**Acceptance criteria:**
- [ ] Valid body (theme + in-range ages + an allowed `durationMinutes`/`maxDistanceMeters`) passes
- [ ] `ageMax < ageMin` fails
- [ ] A `durationMinutes` or `maxDistanceMeters` value outside the allowed set (`30/60/90/120` and `500/1000/2000/5000` respectively) fails
- [ ] Test written first, observed failing before the schema existed
- [ ] `HARD_CODED_QUEST` exported with `objective`, `type`, `landmarkName`, `landmarkType`, `latitude`, `longitude`, `radiusMeters` matching `SPEC-persistence.md`

**Verification:**
- [ ] `pnpm test` passes

**Dependencies:** None

**Files likely touched:**
- `src/lib/schemas/adventure.ts`
- `src/lib/schemas/adventure.test.ts`
- `src/lib/game/hard-coded-quest.ts`

**Estimated scope:** Extra small
