# GameTrace — List Component V1

**Status: APPROVED & LOCKED**  
**Approved:** November 8, 2026  
**Source of truth:** `standards/previews/GameTrace_List_V1_Variants_No_Arrows_PREVIEW.html` (the exact approved revised HTML preview).  
**Scope:** Presentational reusable list used inside `Section V1 > SectionContent`. Does not include a SectionHeader. Approval is for component design, not integration or deployment.

## Unified component

A **single List V1 component** owns its list container, repeated rows, configurable row dividers, and no-results state. Do **not** create a separately managed ListItem component. Each item comprises:

- **Main (required):** title (required), subtitle (optional), supporting text (optional).
- **Leading (optional):** date, icon, number, or other page-supplied leading content.
- **Trailing (optional):** score/value, status, progress, or page-supplied trailing content.
- **Interaction (optional):** informational or fully tappable list row; preserve page-specific navigation/callbacks.

## Approved layout variants

| Variant | Slots | Examples |
| --- | --- | --- |
| A — Simple | Main | Notebook |
| B — Leading | Leading + Main | Schedule, Gym |
| C — Trailing | Main + Trailing | Playbook |
| D — Complete | Leading + Main + Trailing | Games, Home Court |

All variants share consistent alignment, typography and spacing. Where a leading/date column is used, retain consistent width across rows; protect trailing values and statuses from clipping or overlapping the main text. Long titles/subtitles wrap gracefully on narrow screens.

## Locked refinement — no chevrons or arrows

**Do not display any navigation arrow or chevron on any list row**, including tappable rows. Row navigation, when supported, remains functional without the visual arrow. Do not restore arrows in subsequent design or integrations without explicit approval.

## Visual and behavior requirements

- Transparent background by default, with no individual row cards or imposed outer border.
- Subtle row dividers configurable on/off.
- Consistent GameTrace type hierarchy, spacing, and responsive columns.
- Minimum touch-target size for interactive rows; accessible keyboard/tap focus and meaningful action labels.
- Phosphor icon family where leading icons are used; preserve existing approved app icons where applicable.
- Day and Courtside theme support.
- Empty state shown when no items exist, demonstrated with an interactive add/reset action in the reference.
- The preview's sample data is illustrative; do not replace real application data or change business logic during integration.
- Avoid fixed column allocations that cause clipping on iPhone portrait or landscape.

## Approved HTML reference
`standards/previews/GameTrace_List_V1_Variants_No_Arrows_PREVIEW.html`

The HTML reference is the visual authority for all four variants, divider toggle, theme and viewport-width controls, tappable row behavior and empty-state presentation.

## Change control
Locked design. Any further changes require explicit user approval. Not integrated to development or production.
