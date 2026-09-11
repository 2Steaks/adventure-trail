# Spec: Auth Module

Module id: `auth` (see `CAPABILITY_MAP.md`). Depends on: `foundation`.

## Objective

Let a user register and log in via Supabase Auth, with every non-auth route protected by a session check, and the session persisting across browser restarts.

Who: a parent setting up an adventure for their kids (per `notes/original_plan.md`'s user journey).
Success looks like: a new user can register, land on the app, close the browser, reopen it, and still be logged in; an unauthenticated visitor anywhere except `/login`/`/register` is redirected to `/login`; logging out ends the session.

Out of scope (per `ROADMAP.md`'s decision log): email verification, password reset, social/magic-link login. Bare email+password only.

## Critical finding: the Proxy has never actually run

Next.js 16 renamed `middleware.ts` to `proxy.ts` and requires it to sit **at the same level as `app/`**. This project's `app/` lives at `src/app/`, but `proxy.ts` sits at the repo root — one level too high. Confirmed by testing: moving it to `src/proxy.ts` locally changed an unauthenticated request to `/` from a silent `200` to the expected `307 → /login`. Every "protected route" claim in `SPEC-foundation.md`'s success criteria was true on paper and false in practice until now — nothing has ever actually been protected, in dev or in the live Foundation deployment.

This is the `auth` module's first task, not a separate hotfix: delete the root `proxy.ts`, keep only `src/proxy.ts`, and add `/register` to its public-path allowlist (currently only `/login`/`/auth` are excluded — without this, an unauthenticated visitor trying to register gets redirected to `/login` in a loop).

**But the Proxy fix alone is not the authorization boundary.** Next 16 renamed Middleware to Proxy specifically to discourage over-relying on it — it explicitly recommends Proxy be used "as a last resort," and its own Data Security guide states: *"Always verify authentication and authorization inside each Server Function rather than relying on Proxy alone."* Unlike Express middleware (a composable per-route chain), Next supports exactly one Proxy file for the whole app, meant for lightweight, edge-style concerns — redirects, header/cookie tweaks, *optimistic* "probably logged in" checks. A matcher change or a route move can silently remove its coverage. So: the Proxy redirect is a UX nicety (bounce a logged-out user before they see a flash of protected content); real enforcement has to live inside each Route Handler that needs it. This module adds a small `requireUser()` helper for exactly that, for `persistence` and every later module's protected API routes to use — not just this module's own (public) register/login/logout routes.

## Tech Stack

No new dependencies. Reuses what Foundation already installed:

- Supabase Auth via the existing server client (`src/lib/supabase/client.ts`) — `signUp`, `signInWithPassword`, `signOut`
- Zod for request validation (already installed, unused until now)
- TanStack Query (`useMutation`) for the register/login/logout calls from the frontend
- No browser-side Supabase client — per `ROADMAP.md`'s architecture decision, the frontend calls Next.js Route Handlers, which use the server client

## Commands

No new commands beyond what `SPEC-foundation.md` already defined (`pnpm dev`/`build`/`lint`/`test`).

## Project Structure

```text
src/
  proxy.ts                      # MOVED from repo root — the actual fix
  lib/
    supabase/
      proxy.ts                  # existing updateSession() logic; add /register to the public-path check
      require-user.ts           # requireUser(): the actual authorization boundary for protected API routes
      require-user.test.ts
    schemas/
      auth.ts                   # Zod: { email, password }
      auth.test.ts
    auth/
      hooks.ts                  # useRegister / useLogin / useLogout — TanStack Query mutations wrapping fetch()

  app/
    login/
      page.tsx                  # email + password form
    register/
      page.tsx                  # email + password form
    api/
      auth/
        register/route.ts       # POST -> supabase.auth.signUp()
        login/route.ts          # POST -> supabase.auth.signInWithPassword()
        logout/route.ts         # POST -> supabase.auth.signOut()
```

Repo-root `proxy.ts` is deleted — Next 16 supports exactly one `proxy.ts` per project.

## Code Style

Route Handlers validate with the shared schema before touching Supabase, and return a small, consistent shape:

```ts
// src/app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/client";
import { authCredentialsSchema } from "@/src/lib/schemas/auth";

export async function POST(request: Request) {
  const body = authCredentialsSchema.safeParse(await request.json());

  if (!body.success) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(body.data);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  return NextResponse.json({ success: true });
}
```

The actual authorization boundary for a protected route (used by `persistence` and later modules, not by this module's own public register/login/logout routes):

```ts
// src/lib/supabase/require-user.ts
import { createClient } from "@/src/lib/supabase/client";

export async function requireUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return { user: null, supabase } as const;
  }

  return { user: data.user, supabase } as const;
}
```

```ts
// example usage in a future protected route, e.g. src/app/api/adventures/route.ts
const { user, supabase } = await requireUser();
if (!user) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

Zod schema, mirrored client- and server-side:

```ts
// src/lib/schemas/auth.ts
import { z } from "zod";

export const authCredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type AuthCredentials = z.infer<typeof authCredentialsSchema>;
```

## Testing Strategy

- **Zod schema** (`auth.test.ts`): valid email+password passes; invalid email format, and password under 6 chars, both fail. Written first (TDD) — genuinely new logic.
- **Proxy regression tests**: two, not one — `next/experimental/testing/server`'s `unstable_doesProxyMatch`/`doesMiddlewareMatch` turned out to throw (`AsyncLocalStorage accessed in runtime where it is not available`) when imported outside a full Next server context, so it's not usable here. Instead: (1) the path-exclusion logic is extracted into a plain `isPublicPath()` function and unit-tested directly, no Next runtime needed; (2) a file-existence check asserts `src/proxy.ts` exists and root `proxy.ts` doesn't — this second one is what actually catches *this specific* bug, since a matcher-content test alone can't detect "the file is in the wrong directory and Next never loads it." Both written first against the broken state, confirmed failing, then passing after the fix.
- **`requireUser()`** (`require-user.test.ts`): mocks `supabase.auth.getUser()` to return no user → `{ user: null }`; mocks it returning a user → `{ user: <that user> }`. This is the actual authorization boundary later modules' protected routes call — written first (TDD), since it's genuinely new logic, not a characterization test.
- **Not automated this module:** a full browser register → login → logout flow (no Playwright/e2e infra yet). Verified manually against the deployed preview URL instead. Route Handlers themselves aren't unit-tested beyond the schema validation — mocking a real Supabase Auth call for `signUp`/`signInWithPassword` inside a Route Handler test is heavier than this bare-minimum module warrants; flagged as a gap, not silently skipped.

## Boundaries

- **Always:** validate register/login request bodies with `authCredentialsSchema` before calling Supabase; keep exactly one `src/proxy.ts` (Next 16 hard limit — organize route-specific logic as imported helpers, not multiple proxy files); route every Supabase Auth call through the server client inside a Route Handler, never a browser client; **every protected Route Handler calls `requireUser()` and checks the result itself — never rely on the Proxy redirect as the actual authorization boundary**, since Proxy coverage can silently break if a matcher changes or a route moves; ship as its own `feat/auth` PR per `ROADMAP.md`'s Delivery workflow.
- **Ask first:** any change to the Proxy's public-path allowlist beyond adding `/register`; adding email verification, password reset, or any login method beyond email+password (all explicitly deferred).
- **Never:** roll a custom session/token mechanism; store credentials or tokens outside Supabase's own session cookies; add a browser-side Supabase client.

## Success Criteria

- [ ] `src/proxy.ts` exists as the only `proxy.ts` in the project; root-level `proxy.ts` deleted
- [ ] Unauthenticated request to `/` redirects (`307`) to `/login` — verified live, not just in a test
- [ ] Unauthenticated requests to `/login` and `/register` return `200`, no redirect
- [ ] `/register`: email+password form, `POST /api/auth/register`, calls `signUp`; on success, redirects to `/`
- [ ] `/login`: email+password form, `POST /api/auth/login`, calls `signInWithPassword`; on success redirects to `/`; on invalid credentials, shows Supabase's returned error message inline
- [ ] A visible logout action calls `POST /api/auth/logout` (`signOut`), then redirects to `/login`
- [ ] Session persists across a browser restart (cookie-based via `@supabase/ssr` — manual verification)
- [ ] `authCredentialsSchema` tested (valid case, invalid email, short password), TDD
- [ ] Proxy matcher regression test passes
- [ ] `requireUser()` exists in `src/lib/supabase/require-user.ts`, tested for both the authenticated and unauthenticated cases, ready for `persistence`/later modules' protected API routes to call
- [ ] `pnpm build`/`lint`/`test` pass; CI green on the PR

## Open Questions

None blocking. One gap flagged, not silently dropped: no automated end-to-end browser test of the full register→login→logout flow this module — manual verification against the live preview URL instead.
