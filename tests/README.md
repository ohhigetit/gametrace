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
