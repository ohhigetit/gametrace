# GameTrace development

Approved for development deployment November 2, 2026: V27 Training and Family, built on C1.10.3 camera. Development URL: https://development--game-trace.netlify.app/ . Production/main is outside this release.

Adds completed training/camp sessions, total hours, hour rings, weekly streaks, weekly/cumulative graph, session reflections and game feedback. Report swipes work across the page. The approved controller/camera pixels are preserved. No demo records are automatically added.

The family connection is configured with the GameTrace Supabase project URL and public publishable key. The owner installed the SQL and received success. Public settings respond and anonymous shared-record reads are denied. Actual user sign-up, email confirmation, family creation, cross-account access and clip uploads still need live acceptance testing. Recordings are limited to 50 MB each for the selected free plan.

Build: python3 source/v27/build.py. Validation: node tests/training.cjs; node tests/family-sync.cjs; node tests/core-regression.cjs. 58 automated checks passed. Source and limits: source/v27/README.md and cloud/SETUP.md.

Later discussion of extra categories, session trophies and a separate Goals section is not implemented in this candidate.
