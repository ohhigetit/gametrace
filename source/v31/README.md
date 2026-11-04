# Fresh Start

Explicit Settings / Family Cloud action to reset training/camp sessions and earned trophies. Nothing resets on deployment, load, or setup installation.

Shared reset requires migration `cloud/migrations/005_fresh_start.sql`, supplied through `/cloud/fresh-start.html`; it includes 003/004 and requires 002. The signed-in Owner/Admin then confirms Reset trainings and trophies in the app. The server transaction archives session/award versions, tombstones sessions, revokes custom awards and creates a server-owned reset marker. Retrying the same request is idempotent. All writes share a family transaction lock; uploads from older records are tombstoned so stale devices cannot resurrect training. Reset markers are never client-uploadable. Other families, games, Next Steps, video bytes and reusable trophy definitions are preserved.

Local reset needs no cloud setup when no family is bound. A pre-reset JSON reference copy is retained on the initiating device and exportable in Settings/Family Cloud. Backups retain reset markers; derived trophies ignore pre-reset sources while new sessions can earn milestones again.

Validation: `tests/fresh-start-ui.cjs`, plus the reset/role/transaction tests in `tests/family-database.mjs`, the existing journey/training/core suites, `tests/v30-ui.cjs`, `tests/journey-ui.cjs`, and `tests/family-sync.cjs`.
