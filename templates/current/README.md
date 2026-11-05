# Current GameTrace application template — V38 development / V36 production

The latest source composes through V38, deployed and byte-verified on development. Reuse `activityListRow` for game-style session/schedule rows, preserve 30/70 Notebook tables and dedicated personal pages, and keep pending-start semantics for scheduled game creation. See source/v38/README.md.

Local review source now composes through V37. See source/v37/README.md for approved refinements and the unapplied cloud prerequisite. Production release identity below remains V36; do not publish test sample data or execute SQL as a side effect of deployment.

Production V36 is deployed and byte-verified. Start new work from source through `source/v36/`. Preserve the Day Game default and existing appearance choices; keep session feedback visible on detail pages; drafts and presets remain device-local and never count as completed work. Player choice is family/account scoped, and weekly review derives only recorded work. Release identities: release-manifest.json.

## Earlier V35 baseline


V35 is deployed and byte-verified in both environments. Start from the current source through `source/v35/`, which adds visible session feedback and optional activity links on Playbook records. Preserve references through validation and backups; never infer ratings or awards from a link. Refresh family devices before editing steps.

V35 includes the approved V34 Home Court/navigation and account refinements. Keep the environment-specific application release commits in release-manifest.json accurate. See [V34 notes](../../source/v34/README.md).

Start from the current canonical repository, never from an older standalone or an isolated demo. See [standards](../../docs/GameTrace_Approved_Design_and_Development.md) and [release manifest](release-manifest.json).

## Reproducible source

Run from the repository root:

```sh
python3 source/v27/build.py
```

The historical entry-point name is retained. It starts with the approved camera baseline and composes training/family, manual game start, scores/timeouts, Next Steps/trophies, V32 layout/reflections, V33 whole-game recovery and V34 Home Court/navigation. It writes root `index.html` and `source/v27/GameTrace_V27_Training_Family.html`; both must be byte-identical. Do not hand-edit those generated files. No runtime dependency installation is needed for the self-contained HTML.

| Area | Retained implementation |
| --- | --- |
| Camera/controller base | `source/v27/baseline-camera.html` |
| Training and persisted validation | `source/v27/training-core.js`, `app.js` |
| Family auth/sync | `source/v27/family.js` |
| Scores, timeouts, Next Steps | `source/v28/` |
| Compact Live Game | `source/v29/`, `source/v30/live.js` |
| Trophies and custom family awards | `source/v30/` |
| Explicit Fresh Start | `source/v31/` |
| Layout, timeline, editable Score Journey, locked reflections | `source/v32/` |
| Whole-game deletion and restore | `source/v33/` |

## Locked behavior for every change

Preserve approved logo/cover, physical controller actions and hit geometry, portrait camera conversion, 3PT/2PT/FT order, report-circle analytics and sound preferences. Keep player stats visible, companion progress/timeout controls consistent, and camera controls below the entire controller including PASS.

Create Game does not start play. Player baskets update Team automatically; other-player team/opponent scores stay distinct. Preserve period/timeout timing, bench lock and timestamp-based corrections. Score Journey is a standalone collapsed editable list outside Timeline; graph checkboxes do not hide it. Match score path/event bar stroke widths and preserve period zoom's carried score.

For games and sessions, use only the three locked free-text questions: What did I see? / How did I become more? / What do I want to become more of? Preserve earlier answers with their original prompts. Keep validation, JSON/CSV and family payload support aligned when adding fields.

Delete game remains accessible with confirmation and Recently deleted recovery. Preserve records in backups/cloud and omit deleted games from live/reports/CSV views. Do not introduce hard deletion, implicit game starts, resets or unsolicited sample imports.

## Local test copies

`python3 source/v32/build-test.py` generates a separate test copy from the current app. Its retained filename/menu may carry V32; it is test scaffolding, not a release identifier or deployed asset. Verify its isolated data/media namespace, sample records and disabled Family Cloud before use. Never copy it to root `index.html` or deploy it.

Use [change-template.md](change-template.md), [regression-matrix.md](regression-matrix.md) and [release checklist](../release-checklist.md). Historical source/template folders are rollback references, not current build instructions.
