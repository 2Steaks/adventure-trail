# 02: Touch target audit

**What to build:** Audit every tappable element across the app at a 375px viewport and fix any that fall short of a ~44x44px target or sit too close to a sibling target for a comfortable thumb tap. `Button`'s `default` size is already `h-11` (44px) and fine, but several raw form controls and adjacent-button groups were never sized against this bar: `<input>`/`<select>` in `src/app/adventures/new/page.tsx` (currently bare `p-2`, no min-height), the stacked choice buttons in `src/components/game/encounter/EncounterPanel.tsx`, and any `<a>`-wrapped `Button` (the Google Maps deep link).

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Every `<input>`/`<select>` on `/adventures/new` has a minimum 44px tap height
- [ ] `EncounterPanel`'s stacked choice buttons have adequate gap between them so an adjacent tap can't be mis-hit
- [ ] `Wizard` component and any other non-`Button` tappable elements checked (or explicitly confirmed non-interactive, if it stays decorative-only per `SPEC-ai-encounter.md`)
- [ ] No regressions to existing `Button` sizing/variants used elsewhere
- [ ] `pnpm build`/`lint`/`test` pass
