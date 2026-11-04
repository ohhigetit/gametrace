# V33 — whole-game deletion restored

Regression: V32 offered deletion of recorded plays, but no whole-game deletion entry point. Restore Delete game on Game Report, existing Game details and Current Game, with explicit confirmation.

Deletion is reversible: a validated `deletedAt` marker travels with the existing game payload through device storage, JSON backups, cloud records and conflict handling. Recently deleted games on Your Games provides Restore game. The game ID, plays and feedback remain intact; recordings and other records are untouched. Deleted games are excluded from active-game selection, reports/aggregates, filters, report navigation and statistics CSVs. Deleted unfinished games do not prevent New Game or expire automatically. All family devices should refresh to this version before editing shared games.

Writes use existing version checks, transactions and save rollback. Deletion is blocked during recording and an open play edit. An unfinished deleted game can only be restored when there is no other active game. No game is deleted automatically and no reset or database migration is executed.

Validation: tests/game-deletion-ui.cjs covers Cancel, confirmation, report exclusion, preserved plays/reflection, backup/cloud tombstones, restore, New Game after deleting an unfinished setup, stale confirmation and failed-save rollback. Existing V32, core and family sync suites remain required.
