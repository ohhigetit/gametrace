# Sky Memory & Discovery Storage V1 — Approved Local Baseline

## Scope
Approved local in-memory model for Sky's Review Notes conversation history, messages, discovery proposals, source links and My DNA filing. **No Sky Cloud integration is planned or requested.** No SQL migrations, Supabase integration, Netlify deployment, or live AI integration are included in this commit.

## Contents
- `sky-memory-v1.cjs` — Node/CommonJS testable in-memory domain model
- `sky-memory-browser.js` — browser-compatible version of the same model
- `test-sky-memory-v1.cjs` — twelve local unit tests

## Behaviors
- Conversations can be created, listed, completed, soft-deleted with a separate confirmation, and resumed within the current runtime.
- Messages remain associated with their conversation.
- Discoveries are proposed and may be refined or dismissed.
- Exact-statement approval is required to file an I SEE or I AM discovery to My DNA.
- Original source references are preserved.
- I WILL BECOME proposals require a separate Playbook workflow, not automatic My DNA filing.
- Prayer and Commitment references are rejected when explicitly typed as private.

## Limitations
This is **memory-only**: the data disappears on page refresh or when the app closes. A future **local-only persistence approach** (e.g., browser storage or export/import) would need separate design and approval if needed for real continuity. The `authorize` callback is a local simulation, not a server-enforced security boundary; never expose another player's private records based only on this callback. The model does not validate source existence or provide a production-grade audit trail. It is not wired into the live app.

## Test
Run `node test-sky-memory-v1.cjs` from this directory.

## Local next step (without Sky Cloud)
Integrate the approved local model with SkyConversationViewV1 in an isolated test app; demonstrate create/resume, contextual sources and proposal/approval before deciding on a local persistence method.
