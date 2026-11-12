# Sky V1.8 — Gemini pilot integration (review only)

This stage preserves the verified V1.7 read-only local answers, Sky visuals, and **every byte of GameTrace's original `development/index.html`**. The review loader adds a temporary same-scope bridge while HTMLPreview renders GameTrace. No DEV or PROD deployment has been made.

## What is implemented
- `components/sky-component-v1.2.js`: local answers are the default. `ai on` explicitly opts into a Gemini request **for this page only**; `ai off` returns to local mode. Only a small allowlisted summary (up to 25 records across games, trainings, reflections, goals, and schedule) is sent when a question is asked in AI mode. Failure returns a local answer. No changes to records.
- `Sky_Same_Page_Review.html`: keeps the baseline unchanged and adds a review-only authorized request bridge within the app's lexical scope. HTMLPreview cannot call Gemini; it deliberately remains local-only.
- `netlify/functions/sky-chat.mjs`: server-side Gemini REST proxy. Disabled until explicitly enabled. It rejects cross-origin traffic, requires a valid Family Cloud Supabase session, checks an explicit user allowlist, bounds input size and output, and keeps `GEMINI_API_KEY` on the server.

## Required environment variables (Functions scope only)
- `SKY_GEMINI_ENABLED=true` (omit or set false to keep Gemini disabled)
- `GEMINI_API_KEY` (secret; never place in JS/HTML)
- `SKY_SUPABASE_URL` (trusted Supabase project URL)
- `SKY_SUPABASE_ANON_KEY` (same project's public key, used only server-side here)
- `SKY_ALLOWED_USER_IDS` (comma-separated Supabase auth user UUIDs permitted to pilot Sky)

**DO NOT** set these in the repository. Use Netlify's secure environment variable settings. Keep `SKY_GEMINI_ENABLED` false until the function is deployed in a protected test environment, verified, and approved. Gemini API calls may incur charges.

## Known boundaries / remaining tests
1. HTMLPreview has no serverless endpoint and stores separate browser data from the deployed domain, so the Gemini request **cannot** work from that preview. Continue testing `my data` and local questions there.
2. No live Gemini call or real-user authorization test has occurred. This is **not** a production-approved integration.
3. The endpoint validates user identity, not family membership. This pilot is protected using explicit user IDs. Before broader release, enforce family membership and deploy-wide quotas/usage budgets (instance-local limits alone are insufficient).
4. `ai on` must never be silently enabled. The user must know that short excerpts from their records are sent to Google Gemini; ensure privacy notice is accepted before production use.
5. The current review adapter does not change original game, training, note, goal, schedule, account, sync, or camera code.
6. No data should be included in logs, and no conversation history is persisted server-side.

## Acceptance steps
1. Open the **same-page review** and verify all baseline menu/pages unchanged.
2. `my data` returns counts and local questions still work.
3. `ai on` in HTMLPreview reports AI unavailable while local retrieval continues to work; `ai off` confirms local-only mode.
4. In a **separate authorized deployment only**, configure environment variables, verify 401 for no token, 403 for a valid but non-allowlisted account, 503 when disabled; then verify one allowlisted response and monitor usage.
5. Obtain approval before changing any DEV or PROD branch or enabling Gemini in a deployed environment.

## Verification on November 12, 2026
Static syntax validation of the client, review loader and serverless endpoint passed. Controlled mocks verified:
- Authenticated and explicitly allowlisted user: 200 with a Gemini-shaped answer.
- Cross-origin request: 403; missing Authorization: 401.
- Unsupported context type: 400.
- Gemini disabled: 503.
These are **mocked requests**; no live Gemini API call and no real Supabase account lookup occurred. A no-secrets test harness is saved at `tests/sky-gemini-proxy.test.mjs`.

## Steps for the first live test (not yet performed)
1. Create an isolated, restricted Netlify test deployment for this review branch; **do not modify production or existing development**, and avoid enabling PR previews with exposed secrets.
2. In Netlify **Project configuration → Environment variables**, configure the five variables listed above for the test deployment context only. Do not put API keys in GitHub or in chat. Use Functions scope if available, or the least-privileged supported scope.
3. Confirm Google Gemini API key is active and set conservative model-level usage/billing limits with the provider; the current function has **no durable per-user rate limiter** and must not be broadly enabled.
4. Start with `SKY_GEMINI_ENABLED=false`; verify that local mode continues working and that the endpoint returns 503.
5. Set it true in the isolated test context, redeploy once to apply updated environment variables, sign into Family Cloud with an explicitly allowlisted pilot account, and enter `ai on`. Only then ask one narrow AI question.
6. Verify a successful answer, data minimization, no record mutations, user-visible privacy disclosure and provider usage; then disable the flag until further approval.

**Environment limitation:** The present HTMLPreview test cannot perform an authenticated Gemini call. A working, limited-scope Netlify test deployment with authorized secrets is required. The Netlify account must be configured by someone with access; the public GitHub repository alone is insufficient.
