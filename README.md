# GameTrace

**V42 release** — approved Home Court visual standard, consistent game/session/schedule rows, improved review controls, and authenticated family Live Game Feed.

**Follow the Play. The Game. The Journey.**

Production: https://game-trace.netlify.app/ · Development: https://development--game-trace.netlify.app/

Build: `python3 source/v42/build.py`. Netlify serves root `index.html` with no build command. Work is validated on `development`, then the identical application tree is promoted to `main` with expected-head checks and no force push.

See [release notes](source/v42/README.md), [approved standards](docs/GameTrace_Approved_Design_and_Development.md), [current template](templates/current/README.md) and [release manifest](templates/current/release-manifest.json).

The app retains browser records, family sharing/conflict handling and camera/recording storage. No sample records, reset, account changes or SQL execution are part of deployment. Live Feed uses existing private family game sync; optional note/Schedule cloud setup is documented in the release notes.
