# GameTrace — ActivityList Component V1

**Status:** APPROVED & LOCKED  
**Approved:** November 8, 2026  
**Canonical visual reference:** `standards/previews/GameTrace_ActivityList_V1_Official_Phosphor_Icons_PREVIEW.html`  
**Approval scope:** Reusable design system component. **Not integrated or deployed** to development or production.

## Structure and inheritance

ActivityList V1 is a reusable composite built from the existing, locked **Section V1** and **List V1**. It must inherit those components rather than create an alternative visual system.

```
ActivityList V1
└── Section V1
    ├── SectionHeader
    │   ├── Title (required)
    │   ├── Subtitle (required)
    │   └── Action (optional)
    └── SectionContent
        └── List V1 (Variant D — Complete)
            ├── Game | Training | Camp (zero or more activity records)
            └── Empty State (when no records)
```

The **only populated row types** are recorded basketball games, training sessions and camps. The list is for recorded activity and outcomes, not a replacement for upcoming-event **ScheduleList V1**. A camp is an existing session type; do not introduce a redundant storage model.

## Approved preview variants

| Variant | Activities shown |
|---|---|
| A — All Activity | Games, training and camps |
| B — Games Only | Games |
| C — Training & Camps | Both session types |
| D — Training Only | Training |
| E — Camps Only | Camps |
| F — Empty State | No records, using inherited List V1 empty state |

All six variants are approved. The preview includes Day/Courtside theme switching, narrow/wide responsive sizes, configurable dividers and tappable example details. Demo data is illustrative, not a source of actual game/session information.

## Row format: inherited List V1, Variant D

**Leading (official Phosphor activity icon)** → **Main (activity title, date and supporting details)** → **Trailing (outcome or duration)**.

- **Game:** official Phosphor Basketball icon; date in secondary metadata; opponent/title; game type/context as available; score and W/L when present; supporting player statistics such as points, rebounds and assists only when recorded.
- **Training session:** official Phosphor Target icon for skills training or Barbell icon for performance training; date in secondary metadata; training type; coach/location and skills practiced when present; duration when recorded.
- **Camp:** official Phosphor Tent icon; date in secondary metadata; camp title; organizer/location and development focus when present; duration when recorded.
- Never fabricate missing stats, scores, times, durations, results or other values.
- Preserve consistent alignment, natural wrapping, and full visibility on iPhone portrait and landscape.
- Tappable rows use native Game Details and Session Details actions when integrated.
- **No navigation arrows or chevrons** on any List V1 row, even tappable ones.

## Supported presentation and configuration

Section V1 owns the required title and subtitle and optional action, with configurable per-page copy, e.g. Home Court's Recent Activity, Games' Recent Games, or Gym's Training & Camps. ActivityList filters the displayed activity type; supports chronological order, optional row limit, configurable row dividers and zero-record state. The list and its rows retain approved transparent surface, typography, spacing and both themes.

## Integration boundaries

The preview is an approved visual standard, **not production code**. Future integration must use real GameTrace game, training and camp records and preserve existing editing, totals, statistics, notes, results, session tracking and navigation. Do not modify the locked Section V1 or List V1 implementations without separate user approval.

## Change control

This specification and the exact approved preview are **LOCKED**. Any design change requires explicit review and approval. Saving the standard does not authorize integration or deployment.

## Approved refinement — activity icons (November 8, 2026)

This refinement **supersedes the earlier date-leading ActivityList preview**. Match the existing ScheduleList three-column geometry, but replace its calendar/date leading block with the appropriate **official Phosphor regular-weight icon**:

| Activity | Official Phosphor icon |
|---|---|
| Game | Basketball |
| Skills Training | Target |
| Performance Training | Barbell |
| Camp | Tent |

**No background fill, enclosing icon box, border, or green accent line.** Icons use neutral foreground/currentColor with consistent alignment and the approved outline-style appearance. Display the activity date as secondary information underneath the activity title. Preserve result/score or duration in the trailing column. Game statistics and skills/focus remain visible as supporting information. All six existing variants, themes, dividers, and navigation behavior remain unchanged. Embed the official SVG assets in the preview for offline iPhone use.

The exact newly approved visual source is `standards/previews/GameTrace_ActivityList_V1_Official_Phosphor_Icons_PREVIEW.html`; the previous all-variants HTML remains available as historical reference only.
