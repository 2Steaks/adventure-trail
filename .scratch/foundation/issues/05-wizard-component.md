Status: resolved
Type: task
Blocked by: 01

# 05 - Wizard component (TDD)

**Description:** Build the state-driven `Wizard` placeholder component per `SPEC-foundation.md`'s Code Style section. No art asset — a bordered box labelled with the current state. Follow red-green-refactor: write the test first.

**Acceptance criteria:**
- [x] `Wizard` accepts a `state` prop typed to the six values (`idle`, `thinking`, `quest-available`, `waiting`, `quest-completed`, `unexpected-event`)
- [x] Renders `aria-label="Wizard: <state>"` for each value
- [x] Test was written and observed failing before the component existed (confirmed red: `Failed to resolve import "./Wizard"`)

**Verification:**
- [x] `pnpm test` — 6/6 pass (one per state, via `it.each`)

## Answer

Done, straightforward TDD — no deviations.

**Dependencies:** 01

**Files likely touched:**
- `src/components/game/wizard/Wizard.tsx`
- `src/components/game/wizard/Wizard.test.tsx`

**Estimated scope:** Small
