# GameTrace development

Approved for development deployment November 2, 2026: V27 Training and Family, built on C1.10.3 camera. Development URL: https://development--game-trace.netlify.app/ . Production/main is outside this release.

Adds completed training/camp sessions, total hours, hour rings, weekly streaks, weekly/cumulative graph, session reflections and game feedback. Report swipes work across the page. The approved controller/camera pixels are preserved. No demo records are automatically added.

The family connection is configured with the GameTrace Supabase project URL and public publishable key. The owner installed the SQL and received success. Public settings respond and anonymous shared-record reads are denied. Actual user sign-up, email confirmation, family creation, cross-account access and clip uploads still need live acceptance testing. Recordings are limited to 50 MB each for the selected free plan.

Build: python3 source/v27/build.py. Validation: node tests/training.cjs; node tests/family-sync.cjs; node tests/core-regression.cjs. 58 automated checks passed. Source and limits: source/v27/README.md and cloud/SETUP.md.

Later discussion of extra categories, session trophies and a separate Goals section is not implemented in this candidate.

## November 3: compact Live Game controls

Smaller, separately tappable Team/Opponent score cards open +1/+2/+3 for the selected side. Player baskets still add to the team automatically. PTS/REB/AST/STL stay visible above the controller; expand Secondary stats for shooting details, Game details and More actions. The left controller rail contains manual Start Game, Timeout/Resume, current period and End/Start period progression. Ending the final period uses the existing End Game review. Timeout and period breaks disable score entry and play tracking. All scoring and timing writes use existing transactions and Family Cloud game sync; no database migration is required.

Camera recording/zoom and circular SVG geometry are retained. Short screens can scroll the Live page; secondary stats have a bounded scroll area. Validation: 10 UI checks, 18 journey checks, 12 core regression checks and 20 family sync checks. Development branch only.

## November 3: V30 — complete pending journey and controller updates

- Score Journey adds two step lines and aligned player-event bars with independent Team score / Opponent score / Player events checkboxes. Period boundaries, timeouts and the court/bench strip remain visible. Points and events open details/editing; the existing score entries remain below. Older games without a running score show player events without inventing team scores.
- Score popovers anchor to the tapped team tile, clamp to the viewport, add/deduct 1–3, refuse negative totals, and preserve individual player statistics. Deductions use the existing score checkpoint event and existing game sync schema.
- A companion period circle and curved action wedge replace the rectangular rail. Start/Timeout/Resume/next-period actions share the same wedge; ending a period uses circle controls and confirmation. Camera controls reserve their full height and safe-area space.
- Goals is presented as Next Steps; internal IDs and cloud record kinds remain unchanged. Cards are closed by default with title and five progress dots; priority tools, notes, self-rating graph and achieved state remain inside.
- Family Owner/Admin can create custom trophy definitions and issue awards with a reason. Attribution, timestamp and title are stamped on the server. Issued awards are immutable apart from revocation; history is retained. Family devices receive/replay celebrations once per award. Local backup copies are never uploaded as privileged awards.

Cloud prerequisite: the owner runs `cloud/migrations/004_family_trophies.sql` using `/cloud/trophies-update.html`. It includes the Goals capability from 003 and preserves existing records. The app gates custom trophy creation until capability v4 is detected. This repository does not have Supabase administrative credentials, so this migration is supplied for the owner to run; it is not automatically applied by deployment. Do not rerun 003 after 004.

Build: `python3 source/v27/build.py`; migration page: `python3 cloud/build-trophies-update.py`. Validate core, journey, training, journey UI, V30 UI, family sync and real PostgreSQL role/record tests. Development only; sample QA pages are ignored and are not deployed.
