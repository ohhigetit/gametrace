# Current GameTrace application template — V42

Authoritative baseline: `source/v42/`, built using `python3 source/v42/build.py`. Generated `GameTrace.html` in this directory is byte-identical to root `index.html` and `source/v42/GameTrace_V42.html`.

Use Home Court colors/type/spacing, plain icon/page titles, approved uppercase subtitles, three CTA tiers, and shared game/session/event/goal/recognition rows. Preserve stable column widths, title wrapping and top alignment. Reuse the actual row builders; do not emulate them with content-dependent flex layouts.

Recorded Plays and Score Journey are tabs with the same row format. Keep direct drag/tap editing, validation, score attribution, timeout pairs, and recoverable deletions. Performance is a four-stat banner with collapsed details. Player identity stays in data/forms while single-player list subtitles omit it.

Family Live Feed is an authenticated read-only surface, not an editor or public-link service. Retain existing family RLS, local-first tracker writes and conflict checks. Never use viewer polling to overwrite local tracker records.

Preserve controller SVG geometry, camera conversion/recording store, cover/logo, score/timing engines, legacy backups, prayer/commitment, note questions, optional Playbook links, privileges and recovery. No reset or SQL execution occurs during build/deployment. Historical versions and their build instructions remain under source/ as archives; this document overrides their UI layout rules.
