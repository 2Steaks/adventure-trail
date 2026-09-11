Status: open
Type: task
Blocked by: 03 (needs something worth deploying)

# 09 - Vercel connection + first deploy

**Description:** Connect the GitHub repo to Vercel (dashboard import, or `vercel link` + `vercel --prod`) so continuous deployment starts in this module, per `ROADMAP.md`'s "Continuous deployment" decision — every later phase gets checked against a live preview URL, not just localhost.

**Manual step required from you (not me):** Vercel's interactive login/project-linking. I can run `vercel` CLI commands once you've authenticated, but the initial auth is yours to do.

**Acceptance criteria:**
- [ ] Repo connected to a Vercel project
- [ ] A live URL (preview or production) is reachable and shows the pixel-art shell

**Verification:**
- [ ] Visit the deployed URL and confirm it matches local `pnpm dev`

**Dependencies:** 03

**Files likely touched:**
- None expected (dashboard/CLI action), possibly `vercel.json` if defaults need overriding

**Estimated scope:** Extra small (mostly manual)
