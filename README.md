# GameTrace

**Production: V36**, deployed and byte-verified at [GameTrace](https://game-trace.netlify.app/). Development remains V35. Adds session detail pages, quick logging with recoverable device-local drafts and presets, shared player selection, weekly review and a Day Game default. See [V36 notes](source/v36/README.md).

**Follow the Play. The Game. The Journey.**

GameTrace is a basketball game action tracker with live recording, game review, history, and performance insights.

## Branches
- `main`: production-ready releases
- `development`: active development and preview testing

GameTrace development proceeds on `development` before promotion to `main`.

## Current baseline

V35 retains existing games, sessions, reflections, trophies, family membership and recordings. No reset or database migration is part of the release. Refresh family devices before editing linked Playbook steps.

- [Approved standards](docs/GameTrace_Approved_Design_and_Development.md)
- [Current templates](templates/current/README.md)
- [Release checklist](templates/release-checklist.md)
- [Verification matrix](templates/current/regression-matrix.md)
- [Application release manifest](templates/current/release-manifest.json)

Build from the repository root with `python3 source/v27/build.py`; the retained v27 filename composes the current local source through v36. The app remains a self-contained HTML build. Test-only copies are isolated and are not the deployed app. Standards/template updates do not authorize runtime changes or data resets.
