# GameTrace development

The development branch serves approved implementation candidates at https://development--game-trace.netlify.app/. Production is served from main and is promoted separately.

Current development release: V22. The deployable app is repository-root index.html. Reproducible inputs, modules, tests and notes are under source/v22/; run python3 build_v22.py there. Previous source under source/v16/ remains for rollback/history. Existing icons and /legacy/ are preserved.

Synthetic games are available at /test-data/GameTrace_10_Test_Games.json for manual import only. No records are automatically added. JSON backups retain full game data; CSV exports support analysis. League and feedback preferences are optional V12 fields; opening a new backup in an older app may omit fields the older app does not support.

Before production promotion, confirm this development build on the actual iPhone, including recording, saved-game reload, sticky reports and audio/nudge controls. Sound and vibration remain unverified in the user's HTML viewer. Do not promote main without separate authorization.
