# GameTrace — ScheduleList Component V1

**Status: APPROVED & LOCKED**  
**Approved:** November 8, 2026  
**Canonical reference:** `standards/previews/GameTrace_ScheduleList_V1_Composite_PREVIEW.html`

## Purpose and inheritance

ScheduleList V1 is a reusable **composite component**, not a replacement for its parent components. It composes:

```
ScheduleList V1
└── Section V1
    ├── SectionHeader
    │   ├── Title (required)
    │   ├── Subtitle (required)
    │   └── Action (optional)
    └── SectionContent
        └── List V1 (Variant D — Complete)
            └── Event records (required item type, zero or more records)
```

Section V1 provides the required header structure and the optional action. List V1 provides all list and row presentation including dividers, empty state, and interaction. **Each populated item represents an event**, never a generic goal, note, or unrelated record. Zero event records use the approved empty state.

## Approved configurations

1. **Home Court / Coming Up:** required section title and subtitle; optional `View All` action; limited preview of upcoming events (three in the approved reference).
2. **Schedule / Upcoming Events:** required title and subtitle; optional Filter action; displays all matching upcoming events in chronological order.
3. **No Events:** header remains visible and List V1 renders a friendly empty state.

## Event rows

Use locked **List V1 Variant D** with consistent columns: **date (leading)** → **event name and available secondary information such as location (main)** → **time (trailing)**. Use approved calendar-style date styling. Existing event details remain accessible by tapping rows. **No chevrons or navigation arrows** on event list items.

- Required per populated item: event record, event name, start date.
- Start time: show when present; events without a time must not be fabricated.
- Optional metadata: location, activity type, calendar/source, status, end time.
- Support canceled/rescheduled event display according to the approved preview; canceled items, when included by settings, must be clearly identified rather than shown as normal upcoming events.
- Chronological ordering and optional filtering must preserve the application's existing event semantics.

## Presentation and behavior

- Inherit approved **Section V1** and **List V1** styles rather than maintaining independent duplicated versions.
- Day and Courtside theme support; narrow iPhone portrait and wider layout support.
- Optional row dividers, responsive columns and natural wrapping without overlapping dates, event titles, or times.
- Interactive HTML reference includes Coming Up, Upcoming Events, No Events, theme/width controls, dividers, event-details modal, and canceled event toggles.
- Preview data and controls are demonstrations, not live calendar integrations.

## Integration boundaries

Use real GameTrace schedule records when integrating. Retain existing events, tap-to-open details, filters, calendar feed refresh, iCloud/ICS import, offline cache, UID-based deduplication, rescheduling, and cancellations; design approval does not authorize replacing or rewriting these systems.

**This approval locks the reusable composite component and reference preview only.** No changes to development or production are authorized without separate integration/deployment approval.
