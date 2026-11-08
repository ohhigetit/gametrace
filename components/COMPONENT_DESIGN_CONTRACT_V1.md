# GameTrace Component Design Contract V1

**Status:** Approved, November 8, 2026  
**Scope:** Shared components and page-by-page migration to the latest approved DEV baseline.  
**Approved parity reference:** Home Court visual implementation in DEV commit `0520be04fade4c9f08000ba2838240385f2b69c6`.  
**Games approval:** Games UniversalPage V1, PageHeader, Latest Game (GameBanner V1), Recent Games (ActivityList V1), FilterModal V1, and November 8 visual refinements (banner background, footer parity, dribbling-basketball icon).  
**Deployment:** Approval of preview/design is not authorization to replace the DEV or production application.

## Core principles

1. **Reuse, do not recreate.** Every reused component inherits its appearance and interactions from its approved canonical implementation, rather than page-specific duplicate CSS.
2. **Preserve DEV baseline.** Begin each migration from the latest *approved deployed DEV app*, verify exact commit/ref first, and retain all unrelated routes, storage, events, cloud sync, and functions.
3. **Change page configuration, not component design.** Different pages may supply text, data, CTAs, event handlers, and approved variants, but not arbitrary styling overrides.
4. **Single-section increments.** Integrate and test UniversalPage/PageHeader, then feature sections, then lists, then filters. Require explicit approval per stage.
5. **No implicit deployment.** An approved HTML preview may be saved as an immutable reference; DEV/production deployment is a separate approval.

## Canonical component map

| Component | Locked source / parity check |
| --- | --- |
| UniversalPage V1 | Approved UniversalPage Parent V1, navigation/content/footer hierarchy |
| AppNavigation | Approved UniversalPage navigation; unchanged global navigation |
| PageHeader V1 | Approved PageHeader; icon, title, subtitle, page CTAs are configured per page |
| PageFooter V1 | **Home Court** Footer; same font, background, spacing, alignment, and colors on Games |
| Section V1 | Approved reusable section wrapper/header |
| GameBanner V1 | Approved GameBanner V1 (SharedBanner V2; BannerRow/BannerCell); **Home Court** is the visual parity reference for banner surface |
| ActivityList V1 / List V1 | Approved icon-box, typography, separators and list layout; Games rows use approved dribbling-basketball icon |
| FilterModal V1 | `components/approved/FilterModal_V1_Games_Baseline_APPROVED.html` (existing approved Games filters and actions) |

## Component tokens and visual parity

Shared component styling must be centralized. Prefer inherited variables, namespaced CSS, and the existing Day/Courtside theme tokens.

- **Banner:** background/gradient, border, radius, padding, status badge and CTA styling match the approved Home Court SharedBanner V2. Avoid per-page color copies.
- **Footer:** Games and Home Court must render exactly the same PageFooter V1 treatment, including background, typography, spacing and alignment.
- **Activity icon:** use the approved **dribbling-basketball** icon for game activities. Render through one canonical activity-icon registry with the approved neutral outline treatment, box sizing, and stroke color.
- **Typography and responsive behavior:** inherit approved PageHeader, Section, banner and list styles; test narrow iPhone portrait and landscape for overflow/overlap.
- **Themes:** both Day and Courtside variants must inherit the same semantic tokens.

## Games integration contract

```text
UniversalPage V1
├── AppNavigation
├── PageHeader (Games; approved icon/title/subtitle; New Game + filter trigger)
├── PrimaryContent
│   ├── Section V1: Latest Game
│   │   └── GameBanner V1 (SharedBanner V2)
│   └── Section V1: Recent Games
│       └── ActivityList V1 → List V1 (dribbling-basketball icon)
└── PageFooter V1
```

- Latest Game features an active game if present; otherwise most recent completed game. No duplicate featured game in Recent Games.
- Do not offer New Game when a game is active.
- Use actual GameTrace records, not synthetic data; preserve existing game navigation, filter state, source of truth and cloud sync.
- The page-header filter must use approved Games FilterModal V1; Reset to Default / Done must operate on actual Games data.
- GameBanner V1 uses approved background matched to Home Court. PageFooter V1 must match Home Court.
- Protect unrelated pages and avoid global selectors.

## Required quality gates per migration

1. Confirm latest approved DEV git SHA and inspect actual page before changes.
2. Check canonical component and approved preview; avoid visual approximations.
3. Verify component DOM/JS events and real underlying data, including empty, active and completed states.
4. Compare integrated rendering against the approved Home Court and component previews in Day/Courtside and iPhone portrait/landscape.
5. Validate no new console errors, broken navigation, lost features, clipping or inaccessible controls.
6. Deliver an **actual full-app** HTML preview for user verification (not a standalone mockup).
7. Record explicit user approval. Save immutable reference if requested; deploy separately only when requested.

## Migration status (November 8, 2026)

- **Games full-app preview:** User approved UniversalPage, PageHeader, Latest Game, Recent Games, Filter and visual parity refinements. Canonical local preview: `GameTrace_Games_VisualParity_HomeCourt_Refined_FULL_APP.html` (not yet committed to the app branch).
- **DEV:** remains on its existing approved app baseline; this contract does not itself integrate the Games preview or deploy.
- **Production:** unchanged.

