# GameTrace

**Follow the Play. The Game. The Journey.**

GameTrace is a basketball game action tracker with live recording, game review, history, and performance insights.

## Branches
- `main`: production-ready releases
- `development`: active development and preview testing

GameTrace development proceeds on `development` before promotion to `main`.

## Current baseline

**Local candidate: V34 — Home Court and navigation**, implemented for local review only. See [V34 notes](source/v34/README.md). No deployment or repository push is included in this request.

V33 is deployed to [development](https://development--game-trace.netlify.app/) and [production](https://game-trace.netlify.app/). It includes optional Family Cloud, training/camps, Next Steps, trophies, editable Score Journey, the locked See more. Become more. reflections, and recoverable whole-game deletion.

- [Approved standards](docs/GameTrace_Approved_Design_and_Development.md)
- [Current templates](templates/current/README.md)
- [Release checklist](templates/release-checklist.md)
- [Verification matrix](templates/current/regression-matrix.md)
- [Application release manifest](templates/current/release-manifest.json)

Build from the repository root with `python3 source/v27/build.py`; the retained v27 filename composes the current local source through v34. The app remains a self-contained HTML build. Test-only copies are isolated and are not the deployed app. Standards/template updates do not authorize runtime changes or data resets.
