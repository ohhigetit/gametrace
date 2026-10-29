# GameTrace V16 — approved release

Approved by Mike on October 29, 2026. Uses the approved Game Circle itself as the app icon, with a blank cream center and the current ring palette. No replacement GT logo is included.

Includes the V15 navigation and setup pages; simplified Your Games list; one active game at a time; automatic 24-hour completion; combined Game Report; expandable secondary stats; real-data Game Circles; Add/Edit/Delete and handle-based drag correction; editable occurrence timestamps; Game/Quarter/Half Start/End and Player In/Out records; elapsed court-time accounting excluding breaks and bench; optional final score; and the Start Game restricted-frame save fix.

The approved controller geometry and embedded sports symbols are unchanged. The app remains self-contained; icon and Apple touch metadata are embedded. Hosted manifest icons are served from `/icons/`. Synthetic test games are available at `/test-data/GameTrace_V16_Test_Games.json`, added only by manual import.

Validation before release: 69 functional/data checks, 16 phone/theme layouts, native touch dragging, and focused restricted-frame Start Game and sample import checks. Deployment verification checks exact HTML bytes, manifest/icons, recording, save/reload/resume, report corrections, both themes and legacy access. Physical Safari/iPhone testing remains a device-level follow-up.

Browser data migrates from the V11 key to `gametrace_saved_games_v12`. Original V11 bytes are retained for rollback. Existing JSON backup formats remain importable. The older tracker at `/legacy/` keeps its separate V2 browser data and is preserved unchanged. Missing timing stays explicitly missing rather than inventing measured court time.

Release process: development first, verified before promotion to main. Netlify serves repository-root `index.html`, with no build command. Timeline integration and side-by-side comparisons are separate future work.
