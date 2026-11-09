# GameTrace Component Library — foundation v0.1

**Branch:** `feature/component-library` (based on `development`). This is an isolated source-only foundation. The ActivityList adapter is now wired into the feature-branch build source, but generated app files have **not** been committed, runtime rendering has **not** been verified, and nothing has been deployed.

## GameBanner V2 — approved & locked (Nov 8, 2026)

**Current implementation:** Full-app DEV commit [`630f723`](https://github.com/ohhigetit/gametrace/blob/630f72367f3fffccb3e03cb6d56f5100dc5e0cc6/index.html), verified as the deployed `development` branch. Design is approved for **Home Court and Games**.

**Version-locked references:**
- `components/approved/GameBanner_V2_Compact_APPROVED.css`: exact four approved style blocks from DEV, in cascade order.
- `components/COMPONENT_DESIGN_CONTRACT_V1.md`: complete layout, alignment, action and component-inheritance rules.
- `tests/gamebanner-v2-contract.cjs`: static source/CSS contract tests (optionally pass full-app HTML to check the adapters).
- `components/approved/GameBanner_V1_TwoPlusOne_Live_Completed_APPROVED.html`: preserved V1 rollback reference.

**V2 primary row:** one 2:1 Game Summary/Top Stats split; stats PTS/REB/AST/STL in a 2×2 grid. Summary center aligned, **except** team name right-aligned and opponent name left-aligned toward top-aligned centered VS. Score, label, date/status centered. No second primary row; existing Show/Hide Details preserved. Games Open Game action is in the Latest Game heading. Use existing approved banner background and shared tokens.

**Implementation caveat:** The current DEV app has separate Home Court and Games DOM adapters, both matching the same approved layout. The standalone component-library source is **not yet fully extracted/wired into the app**. Do not claim that editing a library CSS/JS file automatically changes both pages. Future extraction should converge the adapters while preserving all game/data behavior and pixel parity; review/approve before deployment. No component-library edits here change DEV or production.

## Architecture

- `game-trace-components.js`: reusable, state-independent DOM renderers.
- `game-trace-components.css`: scoped Day-theme styling; token fallback values require comparison with canonical app styles.
- `preview.html`: illustrative manual inspection, using synthetic data only.\n- `homecourt-activity-integration.js`: feature-branch Home Court adapter that composes existing rendered game/training rows into one ActivityList while preserving their DOM nodes, icon markup, and event handlers.\n- `tests/component-activity-integration.cjs`: isolated integration regression; GitHub Actions workflow checks syntax, build parity and this test.

Components available:

| Component | Parent | Approval status |
| --- | --- | --- |
| Section | — | Foundation implementation; final code parity pending |
| List | — | Foundation implementation; final code parity pending |
| SharedBanner | — | User-approved design V1; this code is a scaffold, not yet verified pixel-equivalent |
| ActivityList | List | Approved design screenshot; foundation awaiting visual check |
| GoalsList | List | Approved concept; implementation check pending |
| NotesList | List | Approved note type, italic quotation, origin/date; implementation check pending |
| AchievementList | List | **Approved icon refinement locked: V1 Championship Trophy B, outline only, neutral ActivityList ink (Nov 8, 2026).** Other component visual contracts remain as previously approved; full app integration not authorized. |

The **approved design is authoritative**. Source code is not automatically locked just because it is in the repository. Review individual previews and test visual parity before marking implementations locked.

## Approved application shell — required parent components

The component library MUST also account for these previously approved application-level building blocks, which the initial foundation inventory omitted:

| Component | Role | Implementation in this library |
| --- | --- | --- |
| **Parent Page Template** | Required shared page structure, layout, slots, spacing and responsive page behavior | **Not yet ported or verified** |
| **App Navigation** | Shared app-level navigation and its existing routes/states | **Not yet ported or verified** |
| **PageHeader** | Shared page title, subtitle, approved icon and right-aligned actions | **Not yet ported or verified** |
| **Footer** | Shared application footer | **Not yet ported or verified** |

**Composition:** App Navigation + Parent Page Template (PageHeader + page content built from Section/Banner/List components + Footer). The exact placement and hierarchy must be checked against approved source; this is a conceptual dependency map, not authorization to change layout.

These are **existing approved designs**, not candidates for redesign. Reuse/extract their approved implementations from the actual baseline, preserve exact behavior and visual styling, and avoid introducing competing headers, navigation, or footers. The new Section header is for content sections and must NOT duplicate PageHeader. No app-shell implementation or runtime integration is claimed by this inventory change.

## Data contracts

Each list takes `{items, icons, onOpen}`; `onOpen(item)` is invoked only for interactive rows. Pass real app **icon DOM nodes** (Phosphor family selected from the canonical app) keyed by `game`, `training`, `camp`, `goal`, `note`, `achievement`. Icons are cloned for each row. Existing app records are adapted at the integration boundary, not mutated.

- **Activity:** `type` (`game`, `training`, `camp`), `date` (`YYYY-MM-DD`), `title`, `context`, `description`. Game optional: `result` (`W`/`L`/`T`), `homeScore`, `awayScore`, `value`. Training/camp optional: `durationMinutes`, `category`. Explicit `metadata`, `value`, `valueLabel`, `iconNode` override generated fields.
- **Goal:** `title`, `category`, `priority`, `progressLabel`, `description`; optional `value`.
- **Note:** `note` (primary quoted italic content), `noteType`, optional `question`, `origin`, `date`.
- **Achievement:** `title`, `category`, `origin`, `date`, `description`; optional `value`.
- **Section:** required `title`; optional `subtitle`, `content` DOM Node, `actionLabel` and `onAction`.
- **SharedBanner:** required `title`; optional `subtitle`, `status`, `onAction`; two primary DOM slots and optional two secondary slots in one native disclosure control.

All strings are written through `textContent`, not inserted as HTML. The views have no localStorage, Supabase, or navigation dependencies.

## Integration guardrails

1. **Home Court ActivityList integration is feature-branch-only.** It uses the existing app row nodes (not reconstructed records). Verify it against actual DOM and approved screenshots on iPhone portrait/landscape before merging or deploying.
2. Map real records with an adapter. Never create synthetic app records, mutate IDs, scores, trainer details or saved records.
3. Source the exact production icons, spacing and color tokens. Current CSS values are provisional fallbacks.
4. Preserve existing navigation, filters, score computation, dates and cloud sync; connect `onOpen` and View All to the current routes.
5. Treat any missing approved fields as optional; do not invent values.
6. Test activity ordering, win/loss colors, zero scores, duration, empty states, keyboard access, long titles and multiple screen widths.
7. Reuse already-approved parent and child APIs after signoff; never restyle child components locally.
8. Integrate on the feature branch, regression-test, then request explicit approval before merging into `development`. Promotion to `main` requires separate approval.

## Baseline reference

The existing build remains `python3 source/v42/build.py` and the existing repository's documentation remains the authoritative runtime reference. This directory is additive and does not affect its build outputs.

## Open items before locking

- Match exact app Day-theme tokens, icon SVGs, fonts and measured spacing.
- Confirm activity Game title (team vs opponent) and score semantics for home/away.
- Validate notes question/quote/origin visual arrangement against the locked preview.
- Validate goal progress treatment and achievement trophy layout against approved previews.
- Add automated regression/visual tests and documented version changes.

## Home Court ActivityList integration (feature branch only)

The source build adds the shared component JavaScript/CSS and an adapter after the existing V42 scripts. The adapter runs after the original `renderHomeCourt`, looks for distinct **Recent Games** and **Recent Trainings** sections, and replaces those two sections with a unified **Recent Activity** section using the shared `ActivityList` and `Section` renderers.

Original row DOM nodes, icons, click handlers, and View All actions are moved rather than reimplemented. It sorts newest-first only if every rendered row exposes a parseable complete date; otherwise existing order is preserved. Missing/unknown markup results in a no-op rather than destructive replacement. No storage, cloud, backend, or game logic changes.

**Known limitation:** Current source includes only the base V42 application, which may not match later manually approved preview HTML. The adapter has not been validated on the actual Home Court DOM or an iPhone yet. Do not claim visual parity, a live preview, or deployed integration until actual build/test results confirm it. Neither `development` nor `main` has been changed.

## Locked AchievementList V1 trophy icon — 2026-11-08

- **Canonical preview:** [AchievementList_V1_Championship_Outline_APPROVED.html](approved/AchievementList_V1_Championship_Outline_APPROVED.html). This is the exact user-approved interactive HTML preview.
- **Approved choice:** Option B — Championship Trophy with star detail.
- **Stroke-only:** No fill, including inside the star.
- **Color:** Same neutral ink color as ActivityList icons; follows Day and Courtside themes.
- **Container:** No filled/colored box, border, gradient or shadow.
- **Preserve:** Approved Section V1 and List V1 layout, row typography, dividers, spacing, achievement details and interactions.
- `game-trace-components.js` uses the approved trophy as the AchievementList default icon if the caller does not explicitly pass an icon. The preview is the authority if other styles differ.
- **Scope:** Component library only. No Home Court or Wall integration, no dev or production deployment. Such integrations require separate explicit approval.

## Approved SharedBanner V2 + BannerRow + BannerCell — 2026-11-08

**Approval state:** User-approved visual variants and component hierarchy, locked as the source of truth; not yet integrated into the live application.

- [Canonical approved interactive preview](approved/SharedBanner_V2_BannerCell_Content_Variants_APPROVED.html) — five variants, Day/Courtside themes, phone/wide, disclosure controls.
- [Reusable DOM module](shared-banner-v2.js) — `window.GameTraceSharedBannerV2`.
- [Component-only CSS](shared-banner-v2.css) — all classes use `gtv2-` prefix; does not override app-wide Section styles.

**Composition:** `Section V1 (header/subtitle/action) → SharedBanner V2 → Primary/Secondary areas → BannerRow (1–N) → BannerCell (1–3 per row) → Content component(s)`.

**SharedBanner V2:** Mandatory always-visible primary rows; optional secondary rows (native Show Details/Hide Details, collapsed by default). Rows in either area may differ in number and distribution of cells.

**BannerRow V1:** 1, 2 or 3 cells, equal widths by default; optional ratio widths, vertical dividers, and row dividers; no nested page headers.

**BannerCell V1:** Controls alignment (left/center/right), compact/default padding, responsive behavior and child placement. May host one or multiple compatible content components. Individual cells do not receive independent card backgrounds.

**Approved content types:** `stat`, `info`, `status`, `progress`, `summary`, `custom`. The last may contain other approved DOM components. Source content in the demo is illustrative, not actual game data.

**API example (using approved Section V1 composition):**

```js
const {SharedBannerV2} = window.GameTraceSharedBannerV2;
const banner = SharedBannerV2({
  primaryRows: [
    {divider:true,cells:[
      {align:'center',content:{type:'stat',label:'PTS',value:12}},
      {align:'center',content:{type:'stat',label:'REB',value:5}},
      {align:'center',content:{type:'stat',label:'AST',value:3}}
    ]}
  ],
  secondaryRows:[
    {cells:[{content:{type:'summary',label:'Notes',text:'Example only'}}]}
  ]
});
const section = window.GameTraceComponents.Section({
  title:'Performance Overview',
  subtitle:'Results, progress and context',
  content:banner
});
```

**Integration boundary:** This source is **additive and isolated**. Neither `development` nor `main` nor the compiled HTML is changed by this approval. Do not replace the locked SharedBanner Parent V1 / GameSummaryBanner V1 in existing pages without separate explicit approval. The preview is authoritative for pixel-level appearance; verify against the actual development app during any future integration. The reusable implementation is ready for integration testing but has not been claimed visually identical in an app runtime.

## Approved GameBanner V1 — 2+1 Live & Completed (2026-11-08)

**Status:** User-approved and locked design reference. Approved preview is canonical. **No application integration or deployment** is authorized by this library-only commit.

- [Approved interactive HTML preview](approved/GameBanner_V1_TwoPlusOne_Live_Completed_APPROVED.html)
- **Inheritance:** Section V1 → SharedBanner V2 → BannerRow V1 → BannerCell V1 → game-specific content.
- **Primary Row 1:** exactly **two** equal BannerCells, **Team** and **Opponent**, each showing the team name and its own score. Both remain visible for live and completed games.
- **Context strip:** game date/type, current state badge, live quarter/time or final result; live progress bar only for live games.
- **Primary Row 2:** **one full-width BannerCell** containing **four evenly spaced player stats**: PTS, REB, AST, STL.
- **Secondary Content:** collapsible Show Details / Hide Details; one two-cell row (More Game Details / More Player Stats), plus a full-width context note row.
- **States:** Live Game (current score, LIVE badge, game progress, stats to date) and Completed Game (final score, WIN/LOSS, final stats). The same layout is used for both.
- **Responsive/themes:** iPhone and wide, Day and Courtside, as shown in the user-approved preview.
- **Data:** Preview uses synthetic example records only; integrating into the app requires existing real game data, score/result semantics, and navigation. No sample values should be written to records.
- **Compatibility:** SharedBanner V2 is the layout parent; preserve all locked existing GameSummaryBanner V1 and game data behaviors until integration is separately approved.

## GameCircle V1 and GameCircle Section V1 — APPROVED / LOCKED (Nov 8, 2026)

Two independently approved components, saved without any DEV or production deployment:

1. **GameCircle V1 (content component)** — original, previously approved colors and original SVG/circular analytics calculations/geometry; compact responsive circle (300px max), restrained labels and legend, **all legends and court-time label hidden by default**, one accessible left-aligned “Labels & legend” disclosure to reveal them, expanded details left-aligned. The content contains no Section header. Reference: [`approved/GameCircle_V1_APPROVED.css`](approved/GameCircle_V1_APPROVED.css).
2. **GameCircle Section V1 (composition)** — inherits the existing approved Section V1 parent treatment and supplies the section heading **Game Circles**, subtitle **Your game at a glance.**, and content slot holding the unchanged GameCircle V1. Section owns title/subtitle, spacing, outer layout; GameCircle owns SVG, details, legend, and display. Reference: [`approved/GameCircleSection_V1_APPROVED.css`](approved/GameCircleSection_V1_APPROVED.css).

**Exact, working-source reference:** [`approved/GameCircle_V1_Section_V1_FULL_APP_APPROVED.html`](approved/GameCircle_V1_Section_V1_FULL_APP_APPROVED.html) captures the user-approved full-app HTML containing both components. The two CSS files were extracted from this preview verbatim in original cascade order and are **documentation/extraction references**, not an additional stylesheet to load into production unchanged.

**Functional invariants:** `drawGameCircles(svg,g,t,timing)`, calculations, 3PT/2PT/FT, makes/misses, court time and bench time, statistical dials, win/loss ring, game navigation, filtering and game records are unchanged. No green-heavy palette, alternate color themes, 3D effects, or standalone Recorded Plays/Score Journey redesigns were approved as part of these components.

**Integration status:** V1 components approved and saved to `feature/component-library` only. The current DEV baseline remains `630f723`; this documentation commit does not deploy, replace Game Details, modify shared Section V1 source, or claim fully extracted reusable JS modules. A later Game Details integration must reuse these locked designs, preserve the live data adapters and test in both Day/Courtside themes and mobile portrait/landscape before deployment.

## Timeline V1 + TimelineSection V1 — APPROVED / LOCKED (Nov 8, 2026)

The user approved **two independent components**, stored only on `feature/component-library` and not deployed:

- **Timeline V1** — Reusable timeline **content** component, based on the existing Game Details timeline. Preserve original elapsed-time event placement, period markers, score journey, player-event display, timeouts, taps/zoom, calculations and live record data. The timeline is **always visible**: remove both "Show/Hide timeline" and "Expand/Collapse" controls. No View or score/event filter controls inside Timeline V1. Approved CSS reference: [`approved/Timeline_V1_APPROVED.css`](approved/Timeline_V1_APPROVED.css). Approved reusable DOM adapter: [`approved/Timeline_V1_APPROVED.js`](approved/Timeline_V1_APPROVED.js).
- **TimelineSection V1** — Reuse the approved **Section V1 parent**, with Game Timeline header, subtitle, and **horizontal-sliders outline icon** filter action. The filter owns four *existing* timeline settings: **View** (Whole game or Q/H period), **Team score**, **Opponent score**, and **Player events**. Checkboxes enabled and Whole game selected by default. Filter settings alter display only; no recorded data changes. Timeline V1 is the **single content child**. Reference: [`approved/TimelineSection_V1_APPROVED.css`](approved/TimelineSection_V1_APPROVED.css).

**Exact visual/functional approval reference:** [`approved/Timeline_V1_TimelineSection_V1_FULL_APP_APPROVED.html`](approved/Timeline_V1_TimelineSection_V1_FULL_APP_APPROVED.html) is the full GameTrace HTML preview approved by the user. The CSS and adapter JS files are extracted source references. The original Game Details timeline should not remain duplicated outside TimelineSection when this composition is integrated.

**Implementation boundaries:** The approved preview is not a DEV/production deployment. Reusable adapter requires the existing app's `reportTimeline` renderer. It is not an independent pure-rendering replacement for the old analytics engine. Maintain native callbacks/state while moving filters into Section. Validate on real games, iPhone portrait/landscape, both themes, and no duplicated Timeline sections before integration/deployment.

**Git status:** Saved in `feature/component-library`; DEV baseline `630f723` and production unchanged. Do not infer authorization to merge or deploy from component approval.

## GameRecord V1 + GameRecordSection V1 — APPROVED / LOCKED (Nov 8, 2026)

The user approved **two distinct components** after review of the full application. Both are stored as source/design references in the isolated `feature/component-library` branch. **No DEV or production deployment is authorized or implied.**

**GameRecord V1 — content-only component**
- Uses two visually connected **file-folder tabs**, **Play Records** and **Score Journey**. Retains the approved continuous rounded tab edge, with **no cut/notch on the tab's right side**, no redundant divider beneath the tabs, and a single content surface.
- Displays **short, compact rows**, grouped into **Q1–Q4 or H1–H2** accordions depending on the game format. Groups are **collapsed initially**.
- **Tap a record to reveal its inline accordion editor**; no separate Edit link. Existing Save/Cancel/Delete behavior and record data semantics are preserved.
- **+ Add Record** is contextual to the selected tab: play record or Score Journey; both use an **inline accordion form**, not a modal.
- Record rows have **drag handles always available** for reordering. **No Arrange / Done mode or button**. Preserve timestamp/order adjustment logic and prevent drag taps from opening the editor accidentally.
- Preserve existing Play Records and Score Journey data paths, event records, timestamps, calculations and synchronization behavior. Do not split either folder tab into a separate page section.

**GameRecordSection V1 — approved Section V1 composition**
- Inherits the preapproved **Section V1 parent**, which owns title **Game Record**, optional subtitle, section layout and spacing.
- Contains exactly **one GameRecord V1 content child**. Avoid duplicating the legacy Game Record heading.
- Approved final visual refinement: **no dividing line below the section heading and no large vertical gap** before the folder tabs. Maintain the tight spacing of the final approved preview.

**Exact approved app reference:** [`approved/GameRecord_V1_GameRecordSection_V1_FULL_APP_APPROVED.html`](approved/GameRecord_V1_GameRecordSection_V1_FULL_APP_APPROVED.html).

**Version-locked CSS:** [`approved/GameRecord_V1_APPROVED.css`](approved/GameRecord_V1_APPROVED.css) and [`approved/GameRecordSection_V1_APPROVED.css`](approved/GameRecordSection_V1_APPROVED.css) are verbatim layer extracts from the reference. These CSS files are not standalone replacements for the application's game-record JS data/edit/rendering logic. Reuse actual approved handlers and game data when integrating.

**Integration guardrails:** The approval locks the look and interaction contract, not a confirmed production extraction. Before replacing the Game Details section, verify both folder tabs, empty cases, quarter/half variants, tap-to-edit, inline add, draggable reordering, timestamp corrections, data sync, iPhone touch behavior and absence of duplicate headings or sections. Retain the approved GameCircle and Timeline compositions. Keep DEV (baseline `630f723`) and production untouched until separate deployment approval.
