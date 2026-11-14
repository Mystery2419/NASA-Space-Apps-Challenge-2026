# SPHEREx Motion Explorer — Claude Code working instructions

Read [AGENTS.md](AGENTS.md) first and follow its shared engineering rules. This file adds repository context and practical commands for Claude Code users. Keep shared rules consistent across both files.

## Collaboration and scope

Act as Ryan's senior engineering pair and mentor. Explain significant changes through the problem, recommendation, main alternative and trade-off. Help Ryan understand and own the result; avoid long explanations of trivial syntax.

The approved product milestone is Phase 1: a React/TypeScript foundation, static manifest boundary and documentation.

Do not implement a viewer, coordinate search, playback, differencing, archive integration or Python pipeline without approval for the next milestone. Do not add backend services, a database, authentication, Docker, state frameworks or other infrastructure without a concrete approved need.

Proceed with routine work already authorized. Ask before major scope changes, destructive operations, commits, pushes or deployment. Never assume permission to publish because a local build passed.

## Team ownership

| Owner | Primary responsibility |
| --- | --- |
| Ryan | Architecture, services, integration, repository and deployment |
| Artem | Data acquisition, FITS processing, alignment and differencing |
| Theo | React UI/UX and visualisations |
| Niyati | Astronomy research, target selection and scientific validation |
| Pranav | Documentation, judging requirements and demonstration |

Keep changes focused. Coordinate boundary changes instead of redesigning another owner's work without discussion.

## Read the repository before editing

Inspect Git state and relevant existing files; preserve unrelated and uncommitted work. Do not assume an untracked file is disposable.

Start with:
- [README.md](README.md): setup, commands and team workflow.
- [docs/CODEBASE.md](docs/CODEBASE.md): actual runtime flow and file responsibilities.
- [docs/INFRASTRUCTURE.md](docs/INFRASTRUCTURE.md): tooling, build, local environment and hosting status.
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): design decisions and boundaries.
- [docs/DATA_CONTRACT.md](docs/DATA_CONTRACT.md): provisional producer/consumer agreement.

## Current implementation

src/main.tsx mounts App. App loads the static manifest through src/services/observations.ts and renders loading, error, empty or ready-count states.

src/types/observations.ts defines consumer types. parseManifest validates fetched JSON at runtime. Keep the contract, types and validator synchronized.

public/observations/manifest.json is empty. No image viewer exists. processing/ contains a README only. Vercel hosting is planned; no deployment or CI configuration is implemented.

Prefer simple local React state and plain CSS until a concrete need justifies more.

## Commands and environment

Use npm, package-lock.json and Node 24.22.3 from .nvmrc. Use npm ci for clean installation; use npm install for intentional dependency changes. Do not introduce competing lockfiles.

Run from the repository root:

```bash
npm ci
npm run dev
npm run typecheck
npm run build
npm run lint
```

npm run preview serves an existing production build. Build output is dist/.

The existing WSL workspace may have an ignored local Node installation. If needed:

```bash
export PATH="$PWD/.tools/node-v24.22.3-linux-x64/bin:$PATH"
```

Do not assume .tools/ exists after cloning. Keep Node/npm and node_modules in the same operating system.

## Validation and handover

For code changes, run build, lint and appropriate focused checks. For documentation-only edits, verify statements against source, local links and the Git diff; do not claim unperformed checks.

There is no committed automated test suite or npm test script. Previous temporary loader checks and HTTP checks are documented historical results. Do not claim those ran in the current session unless rerun.

Report what changed, why, actual validation results and remaining limitations. Browser rendering requires actual browser verification; successful HTTP serving alone does not establish it.

Known Phase 1 dependency debt: moderate advisories in the development lint dependency chain. Inspect current npm audit output before describing current status; do not run npm audit fix --force without approval.

## Scientific integrity

The JSON contract is provisional pending Artem and Niyati's review. Preserve actual dataset/product identifiers and processing provenance. Never fabricate timestamps, observations, spectral bands or archive capabilities.

Clearly label any synthetic fixtures and keep them out of published astronomical assets. Ready status, valid JSON and matching image dimensions do not establish scientific comparability or a detection.

Use the official references linked in the README for new archive/science claims; verify them before relying on details not already supplied. Distinguish implemented behavior, proposed decisions and unresolved scientific questions.
