# GameTrace V16 source

This is the implementation candidate for Your Games and Game Report, built on the approved V15 standalone app. Production deployment is separate.

Open `GameTrace_V16_Your_Games_and_Report.html` to use the self-contained app. It includes the approved controller, real saved-game reports, chronological records, timing and final circle palette. No test games are inserted into normal storage.

Rebuild with `python3 build_v16.py`. The build needs Python 3, Node.js, and the Lucide package. Its icon-generation command currently uses the Codex runtime module location; adjust that location for another environment. All actual app icons are embedded in the resulting HTML and need no network dependency.

Build inputs are the V15 HTML/app/core plus the V16 core, flow, report and CSS modules. The V15 baseline is included unchanged. `gametrace_v16_app.js` and the V16 HTML are generated outputs.

Core checks run with Node. Browser checks use Playwright and a local Chromium executable at `/tmp/chromium`; adjust that path for a different machine. Test code creates its own local sample data and is not part of the normal app runtime.

See `GameTrace_Approved_Design_and_Development.md` for approved geometry, colors, compatibility, validation and release status.

The Start Game patch uses explicit local Save actions so it also works when native form submission is blocked in a preview frame. `test_v16_start_import.cjs` covers this regression and the sample import flow.

Import `GameTrace_V16_Test_Games.json` through Menu → Backup & Export → Import backup → Import 3 new games. The three completed synthetic games have TEST-prefixed opponents and stable IDs, so importing again does not duplicate them. Regenerate the fixture with `node create_v16_test_data.cjs`.
