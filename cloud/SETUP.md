# Family Cloud activation

Status: integration candidate. No cloud account, live tables, bucket, family or credentials have been provisioned. Existing device data remains local until connection and sign-in. No video has been uploaded during development.

## Activation

1. Create or choose a Supabase project you own. Check its database, storage, upload-size and bandwidth limits and billing before using it for video.
2. Run `schema.sql` in that project's SQL editor once. It creates family membership, versioned records/history and the **private** `gametrace-clips` bucket with family membership policies. Do not use a public video bucket.
3. Enable email/password Auth. Configure email confirmation and Site URL for the chosen HTTPS GameTrace test origin. Confirm emails before signing in if confirmation is enabled.
4. In GameTrace → Family Cloud → Cloud setup, enter the project URL and **publishable** key (or legacy anon key). Never enter a service-role or secret key. The same public project connection must be entered on each family device.
5. Create your individual account, sign in, then Create family. Creating or joining a family shares that device's games and training records with that family. Keep an export backup first.
6. Share the invitation code privately with the intended family. Each member creates their own account, signs in, then joins using the code. All members have equal editing access. Regenerating the code invalidates the old code.
7. Run the live acceptance checks below before using shared data or uploading real clips.

## Sync and recovery

Changes are saved on the device first and synced while GameTrace is open. Reconnect, sign in again if necessary, then use Sync now. Competing changes to the same whole game/session are held for explicit review. Choosing the family copy retains the unsynced device copy in Cloud history for JSON export. Saved cloud versions remain in gt_history; restore uses the same expected-version guard.

Local appearance/sound preferences, active-game selection and authentication are not shared. Cloud sign-in/config and video bytes are excluded from JSON backups. JSON includes game feedback, training sessions, session reflections, notes and clip links. Older app versions can drop these added fields when saving: do not switch between old and V27 builds on the same origin after recording V27 data.

Sessions use soft deletion with restore. Removing a shared clip hides its metadata but retains its private file and local copy for recovery. It **does not free cloud storage**. Permanent storage cleanup and member removal are administration tasks for the project owner in this candidate. History retention is not automatically pruned; account storage and history growth need monitoring.

## Video behavior and limits

Camera capture remains the approved C1.10.3 portrait 1080×1920 canvas path. Local video saves finish before uploads. Upload selected clips from Family Cloud or My Recordings, or enable automatic uploads. Local copies are never removed by upload.

Automatic Wi-Fi-only uploads wait when the browser cannot identify network type (including browsers that do not expose navigator.connection.type). A manual Upload clip is the explicit override. The app must stay open for uploads; background/resumable upload is not claimed. A failed upload restarts on retry and may re-transfer the entire clip. The app limit is 500 MB per clip; the project may impose a lower limit. The app reports provider upload failures and keeps the local original.

Videos are stored privately and played using short-lived signed URLs. Editing recording details can attach a clip to a game or training session. New live recordings default to the selected game. Sign out revokes the current session remotely when connected; device records remain locally available.

## Required live acceptance checks

- Two independent accounts join the same family and both edit a session and a game.
- An unrelated authenticated account and anonymous requests cannot list family records, history or private videos, or write records through RPC/storage.
- Invite rotation invalidates the old code; expired auth refresh and sign-out work.
- Offline edits survive reload, reconnect, failed local saves and competing changes on two devices.
- Competing edits preserve both copies and the history recovery path works.
- A real iPhone recording uploads, plays from a second family account and remains locally exportable.
- Upload interruption, insufficient provider space, expired sign-in and oversized clip failure retain the original; retry works.
- Verify real iPhone Home Screen/Safari background behavior and network identification.

References: https://supabase.com/docs/guides/database/secure-data and https://supabase.com/docs/guides/storage/security/access-control .
