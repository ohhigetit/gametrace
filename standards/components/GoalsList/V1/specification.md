# GameTrace — GoalsList V1

**Status: APPROVED & LOCKED**  
**Approved:** November 8, 2026  
**Visual source of truth:** `standards/previews/GameTrace_GoalsList_NotesList_V1_All_Variants_PREVIEW.html`  
**Scope:** Reusable composite design only; not integrated or deployed.

## Parent composition

```
GoalsList V1
└── Section V1
    ├── SectionHeader
    │   ├── Title (required)
    │   ├── Subtitle (required)
    │   └── Action (optional)
    └── SectionContent
        └── List V1
            ├── Goal (zero or more)
            └── Empty State (when no records)
```

The composite **inherits** locked Section V1 and List V1 styling and responsive layout. Do not rebuild their design. No list-item navigation arrows, including on tappable rows. Supports Day and Courtside themes, responsive iPhone portrait/wider widths and optional row dividers.

## Approved variants

- **A — all goals**
- **B — active**
- **C — completed**
- **D — priority**
- **E — empty**

## List row mapping

Goal title, category/priority, existing five-dot progress indicator, goal status

Goals are sourced from the existing Playbook; preserve priority ordering and goal detail/edit behavior.

The preview's example records are fictional; future integrations must use existing GameTrace data, actions, and state management. Do not add a new data schema unless separately authorized.

## Change control

**LOCKED** at user approval. Exact HTML preview is authoritative for typography, spacing, interactive variants, theme, row alignment and empty states. No development or production deployment authorized by this design lock.
