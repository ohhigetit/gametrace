# GameTrace

**Approved release candidate: V35** — always-visible training feedback and optional Playbook activity links, including V34 Home Court/navigation. See [V35 notes](source/v35/README.md). Deployment verification will be recorded after publication.

**Follow the Play. The Game. The Journey.**

GameTrace is a basketball game action tracker with live recording, game review, history, and performance insights.

## Branches
- `main`: production-ready releases
- `development`: active development and preview testing

GameTrace development proceeds on `development` before promotion to `main`.

## Current baseline

**Development: V34 — Home Court and navigation**, deployed and byte-verified November 4, 2026. See [V34 notes](source/v34/README.md). Production remains V33.

[Development](https://development--game-trace.netlify.app/) serves V34; [production](https://game-trace.netlify.app/) serves V33. The V33 baseline includes optional Family Cloud, training/camps, Next Steps, trophies, editable Score Journey, the locked See more. Become more. reflections, and recoverable whole-game deletion.

- [Approved standards](docs/GameTrace_Approved_Design_and_Development.md)
- [Current templates](templates/current/README.md)
- [Release checklist](templates/release-checklist.md)
- [Verification matrix](templates/current/regression-matrix.md)
- [Application release manifest](templates/current/release-manifest.json)

Build from the repository root with `python3 source/v27/build.py`; the retained v27 filename composes the current local source through v35. The app remains a self-contained HTML build. Test-only copies are isolated and are not the deployed app. Standards/template updates do not authorize runtime changes or data resets.
