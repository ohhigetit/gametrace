# Verification

From the repository root:

```
python source/v27/build.py
python cloud/build-upgrade.py
node tests/training.cjs
node tests/core-regression.cjs
node tests/family-sync.cjs
```

For the form and PostgreSQL tests, install dev-only dependencies into a separate test directory (Node 24):

```
npm install --prefix /tmp/gametrace-db-test @electric-sql/pglite@0.5.14 jsdom@30.1.3
GAMETRACE_TEST_MODULES=/tmp/gametrace-db-test/node_modules node tests/family-workflow.cjs
GAMETRACE_TEST_MODULES=/tmp/gametrace-db-test/node_modules node tests/family-database.mjs
```

The database suite uses actual PostgreSQL with pgcrypto, PL/pgSQL and RLS, plus local scaffolding for Supabase auth/storage. It exercises the exact schema and upgrade SQL; no live accounts, user records or cloud storage are touched. The DOM suite mocks network responses and tests real family rendering/actions. Real email redirects and iPhone recording behavior still require live acceptance after project-owner activation.

V28 additions:

```
node tests/journey.cjs
GAMETRACE_TEST_MODULES=/tmp/gametrace-test/node_modules node tests/journey-ui.cjs
```

The full-app DOM suite loads the actual generated HTML and exercises manual start, timeout/resume, bench scoring, custom skills, goal creation/progress/priorities, and trophy preview. Browser-native media is stubbed only in this isolated test. The existing PostgreSQL and sync suites also test migration 003, goal/order isolation, version conflicts and capability fallback.

V32 Score Journey/reflection coverage (retained in V33):

```
node tests/v32-ui.cjs
python3 source/v32/build-test.py
```

V32 exercises independent Score Journey accordion rendering, score/source-play edits, paired timeout moves, invalid and stale draft rejection, exact reflection questions across games and sessions, prior-answer preservation, and backup round trips. The downloadable test build uses its own local-data and media namespaces with Family Cloud disabled.


V33 deletion/recovery regression:

```sh
node tests/game-deletion-ui.cjs
```

Six UI checks cover confirmation/Cancel, completed-game deletion, preserved plays/reflections, report/navigation/CSV exclusion, validated backup/cloud deletion markers, restore, New Game after deleting unfinished setup, stale confirmations and failed-save rollback. Never remove real user games to run regression tests. See [the current regression matrix](../templates/current/regression-matrix.md) for suite selection and physical-device limitations.
# V34 local candidate

`node tests/home-court-ui.cjs` covers Home Court's empty and existing-data states, exact menu order/renames, per-player summaries and drill-downs, excluded deleted records, unchanged data on render, explicit game start and draft guards. `tests/journey-ui.cjs` uses the new navigation labels; original assertions and flows remain. See `source/v34/README.md` for isolated preview generation. No live service or physical-device camera behavior is established by these UI mocks.

After `python3 source/v34/build-test.py`, run `node tests/home-court-preview.cjs` to check sample-data initialization, cloud blocking, ordinary-storage preservation, separate media identity, and exclusion of preview hooks from the runtime build.

V35: `node tests/playbook-links-ui.cjs` checks always-visible session feedback, same-player session/game links, idempotent saves, original-record navigation, JSON/cloud retention, unavailable source recovery, stale/failed-save rejection, unlinking and repeated-session behavior. The two-device goals transport check in family-sync includes references whose source has not arrived yet.
