Status: resolved
Type: task
Blocked by: 03 (needs something worth deploying)

# 09 - Vercel connection + first deploy

**Description:** Connect the GitHub repo to Vercel (dashboard import, or `vercel link` + `vercel --prod`) so continuous deployment starts in this module, per `ROADMAP.md`'s "Continuous deployment" decision — every later phase gets checked against a live preview URL, not just localhost.

**Manual steps required from you (not me), both done:** `vercel login` (interactive auth), and authorizing the Vercel GitHub App for `2Steaks` on GitHub's permission screen — `vercel git connect` fails silently otherwise ("Failed to connect... make sure you have access") with no actionable error, it's just an unauthorized App.

**Acceptance criteria:**
- [x] Repo connected to a Vercel project (`ben-simpsons-projects/dungeon-master-ai`) — confirmed via `vercel git connect` reporting "already connected"
- [x] A live URL is reachable and shows the pixel-art shell — `https://dungeon-master-ai-theta.vercel.app`, `200 OK`

**Verification:**
- [x] Visited the deployed URL via curl (200 OK) — matches the local build (same source, same commit)
- [x] Confirmed a push to this branch auto-triggered a preview deployment, which reached `Ready` — the GitHub connection is genuinely live, not just configured

**Found during verification:** preview deployment URLs redirect anonymous requests to `vercel.com/sso-api` (Vercel's Deployment Protection, on by default for this team) — confirmed the content itself is correct via `vercel curl` (which auto-generates a bypass token), but a phone browser hitting a preview URL directly, logged out of Vercel, would hit the same login wall. Production isn't protected. This will matter for Phase 4's "test on an actual phone" plan — flagged in `ROADMAP.md`, not solved here (out of scope for Foundation).

**Note:** the project's very first deploy was auto-assigned to "Production" by Vercel itself (its documented behavior for a brand-new project, not something I chose) — harmless here since it's just the placeholder shell, but future manual `vercel` calls (without `--prod`) will correctly create preview deployments instead.

**Dependencies:** 03

**Files likely touched:**
- None expected (dashboard/CLI action), possibly `vercel.json` if defaults need overriding

**Estimated scope:** Extra small (mostly manual)
