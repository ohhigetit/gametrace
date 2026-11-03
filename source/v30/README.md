# V30 pending-item completion

Built through `../v27/build.py` on V29 and the retained C1.10.3 camera/controller baseline.

- `live.js`: companion period circle, changing action wedge and anchored +/− score popover.
- `timeline.js`: shared elapsed-period score lines and player events; independent checkboxes; timeout and court strips.
- `awards-core.js`: bounded, typed persisted trophy definition/award validation.
- `family-awards.js`: Owner/Admin forms, server-authoritative writes, delivery/replay, revocation, backup import.
- `live.css`: flat control geometry, viewport/safe-area layout and graph/Next Steps styles.
- Next Steps uses existing goal IDs, `goal`/`goal_order` cloud kinds, and existing progress data. The accordion is in `../v28/features.js`.

Cloud upgrade: `../../cloud/migrations/004_family_trophies.sql`, after migration 002; it also includes 003. Until installed, custom family trophies are gated. This migration is not executed automatically. All manager permissions and award attribution are enforced in PostgreSQL, not trusted from local state or auth metadata. Locally imported awards are never uploaded as privileged writes.

Validation: tests/v30-ui.cjs, tests/journey-ui.cjs, tests/family-database.mjs, tests/family-sync.cjs, tests/family-workflow.cjs, tests/journey.cjs, tests/training.cjs, tests/core-regression.cjs.
