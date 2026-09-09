# Spec 01 — Backend configuration: deployable and linted (W1)

> **You cannot run shell commands in this environment.** Do not attempt `npm`, `git`, `firebase`, `tsc`, or any test runner — the attempt is auto-denied and aborts your run with no output. Write files only. The orchestrator runs all gates and reports results back to you.

## Context

**Resolves:** F14 (CI never deploys rules/indexes/functions; `functions/` excluded from lint), F15 (Cloud Functions pinned to EOL Node 18), F6 (composite indexes untracked).

SubTracker is a React 19 + TypeScript + Vite SPA backed by Firebase (Auth, Firestore, Storage), plus one Firebase Cloud Function. The repo tracks `firestore.rules`, `storage.rules`, `firestore.indexes.json`, and a `functions/` directory — but **CI deploys none of them**. The only deploy target is GitHub Pages. `functions/` is also excluded from ESLint.

The practical consequence: repo state and deployed state drift silently. That is how the project's Critical finding (a Cloud Function querying a document schema the client stopped writing) survived undetected.

This spec covers **only the file changes**. The operator runbook at the end lists steps a human with Firebase console access must perform; do not attempt them and do not write scripts that assume they were done.

## Scope

**Modify — exactly these four files:**
- `.github/workflows/deploy.yml`
- `functions/package.json`
- `eslint.config.js`
- `functions/index.js`, `functions/recurrenceProcessor.js`, `functions/dateLogic.js`, `functions/dateLogic.test.js` — **only** if lint fixes are required (see Requirement 5)

**Must NOT be touched:**
- `firestore.indexes.json` — the operator merges live indexes into it. Writing declarations here could delete production indexes.
- `firestore.rules`, `storage.rules` — spec 05.
- Anything under `src/`.
- `package.json` at the repo root.

**Out of scope:** changing the recurrence function's logic (spec 02), rules content (spec 05), adding tests.

## Existing code

`functions/package.json` — complete:
```json
{
  "name": "subtracker-functions",
  "description": "SubTracker Cloud Functions – daily recurrence processor",
  "scripts": {
    "serve": "firebase emulators:start --only functions",
    "deploy": "firebase deploy --only functions",
    "test": "vitest run"
  },
  "engines": {
    "node": "18"
  },
  "main": "index.js",
  "dependencies": {
    "firebase-admin": "^12.0.0",
    "firebase-functions": "^5.0.0"
  },
  "devDependencies": {
    "vitest": "^4.1.9"
  }
}
```

`eslint.config.js` — the relevant line and the TS block that follows it:
```js
export default defineConfig([
  // subtracker-design-system is a generated design-system export (reference
  // sources + guideline pages), not app code — it is not built or linted.
  globalIgnores(["dist", "functions", "subtracker-design-system"]),
  {
    files: ["**/*.{js,jsx}"],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: "latest",
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    rules: {
      "no-unused-vars": ["error", { varsIgnorePattern: "^[A-Z_]" }],
    },
  },
  // ... a matching block for **/*.{ts,tsx} follows
]);
```
Note the `**/*.{js,jsx}` block sets `globals.browser` and `sourceType: "module"`. Neither is correct for `functions/`, which is **CommonJS running on Node** — it uses `require`/`module.exports` and needs `globals.node`.

`.github/workflows/deploy.yml` — complete:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [production]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"
      - name: Install dependencies
        run: npm ci
      - name: Lint & typecheck
        run: npm run lint
      - name: Test
        run: npm run test
      - name: Install functions dependencies
        run: npm ci
        working-directory: functions
      - name: Test functions
        run: npm run test
        working-directory: functions
      - name: Build
        run: npm run build
        env:
          VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
          VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
          VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
          VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.VITE_FIREBASE_STORAGE_BUCKET }}
          VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}
          VITE_FIREBASE_APP_ID: ${{ secrets.VITE_FIREBASE_APP_ID }}
          VITE_FIREBASE_MEASUREMENT_ID: ${{ secrets.VITE_FIREBASE_MEASUREMENT_ID }}
      # ... upload-pages-artifact + deploy-pages steps follow
```

`firebase.json` — complete, for reference (do not modify):
```json
{
  "firestore": { "rules": "firestore.rules", "indexes": "firestore.indexes.json" },
  "storage": { "rules": "storage.rules" },
  "functions": { "source": "functions" }
}
```

`functions/index.js` — complete, shows the CommonJS style:
```js
const { processRecurrences } = require("./recurrenceProcessor");

exports.dailyRecurrenceProcessor = processRecurrences;
```

## Requirements

1. **`functions/package.json` `engines.node` becomes `"22"`.** Node 18 is EOL and its Cloud Functions runtime is decommissioned.

2. **`firebase-functions` is upgraded to `"^6.0.0"`** in `functions/package.json` dependencies. `firebase-admin` stays at `"^12.0.0"`. Do not add, remove, or change any other dependency.

3. **`functions/package.json` does NOT gain a `"type": "module"` field.** The directory stays CommonJS in this spec. (Spec 02 decides the module system; changing it here would collide.)

4. **`eslint.config.js` no longer ignores `functions`.** `globalIgnores` becomes `["dist", "subtracker-design-system"]`. Update the explanatory comment above it so it no longer implies `functions` is excluded.

5. **A new ESLint config block covers `functions/**/*.js` with Node/CommonJS settings**, placed after the existing `**/*.{js,jsx}` block so it wins for those paths. It must set:
   - `languageOptions.globals` to `globals.node` (the `globals` package is already imported at the top of the file)
   - `languageOptions.sourceType` to `"commonjs"`
   - `js.configs.recommended` in `extends`
   - It must **not** extend `reactHooks` or `reactRefresh` — there is no React in `functions/`.
   - `functions/dateLogic.test.js` uses bare `describe`, `it`, and `expect` (Vitest globals). Ensure lint does not report these as undefined — either include them in `globals` for that block or add a narrower block for `functions/**/*.test.js`.

6. **If enabling lint on `functions/` surfaces errors, fix them minimally in place.** Only lint fixes — no logic changes, no renames, no restructuring. If a lint error cannot be fixed without changing behaviour, leave it and report it in your summary rather than suppressing it with a blanket `eslint-disable`.

7. **`deploy.yml` gains a `deploy-firebase` job** that runs *after* the existing build-and-deploy job succeeds (`needs:`), on the same `production` trigger. It must:
   - check out, set up Node 22, `npm ci` in `functions/`
   - authenticate using a repository secret named `FIREBASE_SERVICE_ACCOUNT` (a JSON service-account key) via the `GOOGLE_APPLICATION_CREDENTIALS` environment variable, written to a temp file — do **not** use a long-lived `FIREBASE_TOKEN`, which is deprecated
   - run **two separate deploy steps, in this order**:
     - step A: `firebase deploy --only firestore:rules,storage,functions --project <project-id from secret>`
     - step B: `firebase deploy --only firestore:indexes --project <project-id from secret>`
   - Step B must be a distinct step from step A. Rationale in Requirement 8.

8. **Step B (`firestore:indexes`) must carry an inline comment** in the YAML stating that this deploy is a declarative override which **deletes any index or `fieldOverrides` entry not present in `firestore.indexes.json`**, and that the file must contain the merged live index set before this job is enabled.

9. **The `deploy-firebase` job is gated off by default.** Add `if: false` to the job with an adjacent comment explaining that it stays disabled until the operator has (a) added the `FIREBASE_SERVICE_ACCOUNT` secret and (b) merged the live index export into `firestore.indexes.json`. This prevents an accidental first run from wiping production indexes.

10. **`node-version` in the existing `build-and-deploy` job is left at 20.** Only the new job uses 22. Do not change the frontend's Node version.

11. **No new npm dependencies anywhere.** The Firebase CLI is invoked via `npx firebase-tools@<pinned major>` in the workflow, not added to any `package.json`.

## Conventions to follow

- **YAML style in this repo:** two-space indent, `name:` on every step, secrets referenced as `${{ secrets.NAME }}`. Match the existing job exactly — see the `Build` step above.
- **CommonJS in `functions/`:** `const { x } = require("./y")` at the top, `module.exports = { x }` at the bottom. See `functions/index.js` above and `functions/dateLogic.js:40`.
- **Comment style in config files:** this repo writes multi-line `//` comments explaining *why*, not what. Example from the file you are editing:
  ```js
  // Downgraded to warnings: the codebase has pre-existing `any` casts and
  // context files that intentionally export hooks alongside providers.
  // Tracked as follow-up cleanup rather than blocking CI on this pass.
  ```
  Match that register for the `if: false` and index-deploy comments.

## Tests required

None. This spec changes configuration only; there is nothing unit-testable. Do not add test files.

## Definition of done

The orchestrator will run these. Report what you *believe* the outcome will be; do not claim to have run them.

```
npm run lint          # eslint . && tsc --project tsconfig.app.json --noEmit
npm run test          # vitest run
npm run build
```

`npm run lint` now covers `functions/` for the first time — Requirement 6 exists because that is where new errors will surface.

Additionally, the YAML must parse. The orchestrator will verify by inspection and by GitHub's workflow linter if available.

## Constraints

- **No new dependencies without asking first.** Requirements 1 and 2 change two existing version strings; that is the whole dependency delta.
- **No reformatting of untouched lines.** `deploy.yml` and `eslint.config.js` both contain content unrelated to this spec — leave it byte-identical.
- **No refactors beyond the listed files.**
- Do not create `firestore.indexes.json` entries. Do not create migration or deploy scripts.

## Operator runbook (NOT your work — for the human, do not implement)

1. `npx firebase-tools firestore:indexes --project <id> > live-indexes.json`
2. Merge every entry from `live-indexes.json` into `firestore.indexes.json`, including `fieldOverrides`.
3. Create a service account with the Firebase Admin, Cloud Functions Admin, and Service Account User roles; add its JSON key as the `FIREBASE_SERVICE_ACCOUNT` repo secret.
4. Remove `if: false` from the `deploy-firebase` job.

## Report back

1. The implementation.
2. A short explanation of your approach — in particular, how you scoped the new ESLint block and what it inherits.
3. Anything you skipped, could not do, or decided differently. **Specifically: list every lint error that enabling `functions/` surfaced and how you resolved each.** If you suppressed anything, say so explicitly.
