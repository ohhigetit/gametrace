# Training Form V1 — Full-page integration review

**Status: DRAFT REVIEW BUILD.** The user authorized a one-pass integration of approved UniversalPage/PageHeader/Form Parent/Training Form for New, Edit and Repeat Training. This commit is **not user-approved**, not integrated into DEV and not deployed to Netlify.

## Verified baseline
- Application source branch: `development`
- HEAD: `88a1f6f9fc00b14931649aee65df16ea6f10a009`
- Source `index.html` blob: `017441f3d83142e85826ca149bd823e63716c2ea`
- Full review app `index.html` blob: `9886d71730e0112585f5b2e8052370f6d319dad4`
- Review branch: `review/training-form-v1-fullpage-20261109`

## Locked component sources, copied without modification
- Form Parent JS: `components/form-components-v1.js`, blob `be8500e1a35c6051581b0f61c22a4f704f5a2743`
- Form Parent CSS: `components/form-components-v1.css`, blob `634cbd0559e6908cbe74e78ba38e7c55f7ae4190`
- Training Form JS: `components/training-form-v1.js`, blob `76c5ab4efce4e21645d02b81e87fdfd551e26349`
- Training Form CSS: `components/training-form-v1.css`, blob `0f2dd1a788d0ada44b7d44f6effddaaadbbcbf60`

## Integration scope
The full application `index.html` is the actual DEV baseline with approved component sources and the review-only Training Form page integration appended. It does **not** remove any original runtime. A minimal adapter wraps the existing `buildSessionEditor`: 
1. Invokes the native V46.9.5 editor and its existing `save()`, validation, IDs, concurrency checks, award logic, storage and sync.
2. Creates the approved `TrainingFormV1`, choosing `new`, `edit` or `repeat`; composes it in actual reusable `GameTraceComponents.UniversalPageV1` and `PageHeaderV1`.
3. Maintains the original input and button nodes in an invisible native form; on user save, maps the new values and skills to the native editor before invoking its original save button.
4. Any native validation error appears in the reusable form UI. The native Cancel handler remains authoritative.
5. Reuses exact Home Court UniversalPage CSS with page-scoped selectors, limiting the style to `#trainingContent > .up1-page[data-page="training-form"]`.

**Preserved/excluded:** Games, Game Details, Training Details, Gym overview, scoreboard, notes, family cloud, local storage, offline, recordings, data schema and deployment config have no intentional changes.

## QA
Passed an isolated, self-contained interactive page harness in Chromium at 320×700, 390×844, 844×390 and 1366×900:
- Four `FormSectionV1` cards, actual `FormParentV1` composition and UniversalPage structure
- New / Edit / Repeat modes, custom type and skills, created/retained record IDs in a fake save service
- Native save control delegation, null errors and no horizontal overflow
- App-standard 18px section headings / 13px labels / 16px inputs / 14px actions
- Portrait and landscape screenshots inspected

The automated **full-app** regression is added as `tests/training-form-page-v1.cjs`, but **has not been run against the real 1.7 MB app**, nor have we run the complete `tests/governance.cjs` and `tests/v495-session-ui.cjs` suites on this branch. Real Supabase/Family Cloud operations, offline, iPhone Safari and full-app responsive screenshot comparison are **not verified**. Isolated mock saves must not be mistaken for live app saves.

## Review / next gates
- Actual full-app review build: `index.html` in this branch
- Standalone local preview file is a simulation of the same form components/bridge, **not** the entire app
- Next: run `node tests/governance.cjs`, `node tests/v495-session-ui.cjs`, `node tests/training-form-page-v1.cjs`; review actual app on iPhone portrait, landscape, desktop; verify save/edit/repeat, navigation and Family Cloud.
- Only after explicit approval of the exact full app review should we merge to `development`, and only with a separate DEV deployment authorization. PROD is a further separate step.
