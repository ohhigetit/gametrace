# GameTrace V24 reusable app and cover templates

Approved baseline: October 30, 2026. Use the exact V24 standalone as the starting app and preserve the original logo assets. The current standards document is authoritative; earlier alternatives are historical.

## Included templates

- `../../../source/v24/GameTrace_V24_Cinematic_Cover.html`: approved standalone app, with charcoal cover, deployed to development.
- `../../source/v24/gametrace_cover_v24.html`: integrated cover fragment with embedded original artwork, scoped styles and entry lifecycle; its host app must provide `#app` and `#brandHome`. Do not use the historical sequential-green reveal or pre-activation T reveal.
- `../../source/v24/build_v24.py`: reproducible composition of the V22 baseline and approved integrated cover.
- `../../source/v22/GameTrace_V22_Compact_Reports.html`: unchanged app baseline needed by the builder.
- `../../source/v22/gametrace_core_v16.cjs`: existing V12 storage/stat logic used by the regression test.
- `../../source/v24/test_v24_cover.cjs` and `test_v24_regression.cjs`: cover/lifecycle/layout and 22 game-flow checks.
- `../../icons/`: deployed approved PNG logo assets; the complete master and all sizes are in the saved V24 standards/template package.
- `../release-checklist.md`: reusable implementation/release checklist.

## Build and verify

Run `python3 source/v24/build_v24.py` from the package root. It writes `source/v24/GameTrace_V24_Cinematic_Cover.html`, identical to the root standalone. No network or build dependency is needed for the standalone app itself.

Tests require Node.js, Playwright and a Chromium executable. The saved scripts reference `/tmp/chromium` in the development runtime; adjust that executable path for another environment. Run the two scripts under source/v24 with Playwright available through Node's module resolution. Tests use isolated browser profiles and synthetic data; never use a real user's profile for regression recording.

Keep app and cover changes separate from deployment. This template does not reset data, change the schema, import samples automatically, enable new sound tones, or promote production.
