# SPHEREx Motion Explorer

Team Phys***'s NASA Space Apps Challenge 2026 project for **Planet X and SPHEREx**.
The intended product compares observations of the same sky region over time.

**Implemented:** React shell, loading/error/empty states and a validated empty static manifest.
**Planned:** target/coordinate selection, image viewer, playback, differencing and archive acquisition.
No astronomical observations or synthetic images are included.

## Setup

Use Node **24.22.3** (recorded in `.nvmrc`) with its bundled npm.
Install Node using your normal trusted method. If nvm is already installed: `nvm install && nvm use`.
Python is not required for the frontend.

From the repository root:

```bash
npm ci
npm run dev
```

Open the URL printed by Vite, normally http://localhost:5173. Stop with Ctrl+C.

This workspace also has a checksum-verified official Linux x64 Node installation under ignored `.tools/`.
To use it from WSL:

```bash
export PATH="$PWD/.tools/node-v24.22.3-linux-x64/bin:$PATH"
npm ci
npm run dev
```

Other developers install Node themselves; the local toolchain is not in Git.
Keep Node, npm and node_modules in the same operating system. Use Ubuntu commands for this WSL repository.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run typecheck` | Strict application and Vite configuration type checking |
| `npm run build` | Type checks and production build into dist/ |
| `npm run lint` | ESLint checks |
| `npm run preview` | Locally serve an existing production build |

Use `npm install` for intentional dependency changes and review package.json and package-lock.json together.
Use `npm ci` for clean installs from the lockfile. There is no browser test suite.

Phase 1 validation passed: clean npm ci, production build/type checks, ESLint and development-server HTTP checks.
Targeted temporary loader checks accepted four valid shapes and rejected 17 invalid manifests; these fixtures are not published. Browser rendering was not tested.

Known dependency debt: npm audit reports seven moderate development-tool advisories arising from minimatch in typescript-eslint.
The installed latest compatible lint toolchain has no compatible upstream fix reported; npm suggests a forced downgrade.
No forced downgrade or major transitive override was applied. Production-only audit (npm audit --omit=dev) reports zero vulnerabilities.
Recheck the lint dependency chain for an upstream fix when updating dependencies.

## Architecture and team workflow

Offline Python processing will export browser images and JSON. A frontend service validates JSON before React consumes it.
Static delivery supports curated targets; arbitrary-coordinate archive queries are not implemented.

| Location / owner | Responsibility |
| --- | --- |
| src/App.tsx and styles.css / Theo | UI and visualisations |
| src/services/observations.ts / Ryan | Loading, validation and integration |
| src/types/observations.ts / Ryan, Artem, Niyati | Provisional consumer types |
| processing/ / Artem | Future acquisition, FITS processing, alignment and differencing |
| public/observations/ | Public processed assets and manifest |
| docs/ / Pranav with team review | Architecture, contract and demo documentation |
| Niyati | Target selection and scientific validation |
| Ryan | Architecture, repository management and eventual deployment |

Use focused branches and small pull requests. Run build and lint before review.
Discuss contract changes with both producer and consumer owners. Artem and Niyati must review its scientific assumptions before real exports.
Theo can develop the shell independently of acquisition.

See [architecture](docs/ARCHITECTURE.md), [contract](docs/DATA_CONTRACT.md) and [processing boundary](processing/README.md).

For a detailed walkthrough, read [the codebase guide](docs/CODEBASE.md) and [the infrastructure guide](docs/INFRASTRUCTURE.md).
AI contributors should read [AGENTS.md](AGENTS.md); Claude Code users should also read [CLAUDE.md](CLAUDE.md).
Do not add credentials, raw bulk downloads or large intermediate files to Git. Everything in public/ is publicly served.
Coordinate processed asset sizes; no bulk storage or Git LFS is configured.

Vercel deployment is planned, not performed. Expected build: `npm run build`; output: `dist`.
No backend, database or authentication is part of this milestone.

## Sources

- [Official challenge](https://www.spaceappschallenge.org/2026/challenges/planet-x-and-spherex/?tab=details): inaccessible during Phase 1 research; detailed requirements remain unverified.
- [Official archive access documentation](https://caltech-ipac.github.io/spherex-archive-documentation/spherex-data-access/): consulted to establish future acquisition boundaries. No archive calls are implemented.

Suitable comparable observations for selected targets have not yet been established.
