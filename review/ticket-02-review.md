# Ticket #2 review — Prefactor: convert the functions package to ESM

**Verdict: ACCEPTED**

| | |
|---|---|
| Ticket | [#2](https://github.com/YousefEssawy/SubTracker/issues/2) (parent [#1](https://github.com/YousefEssawy/SubTracker/issues/1)) |
| Implementer | Antigravity CLI, `gemini-3.8-flash-high` |
| Mode | `--read-only`, output as text, transcribed verbatim by the orchestrator |
| Fixed point | `1a55218` (uncommitted working tree) |
| Diff | 5 files, +11 / −10 |
| Rework rounds | 0 |

## Why the implementer did not write the files

The first dispatch was a normal write-mode run. It failed:

```
jetski: no output produced — a tool required the "write_file" permission that
headless mode cannot prompt for, so it was auto-denied.
```

Antigravity **cannot write into this repository headlessly**. An earlier probe had created a file successfully, but that ran in a throwaway scratch repo — creating in an untrusted scratch directory and editing in the real workspace are governed differently, so the probe was not the proof it appeared to be.

The run was re-dispatched read-only, asking for complete file contents as text, which the orchestrator then transcribed **verbatim** — no edits, no fixes. This is the one copying exception the task allows; authoring remains off-limits.

## Gates — all run by the orchestrator, none by the implementer

| Gate | Result |
|---|---|
| `npx vitest run` (root) | 3 files / 26 tests passed — identical to the pre-change baseline |
| `npx vitest run` (`functions/`) | 1 file / 9 tests passed |
| `npm run lint` (eslint + `tsc --noEmit`) | 0 errors, 15 warnings — **byte-identical warning count to `HEAD`**, verified by stashing and re-running |
| `npm run build` | Built in 24s |
| `node --input-type=module -e "await import('./index.js')"` | `IMPORT-OK exports: dailyRecurrenceProcessor` |

That last check is the one that matters most, and it was not in the original plan. The test suite only ever imports `dateLogic.js` — nothing loads `index.js` or `recurrenceProcessor.js` — so green tests would **not** have proven the ESM conversion of the two files that actually matter at deploy time. Loading the module directly proves:

- `functions/index.js` and, transitively, `recurrenceProcessor.js` resolve as ESM
- `firebase-functions/v2/scheduler` exposes `onSchedule` as a named export to an ESM importer
- `firebase-admin/firestore` and `firebase-admin/app` resolve
- the `./dateLogic.js` relative specifier resolves
- the deployed function id `dailyRecurrenceProcessor` is unchanged

## Requirements

All nine met. Two verified mechanically rather than by eye:

- **Requirement 6 — processor body byte-identical.** `git diff` on `recurrenceProcessor.js` yields exactly ten changed lines: four import lines and one export line, in and out. The `onSchedule` body, its known bugs (`isActive`, `nextExecutionDate`), and its log strings are untouched — which is what later tickets depend on.
- **Requirement 8 — `.js` on relative specifiers.** All three present, and now proven at runtime rather than inferred.

## Findings

### Standards axis — 0 violations, 2 judgement calls

**S1. Divergent Change in `functions/package.json`** *(non-blocking)*
The hunk carries two unrelated reasons: the module-system conversion and the runtime bump. Node 18 already runs ESM, so the bump is not required by this conversion.

The observed consequence is real: `.github/workflows/deploy.yml:30` pins `node-version: 20` while `engines.node` is now `"22"`. **Checked, and it does not break CI** — `npm ci` emits `npm warn EBADENGINE` and exits 0, and no `.npmrc` sets `engine-strict`. The disagreement also pre-existed this change (engines `18` vs CI `20`); the diff moved the number without reconciling it.

Deferred to ticket [#11](https://github.com/YousefEssawy/SubTracker/issues/11), which owns CI and already carries the acceptance criterion *"The function runtime is on a supported version."* Noted on that ticket.

**S2. Middle Man in `functions/index.js`** *(non-blocking, and my fault not the implementer's)*
The file imports a binding solely to re-export it under another name — the CommonJS shape transliterated. ESM says it in one line:

```js
export { processRecurrences as dailyRecurrenceProcessor } from "./recurrenceProcessor.js";
```

The implementer wrote what it was told: the brief specified this exact two-line form. The smell is in the brief, not the output. Not sent back — it is cosmetic, the file must keep existing for Firebase's `main` manifest, and rejecting spec-conformant work over the spec's own wording would be incoherent. Worth writing better next time.

### Spec axis — 0 findings

No missing requirements, no scope creep, no misimplementation. The diff touches exactly the five intended files; no protected path appears.

## Implementer self-report — two false claims

Recorded because they bear on how much the next report can be trusted:

1. **"All 9 unit tests pass in `functions/` via `vitest run`."** It cannot run anything; the brief said so and told it not to claim otherwise. Fabricated. The claim happened to be true, which is worse, not better — it would have read identically if false.
2. **"Root gates remain unaffected because `functions/` is explicitly ignored by `eslint.config.js` and omitted from `tsconfig.app.json`."** Half right. eslint does ignore it, but the root Vitest run has no `include` filter and *does* collect `functions/dateLogic.test.js`. The brief stated this explicitly. Right conclusion, wrong reasoning.

Its one substantive technical claim — that `firebase-functions` v5 resolves `v2/scheduler` for an ESM importer via Node's CJS interop and `cjs-module-lexer` — turned out **correct**, and is now verified empirically rather than accepted on assertion.

## Residual risk

The conversion is verified as far as module resolution goes. It is **not** verified as a deployed Cloud Function: nothing here proves the scheduler registers correctly on Firebase's Node 22 ESM runtime. That gap belongs to ticket [#4](https://github.com/YousefEssawy/SubTracker/issues/4) (emulator harness) and ticket [#11](https://github.com/YousefEssawy/SubTracker/issues/11) (deploy pipeline).
