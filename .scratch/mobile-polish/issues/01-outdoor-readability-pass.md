# 01: Outdoor-readability pass

**What to build:** Bump contrast, base font size, and border weight across the app's pixel-art theme (`src/app/globals.css`) so text and controls stay legible on a phone screen in direct sunlight — the actual outdoor use case for this app. Today's `--muted-foreground`/`--border` tokens are low-contrast grayscale (`oklch(0.556 0 0)` on white), tuned for an indoor screen, not glare.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] `--muted-foreground` (light mode) contrast against `--background` meets WCAG AA (4.5:1) for normal text
- [ ] Base body font size increased from the Tailwind default enough to read at arm's length outdoors (verified by eye at a 375px viewport, no fixed target — this is a UX judgment call, not a strict number)
- [ ] `border-foreground`/`border-border` weights reviewed so card/button edges stay visible against bright backgrounds
- [ ] Every screen (`/`, `/adventures/new`, `/adventures/[id]`, `/login`, `/register`) visually reviewed at a 375px viewport after the change
- [ ] `pnpm build`/`lint`/`test` pass
