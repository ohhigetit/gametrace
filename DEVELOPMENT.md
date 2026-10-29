# GameTrace development

`development` hosts approved implementation candidates and deployment checks. `main` hosts the promoted production release.

V16 is the integrated Your Games and Game Report release built on V15. The approved Game Circle is used as the app icon. The previous GT logo explorations are not part of this release.

The self-contained `index.html` is the deployable app. Editable modules, build inputs and tests are retained under `source/v16/`; generate the standalone with `build_v16.py` in that folder. The icon generator uses the approved report SVG and synthetic sample fixture; generated app icons are under `icons/`. Synthetic data is never imported automatically.

Promote a tested development tree to main with history preserved. Keep `/legacy/` unchanged and verify it after deployment. Avoid overwriting browser storage: V16 migrates V11 data to its new key and leaves the old key intact.
