# GameTrace V27 — training and family review candidate

Adds completed training/camp logging, hour achievements, weekly streaks, a weekly/cumulative progress graph, optional player reflections on games and sessions, and whole-page report navigation. Built on C1.10.3 from development, preserving its camera frame path and controller SVG.

Optional family integration includes individual sign-in, family invites/equal editing, local-first version-checked sync, conflict recovery/history and private video uploads. The owner has installed the backend SQL, and the project connection is prefilled. Authenticated family flows remain unverified. See cloud/SETUP.md for activation and required real-backend/device checks.

Validation: 13 training/backup/preservation checks, 8 simulated sync checks and 37 existing core checks passed. Local-browser checks covered training/camp save and repeat, 5-hour achievement, weekly streak, game-feedback persistence, report navigation in both directions and unconfigured cloud behavior. No user records were injected; test records exist only in the isolated preview browser.

Status: authorized for development deployment November 2, 2026. Production/main promotion is excluded. Verify the hosted HTML and family sign-in screen after deployment.

Family connection repair: verify authorized family membership before reporting sync success or generating invitations; reconnect a fresh browser to its sole authorized family; require selection for multiple families; preserve device records and prior connection metadata during explicit reconnection. Blank auth fields are rejected locally. Five new regression cases cover these paths. Authenticated live validation still requires the owner account.

## Family workflow v2 — November 2, 2026

Separate Sign in, Create account and Forgot password forms; display names; email-confirmation and password-recovery callbacks; identifiable family/role/member list; Owner/Admin invitation and membership management; seven-day invitation expiry with preview before joining; one family per account; ownership transfer before leaving. First-sync review explicitly shares existing records or keeps those IDs local. New records sync automatically while open. Last fully successful sync, pending record changes and recording uploads are shown separately. Deleted plays, training sessions and local/shared recordings are recoverable.

Backend activation: apply cloud/migrations/002_family_workflow.sql in the existing Supabase project, then allow the development email redirect documented in cloud/SETUP.md. The mobile copy page is cloud/family-upgrade.html. The migration preserves records and ownership, safely rejects conflicting legacy memberships, and invalidates legacy invitation codes. The client requires this migration for synchronization and management. Production/main is excluded from this development release.

Validation: 14 training/backup/recovery checks, 37 existing core regressions, 17 simulated sync cases, 11 form/workflow/recovery cases using jsdom, and 19 real PostgreSQL/PLpgSQL permission/migration tests using PGlite: 98 checks passed. Browser inspection covered separate account forms and family overview/management using isolated synthetic data. Actual Supabase migration, real recovery email delivery and authenticated two-device acceptance remain pending owner setup; no live user data or membership was changed by testing.

## V28 — Goals and Journey · November 3, 2026

Approved pending items implemented on development:

- Skills choices include Basketball IQ, Team practice and Skills training. A Custom checkbox reveals a bounded comma-separated field; saved custom skills become reusable choices and survive edit, repeat, backup, CSV and family sync.
- Previous/next report arrows flank the circle illustration, disabling at the ends. Whole-report swiping remains.
- Create Game saves setup without recording start boundaries. A separate Start Game begins timing; the controller is inactive until then. Unstarted games do not auto-expire.
- Timeout/Resume records paired events, excludes paused duration from both court and period time and preserves the player's IN/OUT state. Period/game end closes an open timeout. Paired timeout editing/deletion and recovery are supported.
- Player makes add once to the team score. Team +1/+2/+3 and Opponent +1/+2/+3 are available even on the bench, without affecting player stats. Absolute score corrections are timeline checkpoints; later baskets add to them. Existing games retain their prior final scores until scoring is explicitly enabled. The timeline includes scoring, running scores, timeout markers and a timeout-colored court strip.
- Goals have player, title, optional target date, dated progress notes, 1–5 self-ratings, a rating graph, editable/restorable progress, Active/Achieved status, drag ordering and Move up/down controls. Achieved goals are separate. Order records use expected-version conflict review.
- Trophy Cabinet contains per-player Training/Camp hour and session milestones, explicit Goal Achieved awards, and the approved 70 encouragement names. Occasional surprise selection is reproducible from retained source IDs, does not reroll on repeat save, and avoids recently allocated names within an applicable collection. Award context is captured on creation; source corrections/deletion recalculate earned milestones. Only new completed sessions or new progress generate surprise opportunities; sync/import/edit/restore do not trigger celebrations. Reopening/reachieving cannot mint duplicate award IDs.
- Trophy reveal uses a glowing ring, rising vector trophy, light sweep, particle burst, name/reason/date, optional existing sound/nudge preferences, Skip, Continue, multi-award sequencing, cabinet replay and reduced-motion support. Preview animation does not award anything.

Cloud activation: apply cloud/migrations/003_goals.sql in the existing project, using cloud/goals-update.html to copy the SQL. It extends record kinds and adds authenticated capability discovery, without changing membership, roles, invitations or data. Before activation, games/training continue syncing; goals/orders are saved locally and shown as awaiting cloud setup. Trophy data derives from shared sessions/goals, so no separate award table is needed. Refresh all family devices to V28: older clients cannot interpret the added record types or preserve new event fields.

Validation: 14 training/preservation, 37 established core, 18 journey-core, 20 sync, 11 account/workflow, 7 full-app DOM and 23 PostgreSQL/RLS/migration checks (130 total). Browser QA used isolated example data to verify report arrows, whole-report switching, score/timeout timeline and trophy reveal. The portrait camera pipeline and physical controller SVG remain byte-for-byte preserved. Live iPhone recording and authenticated two-device Goals acceptance still require owner testing after migration. Production/main promotion is excluded.

## V31 production — November 3, 2026

User approved V30's completed Score Journey, anchored score adjustments, circle/wedge game controls, Next Steps accordions and Family Trophies for production. V31 adds an explicit training/trophy Fresh Start action. Cloud setup: `/cloud/fresh-start.html` (migration 005 includes 003/004). Installing it does not reset data; the signed-in family Owner/Admin runs the reset action afterward. Private family data has not been reset by the deployment process. Full source and tested operations: source/v31/README.md.
