# GameTrace V28 extension

Build with `python source/v27/build.py`; it composes the preserved C1.10.3 baseline, V27 account/training extensions and these V28 feature files into root index.html and the existing standalone build path. Do not edit generated HTML directly.

- game-core.js: named replacements and pure timing/scoring helpers.
- journey-core.js: goal validation and trophy definitions, mirrored inside training-core.js's factory. Keep them identical when editing those helpers.
- features.js / features.css: journey UI and game workflow additions.

No new external assets or client dependencies. Goals and priorities sync as distinct goal/goal_order records after migration 003. Existing games/sessions/clip kinds retain their protocol. Entire goals, including entries, are version-checked as a unit. Competing priorities/goals use the same explicit review/history flow as other family records.

New client-created games use prepareGame to mark pendingStart/scoreTracking; newGame remains compatible with the established core API. Existing missing-flag games are treated as legacy. Paired timeout boundaries preserve IN/OUT state, are excluded from timing and cannot overlap. Final-score edits in tracked games must use score_set checkpoints rather than silently changing the aggregate.

Trophies are a projection of source records, with no independently writable award count. Milestones and dates recalculate from retained sessions/goals. Surprise context freezes the applicable collection when a source is first logged. Tombstoned sources still occupy their selection slot to avoid rerolling other awards; their own awards are hidden. Award IDs deduplicate by source and metric. Per-device seen IDs prevent repeated reveals; replay/preview are explicit.

Run all suites documented in tests/README.md. Browser QA fixtures belong only in ignored preview/. Never ship synthetic records or auth fixtures. Deploy development only until separately authorized.
