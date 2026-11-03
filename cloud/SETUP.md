# GameTrace Family Cloud v2

## Existing GameTrace project: upgrade

Run `migrations/002_family_workflow.sql` once in the existing Supabase SQL Editor. Do **not** rerun schema.sql over existing tables. `family-upgrade.html` provides a mobile copy button with the exact migration; regenerate it with `python cloud/build-upgrade.py` if the SQL changes.

The transaction preserves existing records, promotes the family creator to Owner and expires legacy invitation codes. New codes expire in seven days. It safely stops with no changes if an account has multiple existing memberships or a family creator is missing from membership. Resolve those memberships deliberately in the dashboard before retrying; do not delete family data. Re-running after success preserves transferred ownership and current roles.

Configure Auth → URL Configuration to allow the exact application redirect:
`https://development--game-trace.netlify.app/?family_auth=1`
Use that URL for this development deployment's confirmation and reset flows. Add production only when production is separately approved. The default Supabase email templates must retain `ConfirmationURL` so Supabase verifies the email token and returns a URL-fragment session. Custom templates / PKCE callbacks need separate integration; this static app uses implicit recovery. No anonymous sign-in is required.

The app's separate Sign in, Create account and Forgot password forms use Supabase Auth. Confirmation/reset links validate the returned session via `/auth/v1/user`, remove tokens from the URL, and show the reset form for recovery sessions. Sync is paused until password reset finishes or is cancelled. Password reset returns to sign-in. Minimum client password length is eight characters; any stronger server policy also applies.

## New projects

Run schema.sql first, then migrations/002_family_workflow.sql. Enable email/password auth. Use the public/publishable project key in the client, never a service-role key. The deployed development app contains the owner's public GameTrace project connection already.

## Account, family and sharing

One membership per account is enforced by a database unique constraint and locked create/join RPCs. The creator is Owner, who may appoint Admins and transfer ownership. Owner/Admins rotate codes and remove Members. Only the Owner manages Admin roles or removes an Admin. Members can edit all shared records. The Owner must transfer before leaving. Shared records and history stay with the family when a member leaves or is removed; removal invalidates the current invitation. An already issued signed video URL may work until its ten-minute expiry. Downloaded/device copies cannot be recalled remotely.

Roles are stored in gt_members and never trusted from auth user metadata. Direct table writes are denied. The profile setter exposes only display names to fellow members, not private email addresses.

A signed-in account discovers its sole family automatically. The family name, role, members, last successful sync, record changes pending and recordings awaiting upload are shown in Family Cloud. First connection reviews unshared existing device records before any upload. Choosing Keep on this device excludes those IDs from uploading and from applying a same-ID cloud record until re-reviewed in Manage family. New records then sync normally. Same-ID competing edits require explicit resolution; device copies are preserved before applying the cloud version. Existing baselines retain prior, already approved synchronization.

If the account belongs to a different family from this device's library, synchronization is blocked until an explicit connection step archives the prior DB and sync metadata locally and starts a separate library. The archive can be exported from Family Cloud. Old family records never automatically upload to a new family. Device video files remain local and require explicit upload to another family.

## Recovery and recordings

Training sessions, deleted plays and local/shared recordings have restore controls. Local recording soft deletion retains bytes and does not free space. Deleted plays travel in their game's `deletedEvents` through JSON backup/sync. Cloud history retains previous saved versions; restoring creates a new version with an expected-version guard.

Records save locally and sync while GameTrace stays open. Sync now retries immediately. Conflicts and pending writes do not advance the last fully successful sync time. Sync pauses during editing, account operations, uploads and recovery. Sign-out revokes the current refresh session; cached device copies remain. Other signed-in devices are not signed out.

Capture remains the approved C1.10.3 portrait 1080×1920 path. Clip limit: **50 MB**. Files are private. Local save completes first. Manual upload is available; automatic uploads apply only to recordings created after enabling that option, not the existing backlog. Wi-Fi-only automatic uploads wait if connection type cannot be detected. Keep the app open; interrupted uploads retry the full clip. Upload preserves the local original. Removing a shared clip retains the file, so it does not free cloud storage.

## Verification

`node tests/training.cjs`, `node tests/core-regression.cjs`, `node tests/family-sync.cjs` cover app and sync behavior. Additional tests use npm dev-only dependencies @electric-sql/pglite and jsdom; install them into an external directory and set GAMETRACE_TEST_MODULES to its node_modules path. Run `node tests/family-database.mjs` and `node tests/family-workflow.cjs`. PGlite runs actual PostgreSQL/PLpgSQL with Supabase auth/storage scaffolding; it does not access the live project.

Still required in the actual project: apply migration, verify email redirect configuration, reset via a real email, two real accounts with different roles, invitation join, member removal, and a real iPhone video upload/playback from a second device. Live project changes and user sessions are not accessible from the source checkout.

Auth references: https://supabase.com/docs/guides/auth/passwords and https://supabase.github.io/auth/ .

## V28 Goals extension

Family Cloud setup has been confirmed working by the owner. Keep that family and its accounts. Apply `migrations/003_goals.sql` once to add goal/goal_order kinds. `goals-update.html` provides a copy button (regenerate with `python cloud/build-goals-update.py`). This migration does not reset invitations, change roles or remove existing records. Refresh every family device to V28 before sharing Goals. Goals remain locally usable before the migration; existing game/training sync continues. The client reports Goals waiting for cloud setup until authenticated feature discovery returns version 3.

Trophies derive from shared training sessions and goal records. Source fields, including custom skills, surprise-eligibility/context, progress ratings and deleted records, are included in JSON backups. The local list of already-revealed animation IDs is device-specific. Syncing existing source records never starts an unsolicited celebration.
