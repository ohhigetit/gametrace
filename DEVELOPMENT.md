# GameTrace development

Approved for development deployment November 2, 2026: V27 Training and Family, built on C1.10.3 camera. Development URL: https://development--game-trace.netlify.app/ . Production/main is outside this release.

Adds completed training/camp sessions, total hours, hour rings, weekly streaks, weekly/cumulative graph, session reflections and game feedback. Report swipes work across the page. The approved controller/camera pixels are preserved. No demo records are automatically added.

The family connection is configured with the GameTrace Supabase project URL and public publishable key. The owner installed the SQL and received success. Public settings respond and anonymous shared-record reads are denied. Actual user sign-up, email confirmation, family creation, cross-account access and clip uploads still need live acceptance testing. Recordings are limited to 50 MB each for the selected free plan.

Build: python3 source/v27/build.py. Validation: node tests/training.cjs; node tests/family-sync.cjs; node tests/core-regression.cjs. 58 automated checks passed. Source and limits: source/v27/README.md and cloud/SETUP.md.

Later discussion of extra categories, session trophies and a separate Goals section is not implemented in this candidate.

## November 3: compact Live Game controls

Smaller, separately tappable Team/Opponent score cards open +1/+2/+3 for the selected side. Player baskets still add to the team automatically. PTS/REB/AST/STL stay visible above the controller; expand Secondary stats for shooting details, Game details and More actions. The left controller rail contains manual Start Game, Timeout/Resume, current period and End/Start period progression. Ending the final period uses the existing End Game review. Timeout and period breaks disable score entry and play tracking. All scoring and timing writes use existing transactions and Family Cloud game sync; no database migration is required.

Camera recording/zoom and circular SVG geometry are retained. Short screens can scroll the Live page; secondary stats have a bounded scroll area. Validation: 10 UI checks, 18 journey checks, 12 core regression checks and 20 family sync checks. Development branch only.
