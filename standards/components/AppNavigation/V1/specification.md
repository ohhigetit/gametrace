# GameTrace AppNavigation V1 — LOCKED

**Approved by user:** 2026-11-07  
**Approval:** Retain and reuse the existing GameTrace app navigation exactly as tested on the development application. No redesign or behavior change authorized.  
**Parent:** UniversalPage V1 (still under review)  
**Status:** Locked reference specification; code extraction/refactor not authorized.

## Authoritative approved implementation
The approved component is the navigation **as executed in the development app**, pinned to commit `3ca115579ef889d84de2b1da31f1cec8ee604354`.
- Runtime HTML: [index.html](https://github.com/ohhigetit/gametrace/blob/3ca115579ef889d84de2b1da31f1cec8ee604354/index.html)
- Known historical source affecting navigation: `source/v34/navigation.js` and `source/v34/navigation.css`
- Build/source composition: `source/v42/base.html`, `source/v42/refinements.js`, `source/v42/build.py`, plus subsequent integrated changes in `index.html`.
- Approved test site at time of user approval: `https://development--game-trace.netlify.app/`

**The pinned root `index.html` is authoritative; historical source files alone are NOT a complete or proven standalone extraction of the current navigation.**

## Locked requirements
1. Preserve existing navigation layout, positioning, branding, logo, icons, theme, typography, spacing, and safe-area treatment.
2. Preserve existing menu destinations, menu order, labels, icons, route mapping, and selected/active states.
3. Preserve existing open/close/menu/back interactions, including how the app resumes or retains current game state.
4. Preserve portrait and landscape navigation behaviors.
5. Reuse the same navigation implementation across applicable pages; do not independently duplicate or redesign it.
6. Keep page-specific title, subtitle, action, and CTA in the separate PageHeader component, not AppNavigation.
7. No changes to unrelated application UI, data, navigation state, camera, controller, or cloud transport.

## Non-goals
- No new slide-out menu, new navigation groups, new destinations, or different button arrangement.
- No assumption that source/v34/navigation.js is the entire currently deployed nav.
- No extraction into standalone AppNavigation.html/css/js without a separate behavioral parity audit and user approval.

## Verification before any refactor
- Capture screenshots in iPhone portrait and landscape, both supported themes, with closed/open menu.
- Compare menu labels, icons, ordering, selection and current-game continuity against the pinned baseline.
- Run existing GameTrace navigation and regression tests; verify physical iPhone manually.
- Ensure no changes to existing data or active games.

**Approval boundary:** This document locks the approved existing implementation by immutable Git commit and blob reference. It does **not** claim to be a verified isolated reusable module.
