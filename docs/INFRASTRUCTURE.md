# Current infrastructure and development tooling

This describes the repository's implemented setup. It separates tools used to build the application from infrastructure needed to serve it. No deployment has been performed as part of Phase 1.

## 1. What runs where

| Component | Development | Production design |
| --- | --- | --- |
| React UI and loader | Browser | Browser |
| Vite | Local Node development server | Build tool, not an application server |
| TypeScript and ESLint | Local checks | Run during development/build validation |
| Manifest and processed assets | Served from public/ by Vite | Static files in dist/ |
| Python processing | Not implemented | Planned offline preparation, separate from hosting |
| Vercel | Not configured | Proposed static host |

Node is necessary to install packages, run tooling and build the frontend. The built application needs a static web host; it does not require our own long-running Node server.

There is no backend API, database, authentication, message queue, container setup, cloud storage integration or infrastructure-as-code configuration. There are no environment variables required by the current application.

## 2. Toolchain and reproducibility

.nvmrc records Node 24.22.3. package.json permits Node >=24.22.3 and <25. Use the pinned version for the most consistent team setup.

The Phase 1 workspace used npm 11.19.1 bundled with Node. npm is the selected package manager; do not generate competing yarn or pnpm lockfiles.

package.json describes scripts and direct dependencies. package-lock.json records the resolved dependency tree, including transitive packages and integrity information.

```bash
npm ci
```

Use this for a clean installation after cloning. It replaces node_modules using the lockfile and fails if the package manifest and lockfile disagree.

```bash
npm install
```

Use this when deliberately updating dependency resolution. When adding a dependency, explain its purpose and review both package files. Installation and checks should be performed using the same operating system.

This workspace has an ignored Linux x64 Node distribution in .tools/node-v24.22.3-linux-x64/. The archive was verified against the official release checksum. It is a local convenience, not a repository dependency or a prerequisite path for other developers.

From the repository root in WSL, use it with:

```bash
export PATH="$PWD/.tools/node-v24.22.3-linux-x64/bin:$PATH"
node --version
npm --version
```

Other machines should install Node through their normal trusted method. nvm is optional, not installed or required by this repository. With nvm already available, nvm install and nvm use read .nvmrc.

## 3. Dependencies and their responsibilities

| Packages | Why they exist |
| --- | --- |
| react, react-dom | Components, local state and browser rendering |
| vite, @vitejs/plugin-react | Development serving, React refresh and production bundling |
| typescript | Static analysis of application/configuration code |
| @types/react, @types/react-dom, @types/node | Type declarations for React and Node tooling |
| eslint, @eslint/js | Core lint engine and recommended JavaScript rules |
| typescript-eslint | TypeScript-aware parsing and lint rules |
| eslint-plugin-react-hooks | Detect common Hook usage mistakes |
| eslint-plugin-react-refresh | Check export patterns used by development refresh |
| globals | Define browser/Node globals for ESLint |

Exact installed versions are in package.json and the lockfile. TypeScript 6.0 was selected because the installed typescript-eslint peer range excludes TypeScript 7. Review peer compatibility when upgrading the toolchain.

No Python packages, component library, router, state framework or schema-validation package has been introduced.

## 4. Development server

```bash
npm run dev
```

This runs Vite, normally at http://localhost:5173. Vite transforms TypeScript/JSX for the browser and refreshes changed modules. Serving transformed code is not the same as a full TypeScript check; run typecheck or build separately.

For an explicit loopback-only server that fails instead of choosing another port:

```bash
npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
```

Stop with Ctrl+C. The development server is local tooling, not the production hosting plan.

## 5. Configuration and quality checks

| File | Responsibility |
| --- | --- |
| vite.config.ts | Enable the React plugin; no custom API proxy, aliases or deployment configuration |
| tsconfig.json | Strict browser/React checking for src/, ES2022 target, no emitted files |
| tsconfig.node.json | Separate strict check for vite.config.ts using Node types |
| eslint.config.js | Flat ESLint configuration with recommended JS/TS and React rules |

Separating browser and Node configuration makes their available APIs explicit. Application code has DOM/Vite types; build configuration has Node types.

```bash
npm run typecheck
npm run lint
npm run build
```

typecheck checks both TypeScript configurations. lint treats warnings as failures. build runs typecheck first, then Vite. TypeScript checks code; lint checks selected code patterns; neither validates scientific claims or browser rendering.

The Phase 1 setup passed clean installation, build and lint. Temporary ignored loader fixtures accepted four valid shapes and rejected 17 invalid manifests. These are not a committed test suite or an npm test script.

HTTP checks confirmed the development page, manifest and transformed React module were served successfully. Browser-level rendering was not tested.

## 6. Build output and proposed hosting

```bash
npm run build
npm run preview
```

build creates dist/ with an HTML entry, bundled assets and copied public files. preview serves that existing build locally; it does not rebuild it.

public/observations/manifest.json becomes dist/observations/manifest.json. Future public images are copied similarly. Vite does not apply our runtime contract validator to public JSON during the build; the loader validates it when the page runs.

The proposed Vercel setup is a static project rooted at this repository, using npm run build and dist as the output directory. This is a deployment plan, not evidence of an existing Vercel project, URL, integration or successful deployment. Obtain Ryan's approval before deployment.

Vite currently uses its default base path. The manifest loader derives its URL from import.meta.env.BASE_URL. A future subdirectory deployment must configure and verify base-path handling, including future image URL resolution.

Publishing new processed observations requires updating the assets and publishing a new build. There is no runtime write path or automatic archive synchronization.

## 7. Files, public data and source control

| Path / file | Treatment |
| --- | --- |
| src/, docs/, processing/README.md, public/ | Source material intended for review and version control |
| node_modules/ | Generated installed packages; ignored |
| dist/ | Generated production output; ignored |
| .tools/ | Workspace-local tools, logs and temporary checks; ignored |
| .env and .env.* | Ignored; no secrets are required currently |
| .venv/, __pycache__/, *.py[cod] | Future Python environment/cache artifacts; ignored |
| .gitattributes | Normalize text files to LF line endings |

Ignoring an environment file is not a security boundary. Anything placed in public/ is served publicly, and any future browser-exposed configuration must be treated as public. Do not place credentials or raw sensitive material in frontend assets.

Git and GitHub are the collaboration tools. There is no configured CI workflow, pre-commit hook, Git LFS or deployment automation. Local checks do not imply that a remote branch has been checked, merged or deployed.

For WSL development, run Linux Node/npm inside Ubuntu for this Linux repository. Avoid sharing node_modules between Windows and WSL because installed platform-specific binaries may differ.

## 8. Known operational debt

The Phase 1 npm audit reported seven moderate development-tool advisories arising from minimatch in the typescript-eslint dependency chain. Production-only audit reported zero. These are historical validation results, not a guarantee about future advisories.

Recheck using:

```bash
npm audit
npm audit --omit=dev
```

npm suggested a forced downgrade; none was applied. Revisit the upstream lint dependency chain before introducing a major override or breaking dependency change.

The team still needs scientifically reviewed real data, browser verification, an agreed asset-size/storage strategy, and approved deployment work. These remain separate from the working frontend foundation.
