# Training Summary Banner Section — V8 (LOCKED)

**Approval:** Explicitly approved by user on 2026-11-09.  
**State:** Approved design, not integrated into Trainings or deployed.  
**Exact approved review artifact:** `GameTrace_TrainingSummaryBanner_V8_Transparent_TEST.html`  
**SHA-256:** `f1553bacbab5a46fdd768cd7515260bcfa7582cff83ce43f167319cbfe81030e`  

## Locked contract

- Component: Training Summary Banner Section, inheriting Section V1 and the approved SharedBanner layout.
- Section Header owns the title/subtitle. **No duplicate header within the banner.**
- Banner: soft-green unified background across all cells, including previously button-like rounded elements; inner labels transparent.
- All content centered in each cell; headings aligned consistently at the top.
- Primary row: left "The Work You've Put In" (short message, no "Keep showing up" callout); right effort metrics (hours and consistency).
- Full-width second row: next milestone and progress.
- Third row: detailed work — session-type breakdown, **Skills Worked On**, and achievements.
- All rows permanently visible. **No Show/Hide Details** control.
- Preserve the approved typography, spacing, border treatment, rounded corners, and responsive arrangement in the exact V8 artifact.
- Source data upon integration: existing training sessions across all session types, real logged skills and earned milestones. Do not infer unmeasured skill improvement.
- No runtime or DEV/PROD changes authorized by this design approval.

## Source integrity

The above SHA-256 identifies the exact approved standalone HTML artifact. This approval record is **not** a replacement implementation and does not itself contain the preview's HTML/CSS/JS. Before integration, commit the exact approved artifact (or verbatim extracted component CSS/JS plus equivalence tests) to the canonical component library and verify its fingerprint. Do not rebuild it by approximation or substitute an earlier V1–V7 design.
