# GameTrace — approved design and development

## Current approved baseline — October 30, 2026

This section supersedes current-status and pending-work statements in the historical entries below. Those entries remain as the decision and release history.

- Current test candidate: **V25 — Sound Tones**, implemented on V24; not deployed. Settings includes Soft click, Digital tick and Basketball bounce, independent sound on/off, preview and saved selection.
- Latest approved app and development deployment: **V24 — Cinematic Cover**, built on the deployed V22 implementation. Exact standalone: GameTrace_V24_Cinematic_Cover.html, 606971 bytes, SHA-256 `8a0c13f2a1af0a83a99321cdb2fec73c6a38c76c17912b2b52a549ae636b369e`.
- Development: https://development--game-trace.netlify.app/ ; application release commit `8a397d8f236ac02c2af4f363307dac55995bb9ea`, tree `fc865140aa701a2fa79564dcfc87f1d917493c9f`. The live response was verified byte-for-byte.
- Production remains V16 at https://game-trace.netlify.app/ ; main `e1940dad134a1ff6c3dfa9a2d353662678629560`, HTML SHA-256 `9fb5b7fa8e4329af09d3e24ebfbd6afb330aeea0dd182748facb9afc2c44ba63`. No production promotion is authorized by saving these standards.
- Canonical public repository: https://github.com/ohhigetit/gametrace ; development branch for candidates, main for separately approved production promotion. Preserve root index.html hosting, manifest/icons, test-data and /legacy/. Do not use the separate private game-trace repository.
- Current source: source/v24/ with the approved cover fragment, builder and focused/regression tests; V22 remains the app baseline and rollback source. V23 experimental sound changes were not approved or deployed; never merge them as part of V24.

### Brand and controller

Name: **GameTrace**. Tagline: **Follow the Play. The Game. The Journey.** Use the exact approved controller-inspired logo and existing embedded PNG assets. Seven outer electric-green sectors, second clockwise from top solid basketball orange without outline; orange basketball upper center, green lower center, bold charcoal T cross and hidden G. Preserve geometry and the charcoal background. White and 50% gray previews were explorations; charcoal is approved. Do not regenerate or replace the logo with the older Game Circles mark.

App palette and logo artwork are distinct: app controller faces use #19C66A and pressed/selected feedback #F58A28; the preserved cover artwork uses its original vivid green/cyan and orange. Preserve the existing dark readable controller labels, symbols, sector hit paths and Touch/Pass positions. The controller wheel is FT, 3PT, 2PT, REB, AST, STL, FOUL, TO clockwise, with separate Touch/Pass and center substitution. Do not add historical conceptual actions to the current wheel.

### Live recording and saved games

- No running game clock. Configure 4Q or 2H and minutes per period. Game types: Regular, Playoffs, Finals. Optional League persists through setup, editing, filtering, JSON and CSV.
- A new game cannot start while an unfinished one exists. Begin on bench with Game Start and first Period Start records. Bench disables stat recording while substitution and historical correction remain available.
- End/start periods through the current-period control. End Game optionally records team/opponent score. Auto-complete unfinished games after 24 hours from start without counting idle time as court time.
- Keep actual occurrence timestamps, editable Game/Period Start/End and In/Out records, original record identities, correction/deletion and ordered drag with editable corrected times. No Undo button or separate Action History navigation item.
- Minutes derive from recorded active-period/on-court intervals, excluding breaks and bench time. Missing timing remains missing; circles may use the clearly marked 50% display assumption only.
- Storage/backup version remains 12, key gametrace_saved_games_v12. Retain V11 migration/rollback bytes. JSON is full manual backup; CSV is analysis. No cloud sync, reset, automatic demo-data import or schema change for the cover.
- Save/import/restore operations must remain transactional: failures keep edits available, do not report success or partially replace saved data, and retries apply exactly once. Preserve conflict and corrupt-data recovery safeguards.

### Navigation, Your Games and reports

- Navigation destinations: Live Game, Your Games, Reports, Backup & Export, Settings; + New Game is a quick action. Settings/configuration do not crowd the bottom controller area.
- Your Games separates Current Game from Previous Games. Previous games are simple opponent/date rows; tapping opens the combined Game Report. No Win/Loss label or separate Details CTA in the list.
- Previous Games filters sit directly above the list, collapsed by default, and never hide the current live game. Reports filters sit below the emphasized summary and start collapsed. Filters include player, team, game type, league and From/To dates. Dates share one compact row with no overlap at phone widths.
- Reports retain formatted summary and compact sortable games table. Average/Total rows start collapsed; the compact Avg / Total toggle shares the comparison toolbar rather than a separate row. Preserve weighted shooting fractions and contextual percentages, readable neutral deltas, pinned sortable column headings, horizontal synchronization and pinned Game column without nested vertical scrolling.
- Compare exactly two games: same-scale circles side by side with stats below. Performance detail retains primary/secondary layers.
- Game Report uses compact heading/summary, top-aligned score at right, editable summary metadata, one-row primary performance, Game Circles, then Game Record. Primary report stats: PTS, FG, REB, AST, STL, TOV, PF; expandable shooting order always 3PT, 2PT, FT.
- Previous/next buttons and left/right swipes navigate reports directly; scrolling and in-progress record editing must not accidentally navigate. Preserve endpoint states.
- Timeline is collapsed by default, fits the full game without horizontal timeline scrolling, and places court/bench indication at its bottom. Event bars are very thin; non-shooting bars are shorter. Do not draw activity bars for inactivity or bench time. Preserve actual time placement, period labels and nearby-event selection when marks overlap.
- Preserve the approved Game Circles geometry and full palette in the circular-report sections below: score 0–.20R, points .20–.50R, attempts .50–.70R, play/bench .70–1R; five supporting sections including Steals. Shooting split stays linear; .70 applies to supporting-dial length and bench thickness, not attempts. Zero score/attempt/time states remain explicit.

### Feedback status and pending work

The deployed V22 sound implementation is retained in V24. Mike confirmed sound works after enabling device sound. Do not reintroduce the experimental V23 rewrite. Device audio settings still govern audibility; vibration support varies by device. V25 now implements Soft click, Digital tick and Basketball bounce as a test candidate. Settings has a Sound tone selector and Preview tone button. Preview works with Sound off and does not change that toggle. Digital tick preserves the deployed confirmation sound and is the default for missing/invalid tone IDs. Preference soundTone accepts only soft-click, digital-tick or basketball-bounce, persists across reload and JSON backup/restore, and rolls back if saving fails. The optional field does not change V12 storage/schema. Actual device sound/volume still governs audibility. V25 is not deployed; V24 remains live.

### Locked cover animation

Use the approved 18-second charcoal film, with the actual completed flat 2D logo basketball and actual lower green semicircle. Early ball/net cuts are thin. The shot eases into exact alignment and stops; the ball never passes through the net. The center recenters and holds. **All eight outer controls animate into view together**, followed by a readable clockwise orange activation, stopping on the second control. **Only after activation stops does the bold T cross reveal.** GameTrace then appears, followed by the exact tagline. Finish on the original approved logo.

| Phase | Time in seconds |
| --- | --- |
| Dribble | 0–2.60 |
| Gather | 2.60–3.20 |
| Shot and alignment | 3.20–4.35 |
| Alignment hold | 4.35–4.95 |
| Recenter | 4.95–5.75 |
| Center hold | 5.75–6.20 |
| All green controls assemble together | 6.20–7.10 |
| Full ring hold | 7.10–7.70 |
| Orange clockwise sequence, final second-control stop | 7.70–12.90 |
| Selected control hold | 12.90–13.20 |
| T cross and original center finish | 13.20–14.20 |
| Logo hold | 14.20–14.55 |
| GameTrace name reveal | 14.55–15.20 |
| Tagline reveal | 15.40–16.10 |
| Final hold | 16.10–18.00, then indefinite |

Orange activation durations in milliseconds: 480, 430, 450, 420, 460, 440, 480, 520, 680, 840. Indices clockwise from the top: 1,2,3,4,5,6,7,8,1,2. Only one sector is orange at a time.

App behavior: cover on page load, never during internal navigation. Skip is available immediately. Enter GameTrace becomes available at completion and dismisses the cover; it does not create a game. Block interaction with the app behind the cover, restore focus on entry, pause while hidden, cancel animation/observation on dismissal. Reduced-motion preference shows the final logo and entry immediately. No soundtrack was added. Keep embedded assets and offline operation. The standalone rehearsal's scrub/replay tools are hidden in the app.

### Reusable workflow and verification

Use interactive in-conversation previews while refining; do not rebuild or deploy the entire app for each design iteration. Respect “no gen” as discussion only, and separate preview approval, implementation and deployment. Preserve exact approved assets when moving from preview to app.

Build from the latest approved deployed baseline, not abandoned experimental files. Preserve the previous release and source. Validate the actual change plus recording/save/report regressions; distinguish local browser checks, live-byte verification and real-device testing. Use expected-head branch updates without force; do not promote production unless requested.

V24 checks passed: simultaneous ring reveal, ten orange activation steps, final second-control selection, post-selection cross timing, Skip/entry/focus, reduced motion, portrait 320/390/440 and landscape 844 widths, no runtime errors; all 22 existing game-flow checks passed. Development served the exact approved V24 bytes and the manifest remained available. A fresh hosted Chromium navigation returned an environment connection error; physical iPhone/Safari cover validation remains a device follow-up. Do not claim those were completed.

### V25 implementation verification

All three tones passed actual offline Web Audio rendering with nonzero, unclipped output and distinct durations. Selection/preview tests cover off-state preview, resume ordering, reload persistence, JSON export, invalid-value fallback and preference rollback after failed saving. Day/Courtside settings layouts passed at 320/390/440px. Cover/reduced-motion checks and all 22 existing game-flow checks passed. Physical iPhone audio preference and comfort await user review. The approved charcoal cover remains byte-for-byte embedded.

## Historical approvals and release record

The following preserved record explains earlier versions. Current status and approved replacements above take precedence.

Circles approved by Mike on October 28, 2026. V14 controller and production release approved on October 29, 2026. The October 29 report refinements below are approved and incorporated in the V16 review candidate. Future visual changes require a new review.

## Approved circular report

Reference: radius R of the inner Game field, excluding result and stat bands.

| Layer, center outward | Radius allocation | Boundaries |
| --- | --- | --- |
| Score label | 20% | 0–0.20 R |
| Points ring | 30% | 0.20–0.50 R |
| Attempts ring, including FT | 20% | 0.50–0.70 R |
| Play / Bench | 30% | 0.70–1.00 R |

- Score label: fixed cream circle, dark player points total, always visible.
- Points: fixed ring with filled wedges proportional to points contributed. Always 3PT, 2PT, FT clockwise from the top, with absent categories omitted. The same order applies to legends and detail rows. Sky blue #71B7FF for 3PT, lighter blue #A5D5FF for 2PT, pale blue #D9EFFF for FT. No score-based resizing or point cap.
- Zero points: light cool gray #BCC3CC ring; center shows 0.
- Attempts: fixed ring. Makes occupy the inner portion, misses the outer portion, split linearly by actual makes / total attempts. No attempt-volume resizing, cap, or nonlinear shooting split. Makes match Trace: Electric Green #19C66A in Courtside and #087D42 in Day Game. Misses use pale sage #C9D8CC.
- No attempts: darker slate gray #747F8D; Shooting percentage is unavailable, not 0%. Zero makes with attempts produces an entirely pale sage ring.
- Play: light buttery yellow (#FFE9A6 / #FFECB5). Bench: lighter slate gray #454D49 in both appearances. Compute bench thickness as 0.30 R × (off-court share)^0.70. Yellow fills from 0.70 R to the inner boundary of Bench. At zero court time no yellow; at full court time no bench fill.
- Timing: actual recorded on-court elapsed time / actual active-period elapsed time; breaks excluded, in-period stoppages included. Missing timing stays missing in stored data and uses a clearly marked 50% assumption for display only.
- Result: fixed outer ring, Win matching Trace (#19C66A in Courtside / #087D42 in Day Game), magenta-pink Loss #C61975. Unknown or tied results use the neutral track color. No W/L text on the ring; result remains accessible and available in details.

## Five supporting-stat sections

| Section order | Stat | Approved color |
| --- | --- | --- |
| 1 | Rebounds | Burnt orange #DC792E |
| 2 | Fouls | Magenta #D747B0 |
| 3 | Turnovers | Amber #E5BB24 |
| 4 | Assists | Cyan #22B8D6 |
| 5, after Assists | Steals | Lime green #A3D936 |

The supporting-stat ring has five equal 72-degree sections. The approved preview places Rebounds immediately clockwise of the top, then Fouls, Turnovers, Assists, and Steals in counterclockwise section order. This supersedes the four-quadrant layout.

Each action selects exactly one dial. Ten dials maximum; actual totals above 10 remain visible in text. Solid color and fixed thickness. Dial arc lengths decrease progressively: cumulative allocation follows (count / 10)^0.70. First dial is longest, each later dial is shorter. Keep fixed section positions and neutral unselected dials.

## Approved preview baseline

Source: /workspace/gametrace-circles-steals.html. Includes 22 illustrative games, comparison selectors, shooting/time/zero cases, and expandable scoring detail. Reviewed at widths 320, 390, 736 and 1024 in light and dark appearance. Mike approved and locked this five-section Steals revision. This is the historical geometry reference. Current colors and single-game report integration follow the October 29 V16 refinement below; comparison selectors are not included in V16.

Approved preview SHA-256: 29bf39ef8060d3164ec1dc65b7e8ec1bc36fcdbc86388888dd3640073e86f8d0.

## Main app baseline

Current development candidate: GameTrace V16 — Your Games & Game Report, built on the saved V15 app. Includes the approved simplified list, combined report, real-data circles, record correction/dragging and timing boundaries. Current production release remains V14. Standalone HTML runs offline without icon or framework downloads.

Historical V15 sources: controller_review/build_v15.py, gametrace_v15_app.js, gametrace_v15_setup.js, gametrace_v15_navigation.js, gametrace_v15_views.html, gametrace_v15.css and gametrace_core_v15.cjs. Builds GameTrace_V15_Menu_Game_Setup.html from the V14 standalone baseline. The approved V14 controller and all hit paths are retained. Database and backup schema stay at V11 for V11/V12 compatibility; appearance remains a separate device preference. Production release details are recorded below.

## Theme and controller approval

Courtside uses charcoal #101211 with off-white ink #F0F4EF and Electric Green #19C66A. Day Game uses soft white #F7F8F5, dark #172119 ink, green #087D42 text and #108547 outlines. Shared flat surfaces, stronger Electric Green controller boundaries, simplified Lucide symbols, and numeric shot labels. Explicit text colors resolve the Courtside black-text issue.

Latest approved controller source: /workspace/gametrace-controller-contained-icons.html. This supersedes /workspace/gametrace-courtside-text-fixed.html visually and preserves its hit geometry. Preserve its sectors, outer boundary, and Touch/Pass geometry. Reachable follow-up choices sit near the selected action; first choice has a light green tint. Hold instructions and progress sit above the thumb, not in the center.

## Main-app implementation status

1. Completed in V12: reports, configuration, games and data tools moved into top-right Settings; bottom tools and Undo removed; remembered Courtside / Day Game appearance. Current-period label remains a shortcut.
2. Completed in V13: current-state ON COURT / ON BENCH labels, live stat recording disabled on bench, substitution kept available. Hold progress fills gradually; release cue appears above the controller. Movement cancels a hold; keyboard and assistive activation have a confirmation path.
3. Completed in V13: tapping the primary stats row expands/collapses secondary stats while the controller stays anchored. Last Action opens the latest five plays for edit/delete and links to full history. Historical corrections remain available while benched or after completion. Corrected substitution events immediately recalculate court state.
4. Completed in V16: explicit period start/end/next actions and optional final team/opponent score. No running clock; retain 4Q / 2H and customizable durations.
5. Completed in V16: editable timestamps for actions, substitutions, period boundaries and game end. Elapsed playing time comes from recorded boundaries, excluding breaks and bench time; it is not official game-clock minutes.
6. Completed in V16: Game Circles in the combined Game Report using recorded data. Separate future scope: side-by-side saved-game comparisons and the previously explored timeline.

Next step: user review of the saved V16 app, then separately authorized deployment. Saved-game comparisons and timeline integration remain future scope.

V13 validation: 25 core checks, 50 UI regression checks, 8 save-guard checks, 21 new interaction checks, and eight phone/theme layout combinations (320–440px; simulated safe areas on larger phones). Checked screenshots in light/dark, controller anchoring, bench guards, hold cancellation/progress, recent edits/deletion, completed-game correction, reload/resume, JSON/CSV export, duplicate imports, save failure/retry, corrupt-data recovery, and multi-window conflicts. The standalone app makes no network requests and embeds all eight controller symbols. These are Chromium touch/browser checks; physical iPhone testing remains useful for real thumb reach and Safari behavior.

## V14 controller integration

Mike approved applying the reviewed controller to the app. Implemented: optically aligned Touch/Pass interiors; quieter curved borders with clearer radial boundaries and the strong green perimeter; consistent icon sizing/strokes and lighter labels; numeral-first shooting hierarchy with readable captions; quieter resting center and stronger hold-ready feedback above the thumb.

Rebound uses an actual basketball outline; Foul uses a whistle. Both are native image elements inside their SVG sector groups, centered above REB / FOUL, with matching 28-unit size and 1.9-unit source stroke. The assets are embedded and recolored locally on appearance changes. Assist uses teammates; Turnover uses an outgoing arrow. Structural circle styles are scoped to the controller root to avoid dimming parts of nested icon artwork. No CSS-mask icons remain. All sector and paddle hit paths and control positions remain identical to V13.

V14 validation: 50 UI regression checks, 21 interaction checks, 8 save-guard checks, 11 focused controller checks, and eight phone/theme layouts (320–440px). Focused checks include V13-to-V14 saved-game compatibility, both icons fully contained and centered in their own sectors, theme colors, source artwork, icon stroke consistency, Assist visibility and hold-ready feedback/reset. Screenshots inspected in Courtside and Day Game. Core schema remains V11. Period/timestamp accounting and real-data Game Circles remain the next milestones. Production release details are recorded below.

## Approved V14 production release — October 29, 2026

Status: approved and deployed. Canonical repository: https://github.com/ohhigetit/gametrace. Production branch: main. Development branch: development. Netlify serves the repository-root index.html with no build command.

- Production: https://game-trace.netlify.app/
- Development: https://development--game-trace.netlify.app/
- Previous production tracker: https://game-trace.netlify.app/legacy/
- Development release commit: 45ba0e5cac1ed048b60c7a8cbecb7eb9c616f466
- Production merge commit: f07c6c8bd699cb371fa665efe63e5a4175cd3cde
- V14 HTML SHA-256: 53fc3c31c8d68a0162c6a22c4c642b4a4b6921997f8110bde439c67d64f6babc

The development and production responses were verified byte-for-byte against the approved V14 file. Development and production hosted smoke checks passed for recording, icon rendering, both appearances and save/reload/resume. The previous production tracker is preserved unmodified at /legacy/ so the original browser-stored records remain accessible on the same origin. Those older records are not automatically migrated into the V14 library. No stored game records are removed by this deployment.

V14 standalone remains the saved approved application. Repository RELEASE.md records the approved features, validation and legacy access. Production promotion preserves both main and development history through a merge commit; branch updates used expected-head checks without force.

## V15 navigation, New Game and modal updates — implementation candidate

Approved design and implementation scope: navigation has five destinations (Live Game, Games, Reports, Backup & Export, Settings). A prominent + New Game quick action sits above the destination list. The menu has no Action History item; recent/full recorded plays remain available through Last Action and existing stat drill-downs.

New Game is a dedicated page with Back and Start Game. It has player name, jersey, team, opponent, Game Type (Regular, Playoffs, Finals), and 4Q / 2H configuration. There is no date field. Each period uses a native scrollable 1–60-minute select; no seconds input is shown. Choices survive format switches and navigation through Menu, Settings and Period defaults. Creation date is assigned internally. Existing precise or longer imported durations are retained as saved options until explicitly changed, so editing an old game does not silently round it.

Settings, Backup & Export, Game details and Period defaults now use pages. Settings contains appearance, sound and default period configuration. Current-game details and extra actions are accessible above the live controller. The remaining edit/confirmation dialogs have more spacing, readable titles and shorter quick-choice headings; right-thumb placement for action choices is preserved.

Game Type persists through validation, JSON import/export and CSV exports. Older V11–V14 records remain readable and default to Regular. Database storage key and backup version remain V11. IDs, timestamps, old period snapshots and event counts are preserved. Starting a new game stages the database change and leaves the previous active game untouched if saving fails; a retry creates only one new game. Editing or ending a non-active game targets the selected game, with cancellation leaving the previous active game intact.

Validation: 25 core regression checks, 13 metadata/compatibility checks, 33 app-flow checks, 8 save-guard checks, 3 selected-game/legacy-duration checks, and eight phone/theme layout combinations (320–440px, including simulated safe areas). Screenshots inspected in Courtside and Day Game. Checked setup drafts, missing fields, both formats, metadata, recording, bench lockout, recent edits/deletion, reports, save/reload/resume, duplicate import handling, CSV/JSON, failed start/retry, corruption recovery and multi-window conflicts. Controller paths match V14 exactly; the app remains self-contained and offline-capable.

Release status: V15 is saved for review; no V15 production deployment has been performed. V14 production deployment details above remain authoritative. Period boundary/timestamp accounting and real-data report visualizations remain separate future milestones.

V15 HTML SHA-256: a08defb81242158f2db4359cbd95c1a4dc03a6b7787335a196350a300432db57.


## V16 Your Games and combined Game Report — October 29, 2026

Status: implementation completed and validated; saved review candidate, not deployed. The main app incorporates the approved interactive prototypes through /workspace/gametrace-report-lighter-bench.html. The prototype-only native-form Save failure was reproduced in a restricted iframe and resolved with explicit local Save actions; actual app correction buttons use the same direct-action approach.

Your Games is a simple current-game and previous-game list. Current shows opponent, In progress and Resume. Previous rows show only opponent and date, without Win/Loss, metrics or a separate Details button. Tapping a completed row opens Game Report. A new game cannot start while another is unfinished, including while benched or when the app was closed. Imported historical unfinished records are retained rather than silently discarded; they remain resumable until completed. An unfinished game automatically completes 24 hours after its Game Start, or creation time for older records, on open/visibility return or periodic checks while open. Stats and records are preserved. Automatic completion leaves timing explicitly incomplete rather than counting inactivity as court time.

Game Report keeps the smaller heading, details at left and final score at right. Tapping the summary opens the game editor; no separate Game details section appears in the report. The compact primary row is PTS, FG, REB, AST, STL, TOV and PF. Tapping toggles secondary detail, with 3PT, 2PT, FT order retained. Additional tracked actions remain available in relevant secondary detail and the complete record list. Game Circles follows performance; Game Record follows the circles.

Recorded plays support Add, Edit, Delete, touch/pointer drag by a dedicated handle, and keyboard arrow movement. Dragging replaces a Move button and adjusts the occurrence timestamp and period to the new chronological location; the timestamp remains editable. Invalid boundary positions produce an explanation. Game Start/End, Quarter/Half Start/End and Player In/Out are actual saved records. Start Game records the game and first period boundaries, with the player benched. Ending a period pauses recording until the next period starts. End Game optionally captures final score and records the current period end and game end.

Occurrence time is stored in occurredAt; original createdAt and event IDs remain intact. Corrected In/Out and period times recalculate court time and circles. Missing timing is retained as missing and clearly uses only a 50% display assumption. A completed game with valid zero court time has no yellow play fill. Data uses schema/storage version 12 at gametrace_saved_games_v12; it migrates V11 games automatically on the same browser origin while leaving the original gametrace_saved_games_v11 bytes unchanged for rollback. JSON imports accept V11/V12 and the existing V4 conversion; exports retain timing, score and ordering. The old /legacy/ V2 browser database is still separate.

The final palette matches the approved report: Win/Makes match Trace (Courtside #19C66A, Day Game #087D42); Loss #C61975; Misses #C9D8CC; 3PT #71B7FF, 2PT #A5D5FF, FT #D9EFFF; Bench #454D49; Play #FFE9A6 / #FFECB5; cream score center. Rebound #DC792E, Foul #D747B0, Turnover #E5BB24, Assist #22B8D6, Steal #A3D936. Ring geometry, five supporting sections, .70 dial distribution, fixed makes/miss split and zero states follow the approved definitions above.

Validation completed: 25 existing core regression checks, 12 new timing/migration tests, 22 app-flow checks, 10 storage/conflict/recovery checks (69 functional/data checks total). Also passed eight report/theme/phone layouts and eight live-controller/theme/phone layouts (320–440px, including simulated safe areas), pointer dragging in those report layouts, and an additional native touch-pointer drag. Screenshots were inspected in both themes. Existing controller hit paths, paddles and center geometry compare identically to V15/V14; all controller symbols remain embedded and the app has no external script dependencies. Physical Safari/iPhone testing has not been performed in this environment.

Sources: build_v16.py, gametrace_core_v16.cjs, gametrace_v16_flow.js, gametrace_v16_report.js and gametrace_v16.css, using the V15 standalone and generated app/core as the baseline. Build output is GameTrace_V16_Your_Games_and_Report.html. The source bundle preserves the build inputs and verification scripts. No GitHub branch or Netlify deployment was changed in this implementation task.

V16 HTML SHA-256: a7d83f5ef79c56a4bc47877e379f046db6d0b402e98183027f50e7cc49e336ca.


## V16 Start Game correction and sample backup — October 29, 2026

Mike reported Start Game was not responding. New Game and metadata Save still depended on native form submission, which a restricted preview frame can block. The buttons now explicitly dispatch the local validation/save handler without requesting native navigation. Enter in a text field follows the same path; capture-phase score validation still runs before metadata changes. Saving to device remains required, and storage failures keep the setup form open with an explanation.

Verified Start Game in an iframe with scripts, same-origin storage and modals allowed but native forms blocked; it created exactly one saved game and opened the benched controller. Re-ran all 22 app-flow checks successfully.

GameTrace_V16_Test_Games.json contains three synthetic completed games with stable IDs and TEST-prefixed opponents: Balanced win (4Q, 18 points, 24/32 minutes), Tough shooting loss (2H, 9 points, 20/40 minutes), and Defense, no shots (4Q, 0 points, 8/32 minutes). It includes actual game/period/substitution records, shot outcomes, supporting actions and final scores. The add-only import path was tested: three report rows appeared, the first circle showed 18 points and measured 24/32 minutes, and re-import offered zero new games. Completed samples do not block new-game creation.

User flow: Menu → Backup & Export → Import backup → choose the sample JSON → Import 3 new games. This adds the samples alongside existing games; the entire-backup Restore action is not needed. The sample file and generator are included in the refreshed source bundle. No deployment has been performed.


## V16 Game Circle icon and approved release — October 29, 2026

Mike chose the actual Game Circle graphic as the app logo after rejecting the proposed GT marks. The icon preserves the report renderer's ring geometry and Courtside palette, with a blank cream center instead of a sample score. It is used in the header, browser favicon and Apple Home Screen metadata. PNG sizes 32, 180, 192, 512 and 1024 plus SVG and the reproducible generator are included in the source bundle; hosted manifest uses the 192/512 assets.

The approved V16 release is deployed through the canonical ohhigetit/gametrace repository, preserving existing development history and the unchanged /legacy/ tree.

- Development commit: 99c2f457e920eeaf969185cbed40a483c5479684
- Production merge commit: e1940dad134a1ff6c3dfa9a2d353662678629560
- Tested release tree: 62cbec69cf9b65ea7f2ff0ba0897ea735e09e7f4
- Exact HTML SHA-256: 9fb5b7fa8e4329af09d3e24ebfbd6afb330aeea0dd182748facb9afc2c44ba63
- Production: https://game-trace.netlify.app/
- Development: https://development--game-trace.netlify.app/
- Synthetic samples: https://game-trace.netlify.app/test-data/GameTrace_V16_Test_Games.json

The original 69 functional/data checks, 16 layouts and focused touch/Start Game/import checks remain valid. All eight live phone/theme layouts were rerun after inserting the header icon and passed. Development hosted checks passed exact HTML bytes, icon/manifest responses, game creation/recording, save/reload/resume, final score, report correction, both appearances and legacy access. Browser storage migration preserves old V11 data; deployment does not delete browser records. Physical Safari/iPhone validation remains a device follow-up.

Production hosted verification passed the same exact-byte and runtime checks as development, including Game Circle assets, recording, resume, report edits, both themes and unchanged legacy access.


## Official logo and solid controller package — October 29, 2026

Mike approved and locked the exact final generated controller-inspired logo: seven electric-green outer sectors, one solid basketball-orange upper-right sector (second clockwise from top) without an outline, an orange basketball upper center, green lower center pieces, and the thicker charcoal cross. Master asset is app_icons/gametrace-official-master.png, copied byte-for-byte from the approved final preview. Preserve this appearance rather than regenerate it. Prior Game Circle and GT marks are superseded as branding assets.

The app package now embeds this logo in its header, favicon and Apple touch icon, with matching 192/512 manifest assets. The live controller uses solid #19C66A faces and #F58A28 pressed/selected feedback, dark readable labels/icons in both appearances, existing disabled opacity and unchanged hit geometry. Selection stays orange while its options are open and clears after save/cancel. Center hold feedback uses orange; hold timing and recording logic remain unchanged.

This is an updated saved package, not a new production deployment. Production remains the previously deployed release until separately published.

Packaged HTML SHA-256: 5bcbf3fa416b12ba3c48d375b4023e91132334d115a1101c8893b3054ee85dcc

Validation: all 22 app-flow checks passed with the integrated logo/controller build. Both Day and Courtside passed solid-green/orange selection, save/cancel reset, recording, bench lock and no-overflow checks.
