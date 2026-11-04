# Current GameTrace regression matrix

Run relevant checks from the repository root. Expand testing only when the changed behavior or a failure warrants it. UI tests use jsdom installed outside the repository and mock browser media/network; they do not establish actual iPhone recording or live two-account behavior.

| Area | Required behavior | Existing checks |
| --- | --- | --- |
| V35 visible feedback and activity links | Current session feedback always visible; same-player references; no automatic rating/award; safe unlink; retained missing sources; stale/failed-save rollback; backup/cloud transport | `node tests/playbook-links-ui.cjs`, `node tests/family-sync.cjs` |
| Home Court/navigation (V34 local) | Cover/brand entry; exact menu order; no rendering writes; per-player summaries; priority and record drill-downs; deleted exclusion; draft guards; manual game start retained | `node tests/home-court-ui.cjs`; phone layout QA at 320/390/440px in both themes |
| Baseline/data | Generated files match; scripts parse; old backups and IDs survive; controller/portrait pipeline retained | `node tests/training.cjs`, `node tests/core-regression.cjs` |
| Live flow | Create stays unstarted; explicit Start; bench lock; period boundaries; timeout/resume; distinct player/team/opponent scores | `node tests/journey.cjs`, `node tests/journey-ui.cjs` |
| Score controls | Anchored +/− choices; nonnegative totals; individual stats unchanged by team corrections | `node tests/v30-ui.cjs` |
| Score Journey/reflections | Independent title/count accordion; original player-event edits; checkpoint recalculation; paired timeouts; exact game/session questions; legacy preservation | `node tests/v32-ui.cjs` |
| Delete/restore game | Confirmation and Cancel; data retained; omitted from reports/navigation/CSV; backup/cloud marker retained; restore; New Game released; stale/failed-save rejection | `node tests/game-deletion-ui.cjs` |
| Family transport | Offline/retry, expected versions, held conflicts, first-connect review, goals/orders, award permission paths | `node tests/family-sync.cjs` |
| Auth/workflow | Separate forms, forgot password, account/family identity, roles/invites, recovery, retained records | `node tests/family-workflow.cjs` |
| Database changes | Actual PostgreSQL RLS, member/manager isolation, capabilities, conflict/history and migrations | `node tests/family-database.mjs` when SQL/server behavior changes |
| Fresh Start | Explicit-only reset, permission/capability gates, recovery and preserved games/Next Steps/videos | `node tests/fresh-start-ui.cjs` when affected |
| Browser layout | Day/Courtside, phone widths/safe areas, no controller/camera overlap, matching thin timeline marks, reachable editors and delete controls | Supported browser QA on isolated data; record widths and evidence |
| Physical device | Portrait video, tracking while recording, stop/save/manage, zoom, sound/haptics, Safari gestures | Mike's iPhone acceptance; do not claim from mocks |
| Live family acceptance | Cross-device game/event/reflection/delete/restore, invitation/account recovery and private clip access | Authorized test family only; do not delete real user records for QA |

For jsdom suites, set `GAMETRACE_TEST_MODULES` to the directory containing installed test modules. The default UI path is `/tmp/gametrace-test/node_modules`; family workflow/database suites may default to `/tmp/gametrace-db-test/node_modules`. Test dependencies and temporary paths are not application runtime requirements.

Before a release, check that `Delete game` is discoverable on Game Report, Game details and Current Game, even if Recorded Plays deletion still works. Exercise restore, not just removal. Keep templates/release-checklist.md completed for the exact requested destination.
