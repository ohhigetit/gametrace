# V35 — visible training feedback and connected Playbook

Mike approved implementation and production deployment on November 4, 2026. This includes the previously approved V34 Home Court, menu order and account-flow refinements.

Training and camp forms and saved rows always show Player Feedback. All three existing See / Become / Become More questions remain unchanged and optional. Historical answers keep their original questions. Progress notes/details and historical reflections retain their separate disclosure controls.

Saved sessions and Game Reports have an optional Playbook section. Select one or more existing steps for the same player; create new steps separately in Playbook. Expanded step cards show linked activities and open the original game/session. Removing a link keeps the activity. Links never update self-ratings, achievement status, reflection answers or trophy eligibility. Repeating a session does not inherit its evidence links.

References are stored once in each goal's `links` array as `{kind: 'game'|'session', id}`. Validation accepts older goals without links, caps lists at 2,000, and rejects duplicate or invalid references. Missing/deleted/mismatched-player activities stay recoverable but cannot be opened from a step. References are retained through editing, JSON backup/restore and the existing goal sync payload; they can arrive before their source on another device. No SQL/schema migration or user-data reset is included. Refresh every participating family device before editing steps so older app validators cannot discard the new field.

Link saves compare the opened source and goal snapshots, use existing atomic goal persistence, preserve unchanged link ordering and roll back on failure. Modal edits pause family application as before. Controller, recording, score/timeline behavior and recoverable deletion remain unchanged.

Build: `python3 source/v27/build.py`. Preview: `python3 source/v35/build-preview.py`; the latter uses separate storage/media and blocks cloud requests. Its sample controls never appear in the runtime HTML.

Validation: `node tests/playbook-links-ui.cjs` (8 cases), `tests/family-sync.cjs` (22 cases, including link transport to another mocked device), Home Court, journey, V32/V30 UI, whole-game deletion, core, training and family auth workflow suites. Browser QA includes saved reflection visibility, selecting and opening a linked step, and a 320px chooser with no overflow. Mocks do not establish real-device video or real inbox behavior. Mike confirmed live password reset after updating Supabase redirect URLs; confirmation-email delivery remains an inbox acceptance item.

Deployed and verified November 4, 2026: development `f2316bdee1cfbbc4d1fe12d8908226c4915be242`, production `31bb1af8a56771475139ec773d6ae7e994cd0a11`, application tree `4e4abc60dfe3fea3cd0636dc374b4c1e15b9d3c4`, identical HTML SHA-256 `6d75610c3baabd499fa7870b8a7fbbde33c80f662f950df50373deded6ad546c`. No data reset or SQL migration.
