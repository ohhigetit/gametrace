# GameTrace V26 sound-tone template

Status: approved for development deployment; production remains V16. V24 is the rollback baseline.

The template adds Soft click, Digital tick, Basketball bounce, Court tap, Net swish, Scoreboard beep, Sneaker squeak, Soft pop and Double tick to Settings → Sound tone with Preview tone. Recording sound on/off stays independent. Preview is an explicit user action and works while Sound is off. Selection is persisted, defaults to Digital tick for older backups, and accepts only the nine known identifiers. Invalid identifiers fall back to Digital tick. Keep preference changes transactional and retain the choice through JSON backup/restore and reload. Device sound and volume still apply.

`source/v26/gametrace_v26_tones.js` retains the deployed AudioContext resume path and existing Digital tick oscillator/envelope. Soft click uses a brief quieter triangle tone; Basketball bounce combines a falling low sine with a short filtered impact. All sounds are synthesized locally, without downloaded assets or a cover soundtrack. Do not revive the abandoned V23 audio rewrite.

Build from the repository/package root: `python3 source/v26/build_v26.py`. It consumes the exact approved source/v24/GameTrace_V24_Cinematic_Cover.html and tone module, and writes source/v26/GameTrace_V26_Nine_Sound_Tones.html. Browser storage stays V12 and existing data remains intact.

Checks: `test_v26_tones.cjs`, `test_v26_audio.cjs`, `test_v26_cover.cjs`, `test_v26_regression.cjs`. Node, Playwright and Chromium are test dependencies only. The saved scripts use /tmp/chromium in this development runtime; adjust the executable path on another computer. The existing core module in source/v22/ supports the regression test.

Actual offline Web Audio rendering passed for all nine distinct tones. Mocked-context tests passed preview while off, resume-before-start, persisted selection, failed-save rollback, JSON export, invalid fallback and both themes at 320/390/440px. Existing cover checks and all 22 game-flow checks passed. Physical iPhone audibility/comfort remains for Mike to test before deployment.

The app's cover, circle geometry/colors, controller hit paths, game records and deployment targets are unchanged. Mike authorized V26 development deployment. Production promotion requires separate approval.
