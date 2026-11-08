# GameTrace Component Library — foundation v0.1

**Branch:** `feature/component-library` (based on `development`). This is an isolated source-only foundation. It is **not** connected to the running GameTrace app and is **not deployed**.

## Architecture

- `game-trace-components.js`: reusable, state-independent DOM renderers.
- `game-trace-components.css`: scoped Day-theme styling; token fallback values require comparison with canonical app styles.
- `preview.html`: illustrative manual inspection, using synthetic data only.

Components available:

| Component | Parent | Approval status |
| --- | --- | --- |
| Section | — | Foundation implementation; final code parity pending |
| List | — | Foundation implementation; final code parity pending |
| SharedBanner | — | User-approved design V1; this code is a scaffold, not yet verified pixel-equivalent |
| ActivityList | List | Approved design screenshot; foundation awaiting visual check |
| GoalsList | List | Approved concept; implementation check pending |
| NotesList | List | Approved note type, italic quotation, origin/date; implementation check pending |
| AchievementList | List | Approved concept; implementation check pending |

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

1. **Do not switch Home Court to these renderers yet.** First compare the library against the approved screenshots on actual iPhone portrait/landscape.
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
