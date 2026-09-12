# 06: Safe-area handling audit

**What to build:** `body` in `src/app/globals.css` already applies `env(safe-area-inset-*)` padding, and `viewport-fit=cover` is set in `src/app/layout.tsx` — but that base handling predates tickets 04 (arrival celebration) and 05 (quest transitions), which may introduce new overlay/fixed-position elements. Audit the full app, including whatever those two tickets added, for anything that clips under a notch or gets obscured by a home indicator on a real device.

**Blocked by:** 04 (arrival celebration), 05 (quest transitions)

**Status:** resolved

- [x] Any new fixed/absolute/overlay element introduced by tickets 04/05 respects safe-area insets
- [x] Bottom-anchored CTAs (`Button`s at the bottom of the adventure detail card) aren't obscured by a home indicator on a notched device
- [ ] Verified on a live Vercel preview on a real phone — **not done**, see Answer
- [x] `pnpm build`/`lint`/`test` pass

## Answer

Audited: `grep -rn "\bfixed\b|\bsticky\b|\babsolute\b" src --include="*.tsx"` returns zero matches anywhere in the app, including the celebration/quest-transition elements tickets 04 and 05 added — every screen is plain in-flow content inside a centered, scrollable card, never pinned to the viewport edge. `src/app/globals.css`'s `body` already applies `env(safe-area-inset-*)` padding on all four sides (from Foundation), and `layout.tsx` sets `viewportFit: "cover"`. Since nothing bypasses normal document flow, that existing body-level handling already covers every current and newly-added element — no code change needed.

Real-phone verification against a live Vercel preview (notch/home-indicator visual check) was not performed this session — flagging as outstanding rather than checked off.

