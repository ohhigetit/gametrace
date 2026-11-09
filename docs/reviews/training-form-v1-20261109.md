# GameTrace — Training Form V1 (Review Candidate)

Status: **Built, interactive QA passed, pending user approval**. Do not mark approved/locked until explicit visual approval.

## Scope and parent inheritance
- Work branch: `review/training-form-v1-20261109`, based on locked Form Parent review commit `52a3061671feed1228a1a6c0220d6124ab7eba34`
- Original application DEV baseline: `88a1f6f9fc00b14931649aee65df16ea6f10a009`
- Locked Form Parent V1 source: `components/form-components-v1.js` (blob `be8500e1a35c6051581b0f61c22a4f704f5a2743`) and `components/form-components-v1.css` (blob `634cbd0559e6908cbe74e78ba38e7c55f7ae4190`)
- Training Form V1 is a child composed strictly through `GameTraceFormComponents.FormParentV1`, `FormSectionV1`, `FormFieldV1`, and `FormActionsV1`. Parent sources are unchanged.
- Additive artifacts only: training child JS and CSS, standalone interactive HTML preview, review manifest. No `index.html` mutation, app route changes, data migration, Supabase changes, or Netlify deployment.

## Training Form V1
One component (`window.GameTraceTrainingForm.TrainingFormV1`) supports three modes: `new`, `edit`, `repeat`.

Sections:
1. Player Information: Player Name
2. Session Information: Session Type (Training, Camp, Custom), Custom Session Type (conditional), Session Name, Date, Hours, Minutes, Coach / Organization, Location
3. Skills & Focus: preset multi-select chips and custom skill entry
4. Player's Feedback: What I Saw, What I Became, What I Want to Become More, Additional Feedback

Mode rules:
- New: empty/default values; does **not** generate persistent IDs
- Edit: prefills session data, date, duration, tags, and reflections; caller preserves record ID
- Repeat: retains session descriptors and selected skills; date defaults to today, duration and reflections clear; caller must generate a **new** record ID

Save payload uses existing `trainingSessions` field names: `type` ('training' or 'camp'), `customType`, `name`, `date`, `minutes` (total whole minutes), `player`, `coach`, `location`, `tags`, `feedback` (`see`, `became`, `more`, `additional`). Custom UI type maps to backend `type:'training'` plus `customType`. Mode and source ID pass as a separate callback argument. Domain validation, actual record persistence, award logic, sync, and navigation remain **host responsibilities**.

API: `TrainingFormV1({ mode, session, defaults, skills, today, onSubmit, onCancel, form })` returns `{element,mode,controls,getValues,showError,clearError}`. The `onSubmit(values, context)` callback may be async. The interactive preview simulates these callbacks and saves nothing.

## Review QA
- Chromium automated interaction at 390×844 (iPhone portrait), 844×390 (landscape), 1366×900 (desktop), 320×700 (narrow mobile)
- Passed 4 section-card structure and component inheritance, no JS page errors or horizontal overflow
- New mode resets fields, Edit retains title/duration/tags/reflections, Repeat retains metadata but resets date, duration and reflections
- Custom type conditional display, custom skills, validation feedback and callback payload all passed
- Screenshots inspected at portrait and landscape widths

**Not performed:** full-app tests, Family Cloud integration tests, native Safari/iPhone tests, Netlify deployment.

## Next gate
User approves this exact standalone review HTML → integrate TrainingFormV1 into Log New Training using latest DEV app and approved UniversalPage/PageHeader → run full-app regressions → request DEV deployment approval separately.
