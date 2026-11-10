# GameTrace Sky Data Service V1 — Local Review

## Status
Working **read-only**, app-local prototype. Not connected to live GameTrace, Supabase or an AI API. No records were changed. No deployment was performed.

## Sources verified
- `source/v37/notebook.js` constructs Notebook entries from `db.games` / `db.trainingSessions`, with `feedback` and free-form notes.
- `cloud/migrations/007_notes_recurring.sql` supports `personal` record types `prayer`, `commitment`, `schedule`, `note` and the family record RPC.
- `cloud/migrations/003_goals.sql` supports goals stored as `goal` family records.
- `GameTrace_backup_2026-11-10.json` (provided in the conversation) was used locally to validate field names and behavior.

## Exports
`createSkyDataService({getSnapshot,authorizePlayer})` returns:
- `search({player,query,kinds,limit,offset})` — normalized, filtered, ranked results with provenance.
- `getSources({player,refs})` — explicitly requested existing source keys.
- `context({player,query,selectedKeys,maxItems,maxChars})` — selected notes first, related references second, bounded payload.
- `prepareProposal({player,category,statement,sourceKeys})` — returns **PROPOSED_NOT_SAVED**; no mutation.
- `capabilities()` — visible implemented / missing capabilities.

Valid kinds: `note`, `training`, `game`, `playbook`, `achievement`, `schedule`.

Training feedback key mapping: `see → I See`, `became → I Am`, `more → I Will Become`. These are labels for the original unrefined data, **not already validated identities or goals**.

## Host integration (future)
```js
const skyData = GameTraceSkyDataV1.createSkyDataService({
  getSnapshot: () => db,
  authorizePlayer: player => /* trusted application check that the active
    authenticated account can access this player's GameTrace records */ false
});
const refs = skyData.search({player: 'Georgina', query: 'finishing contact'});
```

**Security note:** The host's client-side `authorizePlayer` check is not authoritative against an attacker. Before enabling cloud AI retrieval, enforce Supabase family membership and player access on the server; use server-side filtering and never accept arbitrary client-selected player IDs without rechecking authorization. Do not embed privileged Supabase/service-role or AI keys in this module.

## Privacy and design boundaries
- `prayer`, `commitment`, deleted, revoked, and other unrecognized personal records are excluded.
- Data is *read only*. The service does not write originals, My DNA, Playbook, or conversations.
- Selected notes retain `source: {kind,id,field}` for traceability.
- Only allowlisted text fields appear in retrieval; raw game-event timelines, private personal objects and videos are not sent.
- Automatic related-note search is keyword based only; it does not assert semantic conclusions, competence, or mastery.
- The existing My DNA and Sky conversation persistence schemas have **not** been verified; adapters remain missing.
- Calendar summary is limited to title, activity and location, not sensitive freeform notes.

## Verification
```sh
node test-sky-data-service.cjs /path/to/GameTrace_backup_2026-11-10.json
```
The test file accepts a user-supplied backup path. The backup itself is **not included** in the repo.

## Next technical milestones
1. Review/approve the data contract and read-only behavior.
2. Integrate the adapter with a real authenticated data access layer; revalidate server permissions and privacy boundaries.
3. Design and persist My DNA, Sky threads/messages, source links and proposal statuses using a versioned migration and RLS.
4. Build confirmation-gated write endpoints, with conflict detection and audit history.
5. Connect Sky Instructions V2 to a secure AI function with bounded source context and usage limits.
