# GameTrace V25 sound-tone template

Status: implemented test candidate, not deployed. Development remains the approved V24 cover release; production remains V16.

The template adds Soft click, Digital tick and Basketball bounce to Settings → Sound tone with Preview tone. Recording sound on/off stays independent. Preview is an explicit user action and works while Sound is off. Selection is persisted, defaults to Digital tick for older backups, and accepts only the three known identifiers. Invalid identifiers fall back to Digital tick. Keep preference changes transactional and retain the choice through JSON backup/restore and reload. Device sound and volume still apply.

`source/v25/gametrace_v25_tones.js` retains the deployed AudioContext resume path and existing Digital tick oscillator/envelope. Soft click uses a brief quieter triangle tone; Basketball bounce combines a falling low sine with a short filtered impact. All sounds are synthesized locally, without downloaded assets or a cover soundtrack. Do not revive the abandoned V23 audio rewrite.

Build from the repository/package root: `python3 source/v25/build_v25.py`. It consumes the exact approved source/v24/GameTrace_V24_Cinematic_Cover.html and tone module, and writes source/v25/GameTrace_V25_Sound_Tones.html. Browser storage stays V12 and existing data remains intact.

Checks: `test_v25_tones.cjs`, `test_v25_audio.cjs`, `test_v25_cover.cjs`, `test_v25_regression.cjs`. Node, Playwright and Chromium are test dependencies only. The saved scripts use /tmp/chromium in this development runtime; adjust the executable path on another computer. The existing core module in source/v22/ supports the regression test.

Actual offline Web Audio rendering passed for all three distinct tones. Mocked-context tests passed preview while off, resume-before-start, persisted selection, failed-save rollback, JSON export, invalid fallback and both themes at 320/390/440px. Existing cover checks and all 22 game-flow checks passed. Physical iPhone audibility/comfort remains for Mike to test before deployment.

The app's cover, circle geometry/colors, controller hit paths, game records and deployment targets are unchanged. Documentation/template sync does not authorize changing root index.html or promoting production.
