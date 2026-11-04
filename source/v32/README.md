# V32 — Score Journey and See more. Become more.

Finalized for development deployment; production and data reset are outside this release.

- Live Game layout refinements from the earlier HTML test are integrated without changing physical controller hit geometry or the portrait recording pipeline. The progress circle and rounded action wedge share controller fill/ink; the camera row owns space below the full SVG including PASS. Short viewports can scroll rather than overlap controls.
- Timeline score paths and player marks use the same 3 CSS-pixel stroke, small score dots, restored event heights, enlarged invisible hit targets, elapsed-time period zoom, carried scores and shaded timeout intervals. Timestamps are not compressed or moved for display.
- Score Journey is a separate collapsed accordion immediately after Timeline, using Recorded Plays styles, counts, period headings and a single editable list. Graph filters do not hide it. Player basket edits open the original recorded play; team/opponent rows use the shared play form; corrections and paired timeouts have period/time controls. Existing revision checks and validation remain in force.
- The locked reflection questions apply to games, training and camps: “What did I see?”, “How did I become more?”, “What do I want to become more of?” New fields `see`, `became`, `more` are validated and travel through the existing game/session JSON, backup, cloud and CSV paths. Legacy `well`, `challenge`, `next` values remain under their original prompts in Earlier reflection, including after editing. Repeated sessions start with empty reflections.

Build: `python3 source/v27/build.py`.
Downloadable isolated test copy: `python3 source/v32/build-test.py`. It namespaces browser data and recordings, disables Family Cloud, and supplies sample game/training/camp records. The test page is not a deployment artifact.

Validation: `tests/v32-ui.cjs` covers independent accordion layout, original-event edits, score checkpoints and recalculation, paired timeout moves, invalid/stale drafts, legacy preservation, exact prompts, camp save/repeat, and backup validation. Existing training, core, journey, UI, family workflow and sync suites also pass.
