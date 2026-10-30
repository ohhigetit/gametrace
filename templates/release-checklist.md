# GameTrace release checklist template

Release: __________  Approved baseline: __________  Requested destination: __________

## Design and implementation

- [ ] Confirm current approved standards, actual deployed baseline and exact logo assets.
- [ ] Respect the current instruction: discussion, interactive preview, implementation or deployment.
- [ ] Keep controller geometry, icons, 3PT/2PT/FT order, circle allocations and stat colors unless explicitly changed.
- [ ] Preserve V12 saved data, migration bytes, manual JSON/CSV backup and transactional save safeguards.
- [ ] Record newly approved decisions, superseded variants and genuinely pending work.

## Cover and accessibility

- [ ] Actual flat ball/net; shot stops aligned with no pass-through.
- [ ] All green controls assemble together; orange goes clockwise and stops on second.
- [ ] Bold T cross appears only after orange stops; final original logo, name, tagline.
- [ ] Skip is immediate; Enter unlocks at completion; reduced-motion entry is immediate.
- [ ] Behind-cover app is inert; dismissal restores focus and stops animation resources.
- [ ] Internal navigation never replays the cover; background/foreground handling is correct.
- [ ] Portrait/landscape and safe areas fit without clipping or unreachable entry controls.

## App verification

- [ ] New Game, one-active-game guard, bench lock, In/Out, shot choices and feedback.
- [ ] Period start/end/next, game completion, optional score and correct actual-time totals.
- [ ] Your Games, collapsed filters, report navigation/swipe, circles, timeline and record corrections.
- [ ] Reports summary/table, collapsed Avg/Total, pinned headings and comparison of two games.
- [ ] Failed-save retry, reload/resume, JSON backup, import/restore and existing-record integrity.
- [ ] Distinguish automated/local checks from physical iPhone Safari/Home Screen results.

## Release only when requested

- [ ] Stage exact approved root index.html; preserve icons, manifest, test-data and /legacy/.
- [ ] Retain prior version and reproducible source; record SHA-256, commit and target branch.
- [ ] Update the intended branch with expected old head, without force.
- [ ] Verify live exact bytes and availability; production remains unchanged for a dev-only release.
- [ ] Save current standards/templates and release notes without silently promoting the app.
