# 06: Safe-area handling audit

**What to build:** `body` in `src/app/globals.css` already applies `env(safe-area-inset-*)` padding, and `viewport-fit=cover` is set in `src/app/layout.tsx` — but that base handling predates tickets 04 (arrival celebration) and 05 (quest transitions), which may introduce new overlay/fixed-position elements. Audit the full app, including whatever those two tickets added, for anything that clips under a notch or gets obscured by a home indicator on a real device.

**Blocked by:** 04 (arrival celebration), 05 (quest transitions)

**Status:** ready-for-agent

- [ ] Any new fixed/absolute/overlay element introduced by tickets 04/05 respects safe-area insets
- [ ] Bottom-anchored CTAs (`Button`s at the bottom of the adventure detail card) aren't obscured by a home indicator on a notched device
- [ ] Verified on a live Vercel preview on a real phone (per this project's ongoing convention — safe-area behavior isn't reliably testable in desktop devtools)
- [ ] `pnpm build`/`lint`/`test` pass
