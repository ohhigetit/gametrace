# GameTrace development

Current approved development release: V26 — Nine Sound Tones. URL: https://development--game-trace.netlify.app/ . Root index.html is the approved standalone. Production is served from main and remains unchanged.

Settings offers nine synthesized tones, preview while Sound is off, saved selection and independent recording sound on/off. Digital tick remains the default. The approved V24 charcoal cover, controller, reports, V12 data, icons, manifest, manual test data and /legacy/ are preserved. No demo records are added automatically.

Build: python3 source/v26/build_v26.py. It consumes source/v24/GameTrace_V24_Cinematic_Cover.html and source/v26/gametrace_v26_tones.js. V24/V22 source remains for rollback. Current standards: docs/GameTrace_Approved_Design_and_Development.md. Templates: templates/v26/README.md and templates/release-checklist.md.

Validation: nine actual audio renders and tone-setting checks, both theme phone layouts, approved cover checks and 22 game-flow regressions. Actual device audio settings apply; physical iPhone review remains a follow-up. No production promotion without authorization.
