# 02: Touch target audit

**What to build:** Audit every tappable element across the app at a 375px viewport and fix any that fall short of a ~44x44px target or sit too close to a sibling target for a comfortable thumb tap. `Button`'s `default` size is already `h-11` (44px) and fine, but several raw form controls and adjacent-button groups were never sized against this bar: `<input>`/`<select>` in `src/app/adventures/new/page.tsx` (currently bare `p-2`, no min-height), the stacked choice buttons in `src/components/game/encounter/EncounterPanel.tsx`, and any `<a>`-wrapped `Button` (the Google Maps deep link).

**Blocked by:** None (can start immediately)

**Status:** resolved

- [x] Every `<input>`/`<select>` on `/adventures/new` has a minimum 44px tap height
- [x] `EncounterPanel`'s stacked choice buttons have adequate gap between them so an adjacent tap can't be mis-hit
- [x] `Wizard` component and any other non-`Button` tappable elements checked (or explicitly confirmed non-interactive, if it stays decorative-only per `SPEC-ai-encounter.md`)
- [x] No regressions to existing `Button` sizing/variants used elsewhere
- [x] `pnpm build`/`lint`/`test` pass

## Answer

`min-h-11` added to all 5 form controls on `/adventures/new` (theme input, ageMin/ageMax, duration/distance selects). `EncounterPanel`'s choice-button gap widened `gap-2` → `gap-3`.

`Wizard.tsx` checked: `role="img"`, `aria-label`, no `onClick`/interactive handlers of any kind — confirmed still purely decorative, exactly as `SPEC-ai-encounter.md` specifies. No change needed there. The Google-Maps `<a>`-wrapped `Button` was also checked — the anchor is a plain inline wrapper around a `w-full` block-level Button, so its hit area equals the button's, no separate fix needed.
