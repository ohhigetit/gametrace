# GameTrace V22 — Compact Reports

Review build only. No deployment performed.

Avg / Total is a compact toolbar toggle beside the comparison selection count. It retains the expanded/collapsed state and active styling; the dedicated table toggle row is removed. Aggregate rows start collapsed and the performance summary remains visible.

Reports column headings stay visible at the viewport top while scrolling the games table. The floating visual header matches actual column widths, follows horizontal table scrolling, keeps the Game column pinned and delegates sorting to the original headers. It disappears above/below the table and is removed when switching into comparison. The original semantic table header remains available to assistive technology; the visual copy is aria-hidden. Table scrolling stays part of normal page scrolling, without a nested vertical table pane.

Validation: both themes at 320/375/390/440px for toolbar placement, collapsed state, page-scroll header pinning, exact column alignment, sideways synchronization/pinned Game, sorting through the pinned header, comparison cleanup and no page overflow. Existing import/restore failure-and-retry, aggregate/selection, icon and overlapping timeline tests pass in both themes. The 22 game-flow regression checks pass. QA screenshot inspected.

All previous League, filter, summary, controller, timeline and save safeguards remain. Sound/Nudge still require real iPhone testing in hosted Safari/Home Screen mode after a separately authorized deployment; HTML-viewer behavior remains unresolved.

Open index.html or GameTrace_V22_Compact_Reports.html. The 10 synthetic games in test-data are manual-import only.

Build: run python3 build_v22.py in source/. It reads the included V21 standalone and generated app, adds V22 JS/CSS and writes the V22 standalone and generated app. All build inputs are included.
