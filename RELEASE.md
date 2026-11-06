# Current release: V42

The approved V42 behavior in [source/v42/README.md](/source/v42/README.md) and templates/current/ is authoritative. Build with `python3 source/v42/build.py`; earlier release/build/layout statements below are historical. Preserve all records and family permissions. Live Feed is authenticated, viewer-only, family-scoped; no migration is needed for game feeds. Optional note/Schedule cloud setup and email delivery are separate prerequisites. Deployment does not reset data or execute SQL.

# GameTrace V27 — training and family review candidate

**Current production and development: V38.** Production promotion was byte-verified November 5, 2026. See source/v38/README.md; earlier release labels below are historical. No reset or SQL execution.

**Current development: V38; production: V36.** Development is byte-verified at https://development--game-trace.netlify.app/. Cloud migration 006 is prepared but unapplied. See source/v38/README.md; earlier release statements below are historical.

**Current production: V36; development: V35.** Production was byte-verified November 4, 2026. See source/v36/README.md. Earlier release labels below are history.

**Current: V35 on both environments**, byte-verified SHA-256 `6d75610c3baabd499fa7870b8a7fbbde33c80f662f950df50373deded6ad546c`. Development application commit `f2316bdee1cfbbc4d1fe12d8908226c4915be242`; production application commit `31bb1af8a56771475139ec773d6ae7e994cd0a11`. No reset or SQL change. See source/v35/README.md.

Earlier release split (November 4, 2026): **V34 development / V33 production**. Development application commit `60e186522329a91c30e25d3d9187650793415940`, SHA-256 `18a56f14d74e5499b402f4cf5ba7fb44878e7b51bcd984161922290d3b4c2a10`, verified at https://development--game-trace.netlify.app/. Production branch and V33 bytes remain unchanged. No data reset, backend migration or account email was performed. Email delivery and private auth redirect settings remain live acceptance items.


> Current application: V33, approved and verified on both development and production November 3, 2026. Earlier destination/candidate statements below are release history. Authoritative behavior: docs/GameTrace_Approved_Design_and_Development.md; reusable baseline: templates/current/.

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


## V33 production — November 3, 2026

Whole-game deletion and recovery fix approved after implementation/validation. Application tree `98d308ef2692715248edda29f2aefde578febb84`; development application commit `0776b2c7e6a2d30b4403005b9de9584ee46dfb6a`; production application commit `d0e8c2f08c1d549e6476ba78d055781bba732da1`. Exact application SHA-256 `bc12b41965f18975e214644f49e30a94052bd6c864be9db61cbf4226c7a6ccc1` verified on both hosted targets. No actual user game was deleted during QA or deployment.

Standards and templates now designate V33 as current, retain historical releases as archives, and require regression coverage for whole-game Delete/Restore, Score Journey edits and the locked game/session reflection questions. This standards sync changes documentation/template metadata only; no application rebuild change, SQL execution, sample import or data reset.

## V34 local candidate — November 4, 2026

Home Court, approved basketball section names/order, two quick actions, record-linked overview and selected-player summaries are implemented locally. Explicit user instruction: no deployment. No remote branch update, data reset, SQL change or production promotion. V33 remains deployed. Details/verification: source/v34/README.md.

## V35 — deployed to development and production · November 4, 2026

Always-visible training/camp feedback, optional bidirectional Playbook activity navigation, V34 Home Court and account refinements. Preserve all user records. No reset or SQL migration. Live password reset is user-confirmed; email-confirmation inbox acceptance remains. See source/v35/README.md.
