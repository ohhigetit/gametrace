# GameTrace — NotesList V1

**Status: APPROVED & LOCKED**  
**Approved:** November 8, 2026  
**Visual source of truth:** `standards/previews/GameTrace_GoalsList_NotesList_V1_All_Variants_PREVIEW.html`  
**Scope:** Reusable composite design only; not integrated or deployed.

## Parent composition

```
NotesList V1
└── Section V1
    ├── SectionHeader
    │   ├── Title (required)
    │   ├── Subtitle (required)
    │   └── Action (optional)
    └── SectionContent
        └── List V1
            ├── Note (zero or more)
            └── Empty State (when no records)
```

The composite **inherits** locked Section V1 and List V1 styling and responsive layout. Do not rebuild their design. No list-item navigation arrows, including on tappable rows. Supports Day and Courtside themes, responsive iPhone portrait/wider widths and optional row dividers.

## Approved variants

- **A — all notes**
- **B — player notes**
- **C — progress notes**
- **D — general notes**
- **E — by origin**
- **F — empty**

## List row mapping

Note type + optional reflection question; main note content italicized and in quotation marks; origin (e.g. WE vs Cal / Skills Training / Personal) plus date

Origin may be game, training, camp, or personal. Note content is the primary focus, truncated at 3 lines for the list but fully accessible on tap. Preserve existing Player's Notes reflection questions and note data.

The preview's example records are fictional; future integrations must use existing GameTrace data, actions, and state management. Do not add a new data schema unless separately authorized.

## Change control

**LOCKED** at user approval. Exact HTML preview is authoritative for typography, spacing, interactive variants, theme, row alignment and empty states. No development or production deployment authorized by this design lock.
