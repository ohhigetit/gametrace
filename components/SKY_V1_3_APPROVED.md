# Sky Companion V1.3 — approved visual component
Approved: November 11, 2026

## Decisions
- Sky is a **separate**, globally available right-edge floating action, not a fourth button in the My Prayer / My Commitment rail.
- Match the approved soft-green/dark-green coloring, rounded **left** corners, and attached right-edge visual language.
- Sticky while scrolling; icon-only sparkle launcher, accessible name "Open Sky companion".
- Tapping opens a 75dvh chat bottom sheet; close/reopen retains in-page conversation.
- Prayer and Commitment UI and behavior must remain unchanged.
- Responsive mobile-first, safe area aware. Do not show over initial cover.
- V1.3 is **UI only**. No GameTrace data access, Gemini API call, cloud writes or persistent AI memory.
- Visual approval was given for a simulated mobile-sized prototype, **not** yet verified for the full application on an iPhone.

## Review branch integration
Branch: `review/notebook-shell-dev-baseline-20261110`
- `components/sky-component-v1.2.css` (updated to approved V1.3)
- `components/sky-component-v1.2.js` (updated to approved V1.3)
- `index.html` loads these components via relative URLs.
Names preserve the original component import paths to avoid breaking the current review integration.

## Required full-app acceptance checks
1. Open actual review app via an HTTP origin (do not use file:// for relative components). Confirm Sky appears on Home Court, Notebook, Games, Trainings, and other pages and is hidden by the initial cover.
2. Scroll Notebook with Prayer/Commitment controls expanded and collapsed: Sky must stay fixed **and never overlap** the approved rail, any navigation, or essential action buttons on iPhone portrait/landscape.
3. Open and close Sky using tap, close button, backdrop and Escape. Test 75%-height sheet, input keyboard/safe-area, scroll and message persistence on reopen.
4. Confirm Prayer and Commitment still open their existing destinations, and game recording/controllers, navigation, local records, sync, and camera are unaffected.
5. Confirm no external API calls and no changes to player data.
6. Fix any overlap or viewport issues in the review branch before promotion. Do not merge or deploy to development/production without validation and approval.

## Follow-on stages
- GameTrace read-only context provider, player authorization and selective data minimization.
- Secure Netlify serverless Gemini proxy with server-only API key and request/usage limits.

## Current status
Code committed to review branch; visual prototype approved. Full-app browser + iPhone acceptance remains pending. Development and production are unchanged.
