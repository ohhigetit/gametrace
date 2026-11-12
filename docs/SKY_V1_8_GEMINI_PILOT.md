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
