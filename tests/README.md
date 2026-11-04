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

V32 local-only update:

```
node tests/v32-ui.cjs
python3 source/v32/build-test.py
```

V32 exercises independent Score Journey accordion rendering, score/source-play edits, paired timeout moves, invalid and stale draft rejection, exact reflection questions across games and sessions, prior-answer preservation, and backup round trips. The downloadable test build uses its own local-data and media namespaces with Family Cloud disabled.
