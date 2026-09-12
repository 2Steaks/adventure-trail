# 04: Arrival celebration

**What to build:** When `useCheckArrival` (`src/app/adventures/[id]/page.tsx`) flips from not-arrived to `arrived: true`, show a brief celebratory moment (a visual flourish — e.g. a highlight/pulse/on-theme burst, no new dependency) before or alongside the Wizard's `quest-available` state and the "Talk to the Wizard" button, instead of the current instant, silent state swap.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] The moment `checkArrival.data.arrived` becomes `true`, a celebratory visual plays once (not on every re-render/refetch of already-arrived state)
- [ ] The celebration doesn't block or delay the "Talk to the Wizard" CTA from becoming tappable
- [ ] Reduced-motion consideration: respects `prefers-reduced-motion` (no forced animation for users/devices that disable it)
- [ ] Verified on a real walk-to-arrival flow against a live Vercel preview (per this project's convention — GPS/arrival behavior isn't fully testable on desktop devtools alone)
- [ ] `pnpm build`/`lint`/`test` pass
