Status: open
Type: task
Blocked by: 01

# 05 - Wizard component (TDD)

**Description:** Build the state-driven `Wizard` placeholder component per `SPEC-foundation.md`'s Code Style section. No art asset — a bordered box labelled with the current state. Follow red-green-refactor: write the test first.

**Acceptance criteria:**
- [ ] `Wizard` accepts a `state` prop typed to the six values (`idle`, `thinking`, `quest-available`, `waiting`, `quest-completed`, `unexpected-event`)
- [ ] Renders `aria-label="Wizard: <state>"` for each value
- [ ] Test was written and observed failing before the component existed

**Verification:**
- [ ] `pnpm test` — new Wizard test passes, and did fail before implementation (TDD, not just written test-and-code together)

**Dependencies:** 01

**Files likely touched:**
- `src/components/game/wizard/Wizard.tsx`
- `src/components/game/wizard/Wizard.test.tsx`

**Estimated scope:** Small
