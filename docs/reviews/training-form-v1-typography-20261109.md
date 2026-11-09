# Training Form V1 — Typography alignment review (November 9, 2026)

Status: **APPROVED and LOCKED — Training Form V1 typography and reusable implementation**. User confirmed the updated review “looks good” on November 9, 2026. Component remains review-branch-only, not integrated into a live page or deployed.

## Baseline / scope
- Original DEV baseline: `88a1f6f9fc00b14931649aee65df16ea6f10a009`; `index.html` blob `017441f3d83142e85826ca149bd823e63716c2ea`
- Training Form V1 review baseline: `3fbb472b0deae77d2f25927c98743dedf1e2427a`, from `review/training-form-v1-20261109`
- This review branch: `review/training-form-v1-typography-20261109`
- Approved locked Form Parent V1 sources are **unchanged** (parent JS blob `be8500e1a35c6051581b0f61c22a4f704f5a2743`, CSS blob `634cbd0559e6908cbe74e78ba38e7c55f7ae4190`)
- Only `components/training-form-v1.css` and the interactive standalone HTML preview changed. No application page or backend edited.

## Typography reference
The current DEV component CSS defines section title: `components/training-details-recent-trainings-v1.css` h2 18px / 800 / 1.3 / -0.35px; notes section heading: `components/player-notes-training-v1.css` 18px / 800; section subtitle 12px. The Training Form parent baseline was 22px section heading, 14px labels, 17px buttons and 13px skill chips. Training-specific scoped selectors now align:
- Training section heading: **18px, weight 800**
- Section subtitle: **12px, weight 400**
- Form labels: **13px, weight 700**
- Input and textarea controls: **16px, weight 400** (iOS readability; no zoom)
- Helper, error and supporting copy: **12px**
- Skills and Add Skill controls: **12px**
- Bottom actions: **14px, weight 750**
- Illustrative preview PageHeader: clamp(23px,6vw,30px); subtitle 13px; real app header should use canonical PageHeader V1 unchanged at integration.

No changes to field order, section cards, background, spacing, keyboard events, state, create/edit/repeat mode logic or submit payload.

## Tests
Chromium browser `test_preview.py` all passed at 390 × 844, 844 × 390, 1366 × 900, 320 × 700: four sections, expected form parent inheritance, mode transitions, custom type, custom skills, validation, demo submission, zero console page errors and no horizontal overflow. Computed typography assertion at 390px passed for headings 18px, labels 13px, inputs 16px, actions 14px, skill chips 12px, preview subtitle 13px. Screenshots at portrait/landscape visually inspected.

Not performed: live-app save/sync, native Safari, full-app governance regression. Integration requires separate explicit approval. DEV and PROD untouched.
