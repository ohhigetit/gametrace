# GameTrace change template

## Request

- User-visible problem and intended behavior:
- Latest approved application version and HTML hash:
- Scope: discussion / local test / implementation / development deployment / production deployment.
- Explicit exclusions and records to preserve:

## Implementation

- Read current standards and deployed/source baseline before editing.
- Name source modules and persisted fields affected; edit source then rebuild.
- Preserve controller/camera/branding and existing record IDs unless explicitly changed.
- For new fields: align validators, default/legacy behavior, device persistence, JSON/CSV, cloud payloads and conflict handling. Keep old answers under their original questions.
- For editing/deletion: retain revision checks, transactional save rollback and recovery. Keep whole-game deletion reachable from all existing entry points.
- Keep test samples and test hooks out of the deployed app.
- Identify SQL or server capability prerequisites separately; never execute reset/setup as a side effect of publishing.

## Acceptance criteria

- Concrete before/after example:
- Relevant regression-matrix rows:
- Failure/stale-edit/offline/reload cases:
- Existing data and recovery checks:
- Phone layout and accessibility evidence:
- Physical iPhone or live two-device checks still needed:

## Delivery

- Validation completed and any limits:
- Source/build outputs match:
- Standards, templates and release notes updated:
- Requested branch/destination, expected old head and release SHA:
- Exact deployed application hash verified when deployment is authorized:
