# GameTrace Development Governance V1

**Effective:** 2026-11-09. **Scope:** all new GameTrace page, component, refactor and integration work.

## The operating rule

**Build from approved work. Change only what was requested. Test before delivery. No silent redesign or deployment.**

This file and `standards/component-registry.json` govern new work. The registry records **where approved components currently reside**, including approved components embedded in `index.html`. It does not assert that the components have already been extracted to independent modules. Do not refactor them during a page integration merely to tidy the repository.

## Source of truth and baseline

1. Fetch and record the live GitHub SHA of `development` **at the start of each task**, plus the blob SHA of `development:index.html`. Do not use a stale test file, prior branch or outdated prose version label as the baseline.
2. Inspect `standards/component-registry.json` for the exact approved component/version/source anchor/style and its dependencies.
3. Inspect the full approved implementation, including markup, CSS (especially page-scoped selectors), handlers and data contracts. Reusing only CSS class names does **not** constitute component reuse.
4. Work in a task-specific branch from the freshly verified `development` commit. NEVER write directly to `development` or `main` during review.
5. Record a task change manifest identifying allowed page/section scope, baseline SHA, components, modified files and tests. If the task cannot be completed from verified sources, report the blocker; do not improvise a replacement.

## Approval states

- **Draft:** under development and not presented as validated.
- **Ready for Review:** automated checks pass, actual page visually compared and downloadable full HTML test artifact provided.
- **Approved:** user explicitly approves the particular test artifact.
- **Locked:** canonical design/component version is protected from unauthorized changes. Approval is not permission to redesign it.
- **DEV Integrated:** separately authorized integration onto development.
- **PROD Released:** separately authorized deployment after DEV validation.

An existing approved design can be embedded rather than extracted. The registry uses `approved-embedded` for that state. `approved-design-runtime-mapping-pending` requires additional source review before claiming reuse.

## One-page-at-a-time workflow

### Gate 0 — Scope
Describe exactly the one page/section to change; enumerate excluded systems. Preserve all prior approved behavior, interactions, local storage, family/cloud sync, navigation, offline state and recordings unless explicitly authorized.

### Gate 1 — Baseline and component audit
Record the actual DEV HEAD and file blob; resolve approved component and CSS anchors in registry. Compare the candidate to the approved PageHeader and UniversalPage implementation, not only to a sketch.

### Gate 2 — Controlled implementation
Recompose from the exact approved parent and child components. Keep existing DOM/handlers when reparenting. Avoid duplicate renderers, page-specific styling approximations, and unrelated edits. No data migration or sample-data injection.

### Gate 3 — Automated and visual QA
Run `node tests/governance.cjs` and relevant existing regression tests (at minimum `node tests/v495-session-ui.cjs` for session-form edits, with isolated jsdom dependency). Verify iPhone portrait, iPhone landscape, desktop, keyboard/touch events, save/cancel/edit, sync and state preservation as relevant. Compare a browser screenshot against the canonical approved reference at the same viewport/theme/content. Document differences, not just “looks good.” CI is **not** a substitute for browser/device acceptance.

### Gate 4 — Deliver actual test artifact
Produce a standalone full-app HTML file as a direct downloadable conversation attachment if the runtime supports it; also store a commit-addressed GitHub review copy. Verify the file exists and opens. Never present a GitHub link as a confirmed chat attachment. Identify any tests that are incomplete.

### Gate 5 — Approval and deployment
Obtain explicit user approval of the actual test copy. Only then integrate into DEV, re-run tests and verify the deployed bytes. PROD is a separate approval. Never deploy, reset data, run SQL or change family-cloud credentials based on a generic design approval.

## Mandatory review checklist

- [ ] Actual DEV HEAD and blob verified before modification
- [ ] Exact approved component + CSS source verified from registry
- [ ] Scope and preserved features listed; no unauthorized changes
- [ ] Full component DOM + styling + handlers compared to approved reference
- [ ] Automated checks and page-specific regressions passed
- [ ] Browser screenshots at portrait/landscape compared; differences disclosed
- [ ] Full HTML test download produced and opened
- [ ] User approval captured; DEV/PROD untouched without explicit go-ahead

**If any mandatory check is unmet, status remains Draft**, and deliver the limitation rather than a false Ready-for-Review label.

## Testing and enforcement

`tests/governance.cjs` is a dependency-free structural gate. It verifies registry integrity, that all registered component source anchors and style IDs exist in the actual app, and that the approved page implementations have their page-scoped UniversalPage CSS. For an in-progress Trainings integration it checks that implementation, DOM contract and scoped styles are all present. It explicitly catches the earlier “same class name, missing CSS” issue. It cannot prove pixel fidelity.

`.github/workflows/governance.yml` runs the structural gate on PRs targeting `development` or `main`, on pushes to a governance branch, and by manual dispatch. A failing check blocks **only if GitHub branch rules require it**; repository branch protection is not modified by this documentation and must be configured separately by a repository administrator.

Keep the existing per-feature test suites and deployment pipeline. Governance changes do not migrate or reorganize the live application.

## Component extraction policy

The directory structure `components/`, `pages/`, `standards/` can be expanded incrementally. The registry comes first. Only extract embedded components as a separate explicitly approved refactor with behavior-equivalence tests, immutable canonical references and an approved visual baseline. Do not assert that a new folder is a reusable runtime module until the application imports it.

## Known audit findings

- DEV's actual `index.html` has approved UniversalPage V1 implementations for Home Court, Games and Game Details with **separate page-scoped styles**.
- The original Trainings Step 1 attempt copied a DOM shape and a few classes but did not bring the required canonical CSS styling. That attempt must remain unapproved.
- Repository version prose and earlier release manifests include older “current” claims; the Git SHA of the real DEV branch overrides historical release prose when selecting the baseline.
- Several approved components are embedded in `index.html` rather than separate files. Registry `status` makes this explicit.

## Task record template

```text
Task:
Source branch / HEAD:
Source index.html blob:
Requested page and exact scope:
Approved registry component IDs:
Files expected to change:
Preserved features:
Structural/test results:
Visual comparison (viewport, theme, baseline screenshot):
Downloadable test artifact:
Approval state:
DEV deployment authorization:
PROD deployment authorization:
```
