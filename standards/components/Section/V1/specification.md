# GameTrace — Section Component V1

**Status: APPROVED & LOCKED**  
**Approved:** November 8, 2026  
**Authority:** User-approved interactive HTML preview `standards/previews/GameTrace_Section_V1_Interactive_PREVIEW.html`.  
**Scope:** Reusable section wrapper inside the approved `UniversalPage V1 > PrimaryContent`. No runtime integration or dev/prod deployment authorized by this approval.

## Structure (required)
```
Section
├── SectionHeader (required)
│   ├── Title (required)
│   ├── Subtitle (required)
│   └── Action (optional)
└── SectionContent (required; page-owned)
```
The title and subtitle are always present; the subtitle is **not optional**. The header action is optional and right-aligned. The content remains page-specific: a generic slot for existing components (e.g., stats, games, schedule rows, goals), not a new opinionated card, chart, list, or accordion implementation.

## Approved action variants
- **A:** required title + subtitle, no header action.
- **B:** required title + subtitle, text-link header action.
- **C:** required title + subtitle, icon-only header action; accessible label required.
- **D:** required title + subtitle, text-and-icon header action.

All four variants are approved. Use the variant suited to each page section, without inventing additional action styles.

## Visual & behavior requirements
- Day and Courtside themes, using current design tokens; transparent section background by default.
- Header title and subtitle aligned left, action aligned right; content below header.
- Header subtitle visually subordinate to title, wraps naturally on small screens.
- Full section divider may be enabled or disabled; the approved preview offers an interactive divider toggle for review only (it does not establish a universal in-app setting).
- No outer card/border is imposed by Section; child components own their individual presentation.
- Responsive for narrow iPhone portrait and wider layouts; no overlap or clipped controls.
- Header controls retain existing app navigation/actions upon integration. Preview button handlers are demonstration only.
- Do not remove or replace existing page-specific logic/data when adapting a page.

## Preview
`standards/previews/GameTrace_Section_V1_Interactive_PREVIEW.html` — exact approved interactive design reference, including four variants, Day/Courtside, width control, divider toggle and sample SectionContent.

## Change control
This component is **LOCKED**. Further modifications require explicit user review and approval. Do not integrate or deploy on the basis of approval-and-save alone.
