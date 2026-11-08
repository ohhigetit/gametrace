# AppNavigation / V1

🔒 **Locked — approved existing GameTrace application navigation** (November 7, 2026).

Use [specification.md](specification.md) for binding design/behavior requirements and [manifest.json](manifest.json) for the immutable approved application version and blob SHA.

The working navigation code currently lives within GameTrace's integrated application; no separately extracted HTML/CSS/JS module is asserted or installed here. This deliberate reference-only capture protects the user-approved behavior without introducing an untested second implementation.

For a later extraction, verify exact behavioral and visual parity against the pinned application commit before replacing the integrated navigation. This standards-only branch does not deploy or change the running app.
