# GameTrace — AchievementList Component V1

**Status: APPROVED & LOCKED**  
**Approved:** November 8, 2026  
**Canonical approved preview:** `standards/previews/GameTrace_AchievementList_V1_All_Variants_PREVIEW.html`  
**Approval scope:** Component design only. No integration or deployment to dev or production.

## Structure and inheritance

AchievementList V1 is a composite of locked **Section V1** and **List V1**, not a separate visual system.

```
AchievementList V1
└── Section V1
    ├── SectionHeader
    │   ├── Title (required)
    │   ├── Subtitle (required)
    │   └── Action (optional)
    └── SectionContent
        └── List V1 (leading trophy/icon + main details + optional trailing date)
            ├── Achievement (zero or more)
            └── Empty State
```

## Approved seven variants

| Variant | Contents |
|---|---|
| A — All Achievements | Every earned achievement |
| B — Performance | Basketball/game accomplishments |
| C — Training | Training and camp milestones |
| D — Personal Growth | Effort, confidence and development |
| E — Family Recognition | Family-awarded trophies |
| F — Recent Achievements | Most recently earned achievements |
| G — Empty State | No earned achievements |

The approved preview illustrates all seven variants with Day/Courtside toggle, narrow/wide responsive layouts, configurable row dividers and tappable achievement details. Example awards are fictional.

## Row mapping and behavior

- **Leading:** recognizably trophy-style icon/artwork; preserve approved GameTrace Wall trophies and do **not** replace them with medals.
- **Main:** required achievement name; optional description, category or related context.
- **Trailing:** earned date when recorded; never invent one.
- Optional awarded-by and related game, training or camp record are supported by existing GameTrace data.
- Row taps open related achievement details via existing navigation where available.
- **No navigation arrows or chevrons**, including on tappable rows (locked List V1).
- Consistent spacing, alignment, touch targets, dividers and natural text wrapping on iPhone portrait and landscape.
- Both **Day** and **Courtside** themes, inherited Section V1 typography and List V1 rows.
- Empty state when no achievements exist.

## Integration boundaries

AchievementList V1 renders existing recorded trophies/achievements; do not add a competing database or overwrite existing award logic, family-awarded trophies, hours/streak achievements or linked activities. Source example records are only for preview purposes. The composite owns achievement-specific content mapping but inherits Section V1/List V1 layouts and styles.

## Change control

**LOCKED** by user approval. `standards/previews/GameTrace_AchievementList_V1_All_Variants_PREVIEW.html` is the exact approved interactive reference. Any design changes require explicit user approval. Design approval does **not** authorize integration or deployment.
