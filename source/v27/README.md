# GameTrace V27 — Training and Family candidate

> Current build routing: this retained builder now composes the approved source through V33. See [current templates](../../templates/current/README.md) and [standards](../../docs/GameTrace_Approved_Design_and_Development.md). The candidate/activation statements below are the original V27 release record, not current deployment status.

Built on development commit `8f063b25af4c77ecc3308dac7cd92851bf02d6e4` (C1.10.3 camera). `baseline-camera.html` is its unchanged root HTML. Existing branding, controller geometry, reporting circles and camera frame conversion are retained.

Build: `python3 source/v27/build.py`. The builder creates `index.html` and the standalone `source/v27/GameTrace_V27_Training_Family.html`.

Modules: `training-core.js` owns durations, reflection/session validation, weekly streaks and graph calculations. `app.js` adds training forms/history, graph/rings, game feedback, backup support and full-page report navigation. `family.js` implements optional Supabase REST authentication, family membership, version-checked record sync, conflicts/history and private recording uploads. `style.css` adds styles using the existing theme tokens.

Training records and game feedback extend the V12 JSON envelope and storage key. Old V11/V12 backups are accepted without changing their game/event IDs. Use V27 on all family devices; old builds do not preserve the new fields. No sample records are injected automatically. The synthetic records used for browser verification exist only in the isolated preview browser.

Cloud activation is separate: see `cloud/SETUP.md`. Live SQL policies, real authentication, account provisioning and actual two-device/video sync remain unverified until a project is configured. Current candidate fails closed into local-only mode. Do not treat simulated sync tests as live backend verification.

Validation: `node tests/training.cjs`, `node tests/family-sync.cjs`, `node tests/core-regression.cjs`. Browser checks used the supported cloud browser on the local preview, not an iPhone: create/repeat training and camp, hour/ring/streak update, feedback persistence, game completion, both horizontal report directions including gestures on the summary button, endpoint controls and the unconfigured-cloud state. Physical-device camera/upload checks remain pending.

This is a review candidate; no production/main promotion is included.
