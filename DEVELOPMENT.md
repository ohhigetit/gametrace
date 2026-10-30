# GameTrace development

Current development release: V24 — Cinematic Cover.

The development branch serves https://development--game-trace.netlify.app/. Root index.html is the approved V24 standalone app. Production is served from main and is promoted separately.

V24 adds the approved charcoal cover to deployed V22. The controls assemble together, orange activation travels clockwise and stops on the second control, then the T cross, GameTrace and tagline reveal. Skip is available immediately; Enter GameTrace appears at the end. Reduced-motion preference shows the final logo immediately. The cover appears on page load and never interrupts internal navigation. The animation pauses when the page is hidden.

Build: run python3 source/v24/build_v24.py. The builder uses source/v22/GameTrace_V22_Compact_Reports.html and source/v24/gametrace_cover_v24.html. Output is source/v24/GameTrace_V24_Cinematic_Cover.html, identical to root index.html. V22 source remains the rollback baseline. Existing icons and /legacy/ are preserved.

Browser storage uses the same V12 key/schema. No game data or preferences are reset. The ten synthetic games remain at /test-data/GameTrace_10_Test_Games.json for manual import only. Audio remains the deployed V22 implementation, confirmed working by Mike after enabling device sound.

Before production promotion, verify the cover and recording on the actual iPhone. Do not promote main without separate authorization.
