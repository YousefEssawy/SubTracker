# Spec 14 — Emulator-based verification of rules and Cloud Functions

> **You cannot run shell commands in this environment.** Do not attempt `npm`, `git`, `firebase`, `tsc`, or any test runner — the attempt is auto-denied and aborts your run with no output. Write files only. The orchestrator runs all gates and reports results back to you.

## Context

**Resolves:** no review finding directly. It closes the **verification gap** that every preceding spec was accepted with.

Specs 01–13 were reviewed under an explicit limitation: the orchestrator can run `lint`, `test`, `build`, and `tsc`, but **cannot exercise Firebase**. Everything Firebase-side was unit-tested against mocks, which proves the code's shape and not its behaviour. The gap is worst exactly where the stakes are highest:

- **F1 was the Critical finding**, and it was a contract mismatch between a Cloud Function's query and the documents the client writes. Spec 02's contract test asserts the query's *shape* against a stub. It cannot prove the query actually returns those documents from a real Firestore, which is the property that was broken.
- **Spec 05 rewrote `firestore.rules` and `storage.rules`** with per-collection field allowlists and type predicates. Not one line of those rules has been executed. A rule that is too strict silently locks users out of their own data; nothing in the current suite would catch it.
- **Spec 07 replaced a listener with `getAggregateFromServer`**. The mocked tests assert which aggregations are requested, not that Firestore returns the numbers `computeBalances` would.

This spec stands up the Firebase emulator suite and writes tests that run against it.

**This is the one spec permitted to add dependencies.** Specs 01–13 all forbid it; that constraint is lifted here, for the packages named in Requirement 1 and no others.

## Scope

**Create:**
- `firebase.json` additions for the `emulators` block (see Requirement 2 — this is a modification, listed here for clarity)
- `functions/vitest.emulator.config.js`
- `tests/emulator/setup.ts`
- `tests/emulator/rules.firestore.test.ts`
- `tests/emulator/rules.storage.test.ts`
- `tests/emulator/recurrenceProcessor.emulator.test.js`
- `tests/emulator/subscriptionProcessor.emulator.test.js`
- `tests/emulator/balances.emulator.test.ts`
- `docs/agents/emulator.md` — how to run these locally and in CI

**Modify:**
- `firebase.json` — add the `emulators` block
- `package.json` — add the dev dependencies and the emulator test scripts
- `.github/workflows/deploy.yml` — add an emulator test job
- `.gitignore` — ignore emulator artefacts

**Must NOT be touched:**
- `firestore.rules`, `storage.rules` — this spec **tests** them. If a test proves a rule is wrong, report it; do not fix the rule here.
- `functions/recurrenceProcessor.js`, `functions/subscriptionProcessor.js`, `functions/dueDocumentRunner.js` — same principle: test, don't change.
- Any file under `src/` other than through the tests
- Any existing test file

**Out of scope:** fixing anything the emulator reveals (that is a follow-up spec, informed by what you find), end-to-end browser tests, CI performance tuning, testing Firebase Auth flows.

## Existing code

### `firebase.json` — complete, today
```json
{
  "firestore": { "rules": "firestore.rules", "indexes": "firestore.indexes.json" },
  "storage": { "rules": "storage.rules" },
  "functions": { "source": "functions" }
}
```
No `emulators` block.

### `package.json` — the current test setup
```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "lint": "eslint . && npm run typecheck",
  "typecheck": "tsc --project tsconfig.app.json --noEmit",
  "test": "vitest run",
  "test:watch": "vitest"
}
```
`devDependencies` currently include `vitest ^4.1.9`, `jsdom ^29.1.1`, `@testing-library/*`. **No `firebase-tools`, no `@firebase/rules-unit-testing`.**

### `vite.config.js` — the Vitest config the root suite uses
```js
test: {
  environment: "jsdom",
  globals: true,
  setupFiles: ["./src/test/setup.ts"],
},
```
No `include`, so the default `**/*.test.*` glob applies — which is why `functions/dateLogic.test.js` is collected by the root run too. **Emulator tests must not be picked up by this config**; see Requirement 3.

### `.github/workflows/deploy.yml` — the existing jobs
`build-and-deploy` runs lint, test, functions test, and build. Spec 01 added a `deploy-firebase` job gated behind `if: false`.

### The rules under test — `firestore.rules` (post-spec-05 shape)
Per-collection `match` blocks for `transactions`, `subscriptions`, `recurrences`, `categories`, `spaces`, and `payments`, with field allowlists and type predicates, plus an `isOwner(userId)` helper. `payments` is read-only to clients. Timestamp predicates live in `firestore.rules.strict`, **not** in the active ruleset.

### The storage rules under test — `storage.rules` (post-spec-05 shape)
Ownership plus `request.resource.size < 5 * 1024 * 1024` and a `contentType` predicate matching JPEG, PNG, or PDF, with owner delete allowed.

### The processors under test
Both use `onSchedule`, a `collectionGroup` query, `docRef.parent.parent.id` for the user id, a `runTransaction` with a re-read guard, and a bounded 499-iteration backlog loop (499, not 500, because a Firestore transaction permits at most 500 writes and the loop adds one final update). Post-spec-10 they are both configured instances of `functions/dueDocumentRunner.js`.

## Requirements

1. **Add exactly these dev dependencies**, and no others: `@firebase/rules-unit-testing` (for the rules tests) and `firebase-tools` (to run the emulator). Pin both to a specific major. If you believe a third package is unavoidable, **stop and report** rather than adding it.

2. **Add an `emulators` block to `firebase.json`** configuring the Firestore, Storage, and Functions emulators on fixed ports, with the UI disabled (CI has no browser) and `singleProjectMode` enabled. Use a project id of `subtracker-test` for emulator runs — never the real project id, so a misconfigured run cannot touch production.

3. **Emulator tests are a separate suite that the default `npm run test` does NOT run.** They require a running emulator; collecting them in the normal run would break `npm run test` for anyone without one. Achieve this by giving `tests/emulator/` its own Vitest config with `environment: "node"` and adding `tests/emulator/**` to the root config's `exclude`. Add scripts:
   - `test:emulator` — runs the emulator suite against an already-running emulator
   - `test:emulator:ci` — wraps it in `firebase emulators:exec` so it starts, runs, and tears down in one command

4. **`tests/emulator/setup.ts` provides the shared harness**: initialise the test environment against the emulator, load `firestore.rules` and `storage.rules` from disk, expose helpers for an authenticated context (`authedAs(uid)`) and an unauthenticated one, and clear all data between tests. Rules must be read from the real files — never inlined into the test, or the test stops tracking the deployed ruleset.

5. **`rules.firestore.test.ts` proves ownership isolation**, the property the whole security model rests on. For each of the six collections: an owner can read and write their own document; a **different authenticated user cannot** read or write it; an unauthenticated caller cannot do either. This is the highest-value test in the spec — write it first.

6. **`rules.firestore.test.ts` proves the field allowlists and type predicates.** For each collection, assert that a valid document is accepted and that each of these is rejected: an unknown field, a required field missing on create, and a field of the wrong type (a string `amount`, a numeric `currency`, a malformed `transactionDate`). Derive the cases from the rules file, not from your assumptions about it.

7. **`rules.firestore.test.ts` proves `payments` is client-read-only.** An owner can read their payments; an owner **cannot** create, update, or delete one. This is the rule that makes spec 04's server-side writer meaningful.

8. **`rules.storage.test.ts` proves the upload policy.** An owner can upload a JPEG, a PNG, and a PDF under 5 MB; an oversized file is rejected; a disallowed content type (`text/html`) is rejected; another user cannot read or write that path; an owner can delete their own object.

9. **`recurrenceProcessor.emulator.test.js` proves F1 is actually fixed — using two distinct seeding paths.** The positive and negative cases cannot share a seeding mechanism, and the test must say so:
   - **Positive case — seed through the client's own writer.** Use the same code path `addRecurrence` uses, so the test tracks the real document shape rather than a fixture that can drift from it. Run the processor and assert a transaction appears in the right subcollection with the right `transactionDate` and `recurrenceId`, and that `nextDate` advanced.
   - **Negative case — seed with a raw admin write.** The client writer emits *only* the canonical schema, so it is structurally incapable of producing a legacy document; the negative case must write `isActive` / `nextExecutionDate` / `"Monthly"` directly. Add a comment at that fixture stating why it bypasses the writer, so a future reader does not "fix" it back.
   - Assert the legacy document is **not** picked up, making the boundary explicit.

   This is the test that the mocked contract test could not be.

10. **`recurrenceProcessor.emulator.test.js` proves the backlog and the cap.** A recurrence three intervals overdue produces exactly three transactions in one run. A recurrence overdue beyond the 500-iteration cap stops at 500 and leaves the document in a re-runnable state.

11. **`subscriptionProcessor.emulator.test.js` proves idempotency for real.** Run the processor twice over the same past-due subscription and assert the payment count does not change, because the deterministic document id `${subscriptionId}_${paidDate}` collapses the second write. Also assert a `cancelled` and a `paused` subscription are untouched.

12. **`balances.emulator.test.ts` proves the aggregation matches the reducer.** Seed a set of transactions across at least two currencies and both types, call `fetchBalances` against the emulator, and assert the result deep-equals `computeBalances` over the same fixture array. Spec 07 pinned these two together with mocks; this proves it against the real aggregation service, including the rounding.

13. **A CI job runs the emulator suite.** Add a `emulator-tests` job to `deploy.yml` that installs dependencies, installs `functions/` dependencies, and runs `npm run test:emulator:ci`. It requires a JDK (the Firestore emulator is a Java process) — add `actions/setup-java`. Gate the existing `deploy-firebase` job on this job passing, so rules can never deploy without having been exercised. Unlike spec 01's deploy job, **this job is not gated off** — it runs on every push to `production`.

14. **`docs/agents/emulator.md` documents the workflow**: prerequisites (Java), how to start the emulator locally, how to run the suite against it, how to run the one-shot CI form, and the explicit statement that emulator tests do not run as part of `npm run test`. Match the tone of the existing files in `docs/agents/`.

15. **`.gitignore` covers emulator artefacts** — `firebase-debug.log`, `firestore-debug.log`, `ui-debug.log`, `.firebase/`, and any emulator export directory.

16. **If a test reveals a genuine defect in the rules or a processor, do not fix it.** Leave the test failing or mark it `.fails`/skipped with a comment naming what it found, and report it. A spec that both writes the test and changes the code under test to make it pass has verified nothing.

## Conventions to follow

- **Vitest with globals** — no importing `describe`/`it`/`expect`, matching every existing test file.
- **One `describe` per unit under test**, mirroring `shared/recurrenceDates.test.js` and `src/utils/balanceUtils.test.ts`.
- **Rules tests use the `assertSucceeds` / `assertFails` helpers** from `@firebase/rules-unit-testing` rather than hand-rolled try/catch, so a rejection for the wrong reason still fails the test.
- **Test data uses realistic fixtures** — a `transactionDate` of `"2026-03-01"`, a `currency` of `"EGP"`, an `amount` of `199.99`. Not `"x"` and `1`.
- **Workflow YAML** matches the existing file: two-space indent, `name:` on every step, `working-directory` where needed.
- **Docs in `docs/agents/`** are written for an agent reading them cold: state the command, then what it does, then when to use it.

## Tests required

The spec **is** the tests. Beyond the files listed in Scope, add none.

Every existing test must continue to pass, and `npm run test` must behave exactly as it does today — same files collected, same duration, no emulator required. If a developer without Java can no longer run `npm run test`, the spec has failed.

## Definition of done

```
npm run lint
npm run test              # unchanged: must NOT require an emulator
npm run build
npm run test:emulator:ci  # starts the emulator, runs the suite, tears down
```
plus `npm run test` in `functions/`.

The orchestrator runs all of these. `test:emulator:ci` is the one that finally exercises the Firebase-side behaviour every earlier review had to accept unverified — **expect it to surface real defects**, and see Requirement 16 for what to do about them.

## Constraints

- **Dependencies: only the two named in Requirement 1.** This exception does not extend to anything else.
- **No reformatting of untouched lines.**
- **Do not modify the rules files or the processors.** Test them as they are.
- **Do not point the emulator at the real Firebase project.** The project id is `subtracker-test`; no real credentials are used, and no secret is needed for this job.
- **Do not make `npm run test` depend on the emulator.**

## Report back

1. The implementation.
2. Your approach — particularly how you isolated the emulator suite from the default test run, and how you seeded documents in the client's exact writer shape for Requirement 9.
3. Anything skipped, blocked, or decided differently. **Specifically: (a) every defect the tests reveal in the rules or processors, stated plainly and left unfixed per Requirement 16, (b) whether the rules as written actually permit the six collections' real documents, and (c) any behaviour you could still not verify even with the emulator.**
