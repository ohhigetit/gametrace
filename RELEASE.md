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
