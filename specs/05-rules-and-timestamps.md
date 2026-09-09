# Spec 05 — Security rules hardening and timestamp standardisation (W5)

> **You cannot run shell commands in this environment.** Do not attempt `npm`, `git`, `firebase`, `tsc`, or any test runner — the attempt is auto-denied and aborts your run with no output. Write files only. The orchestrator runs all gates and reports results back to you.

## Context

**Resolves:** F9 (storage rules enforce no type or size limit), F18 (Firestore rules validate ownership but not shape; update paths spread arbitrary client fields), F22 (referential-integrity checks for delete are client-side and racy), F16 (`createdAt`/`updatedAt` type drift), and the service-error half of F12.

Two related problems, merged into one spec because they rewrite **the same lines** — the object literals passed to `addDoc`/`updateDoc` in every service.

**Rules.** `firestore.rules` checks only that the caller owns the document path. Any field of any type can be written. `storage.rules` is the same — the "5 MB, JPEG/PNG/PDF only" policy exists solely in browser JavaScript the user controls. Blast radius is the user's own data, so this is data integrity rather than cross-tenant exposure — but it is what lets malformed documents into the database.

**Timestamps.** Four of five services write `new Date().toISOString()` (a **string**); `recurrenceService` writes `serverTimestamp()` (a **Timestamp**). The mapper's guard is `typeof v === "string"`, so a Timestamp fails the check and gets replaced by the read-time clock — the displayed creation time of every recurrence is the moment it was read.

### The ordering hazard — read this before writing anything

Firestore orders values **by type before value**: `Null < Boolean < Number < Timestamp < String < …`. Four listeners sort on `createdAt`:

| File | Line | Query |
|---|---|---|
| `src/services/subscriptionService.ts` | 78 | `orderBy("createdAt", "desc")` |
| `src/services/recurrenceService.ts` | 106 | `orderBy("createdAt", "desc")` |
| `src/services/categoryService.ts` | 97 | `orderBy("createdAt", "asc")` |
| `src/services/spaceService.ts` | 89 | `orderBy("createdAt", "asc")` |

If new documents are Timestamps while old ones are strings, every pre-existing document sorts as one contiguous block **above or below** every new one. A subscription created in 2020 renders at the top of the list; today's renders at the bottom. This is not cosmetic and it is not gradual.

**Therefore the change ships in a strict order** — backfill first, then the writer, then the rules. This is a static GitHub Pages site with no service worker and no version gate, so a user's open tab can hold old JavaScript indefinitely. A rule that requires `is timestamp` deployed before those tabs refresh permanently denies their writes.

Your deliverables cover steps 1–2. Step 3's rule predicates are written but **gated off**, exactly as spec 01 gates the index deploy.

## Scope

**Modify:**
- `firestore.rules`
- `storage.rules`
- `src/services/transactionService.ts`
- `src/services/subscriptionService.ts`
- `src/services/categoryService.ts`
- `src/services/spaceService.ts`
- `src/services/recurrenceService.ts`
- `src/services/historyService.ts`
- `src/models/mappers.ts`
- `src/utils/errors.ts`

**Create:**
- `scripts/backfill-timestamps.js` — written, **not run**
- `src/models/__tests__/mappers.timestamps.test.ts`
- `src/services/__tests__/serviceErrors.test.ts`
- `functions/deleteWithIntegrityCheck.js` — the callable for F22
- `firestore.rules.strict` — the gated-off strict ruleset (see Requirement 9)

**Must NOT be touched:**
- `firestore.indexes.json` — spec 01; writing here can delete production indexes
- `.github/workflows/deploy.yml` — spec 01
- `functions/recurrenceProcessor.js`, `functions/subscriptionProcessor.js` — specs 02 and 04
- Any `src/pages/` or `src/components/` file — services and mappers only
- `src/contexts/*` — the toast translation is spec 11

**Out of scope:** translating the existing hardcoded English toasts (spec 11 — you produce the error *codes* it will translate), running either backfill, the storage-rules deploy itself.

## Existing code

### `firestore.rules` — complete
```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      match /{document=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

### `storage.rules` — complete
```
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```
The policy the client enforces, from `src/services/storageService.ts:10-11`:
```ts
const ALLOWED_TYPES = ["image/jpeg", "image/png", "application/pdf"] as const;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
```
Upload path, from `storageService.ts:38`: `users/${userId}/transactions/${transactionId}/attachment`.

### The spread pattern to eliminate — `src/services/subscriptionService.ts:23-52`
```ts
export const addSubscription = async (
  userId: string, subscriptionData: SubscriptionInput,
): Promise<Subscription> => {
  const subsRef = getSubsCollection(userId);
  const now = new Date().toISOString();
  const docRef = await addDoc(subsRef, {
    ...subscriptionData,                       // ← unvalidated spread
    status: subscriptionData.status ?? "active",
    createdAt: now,                            // ← ISO string
    updatedAt: now,
  });
  return toSubscription(docRef.id, { ...subscriptionData, createdAt: now, updatedAt: now });
};

export const updateSubscription = async (
  userId: string, subscriptionId: string, data: SubscriptionUpdate,
): Promise<void> => {
  const docRef = doc(db, "users", userId, "subscriptions", subscriptionId);
  await updateDoc(docRef, {
    ...(data as Record<string, unknown>),       // ← the cast defeats the types
    updatedAt: new Date().toISOString(),
  });
};
```
`src/services/recurrenceService.ts:89-99` has the identical shape.

### The pattern to copy — `src/services/transactionService.ts:113-149`
```ts
export const updateTransaction = async (
  userId: string, transactionId: string, data: TransactionUpdate,
): Promise<void> => {
  const docRef = doc(db, "users", userId, "transactions", transactionId);
  const updateData: Record<string, unknown> = { updatedAt: new Date().toISOString() };

  if (data.spaceId !== undefined) updateData["spaceId"] = data.spaceId;
  if (data.categoryId !== undefined) updateData["categoryId"] = data.categoryId;
  if (data.type !== undefined) updateData["type"] = data.type;
  if (data.currency !== undefined) updateData["currency"] = data.currency;
  if (data.transactionDate !== undefined) updateData["transactionDate"] = data.transactionDate;
  if (data.notes !== undefined) updateData["notes"] = data.notes?.trim() ?? null;
  if (data.attachmentUrl !== undefined) updateData["attachmentUrl"] = data.attachmentUrl;
  if (data.attachmentMeta !== undefined) updateData["attachmentMeta"] = data.attachmentMeta;

  if (data.amount !== undefined) {
    const amount = Math.round(data.amount * 100) / 100;
    if (isNaN(amount) || amount <= 0) throw new Error("Amount must be > 0.");
    updateData["amount"] = amount;
  }
  if (data.tags !== undefined) {
    updateData["tags"] = Array.isArray(data.tags)
      ? data.tags.map((t) => t.toLowerCase().trim()).filter(Boolean) : [];
  }
  await updateDoc(docRef, updateData);
};
```
Explicit field-by-field assignment. This is the target shape for every update function.

### `src/models/mappers.ts` — the substitution bug
```ts
const asISOString = (v: unknown): ISOString =>
  typeof v === "string" ? v : new Date().toISOString();   // ← Timestamp → "now"
```
Applied to both fields in every mapper, e.g. `toSubscription`:
```ts
createdAt: asISOString(data["createdAt"]),
updatedAt: asISOString(data["updatedAt"]),
```

### `src/utils/errors.ts` — complete
```ts
export const getErrorMessage = (err: unknown): string | undefined => {
  if (err instanceof Error) return err.message;
  if (typeof err === "object" && err !== null && "message" in err) {
    const message = (err as { message?: unknown }).message;
    if (typeof message === "string") return message;
  }
  return undefined;
};

export const formatAuthErrorMessage = (err: unknown): string | undefined =>
  getErrorMessage(err)?.replace("Firebase: ", "").replace(/\(auth\/.*\)/, "");
```

### The English strings services throw today (to become codes)
`transactionService.ts:32-49`: `"Amount must be > 0."`, `"Amount cannot exceed 999,999,999.99."`, `"Space is required."`, `"Category is required."`, `"Type must be Income or Expense."`, `"A valid currency is required."`, `"Transaction date must be in YYYY-MM-DD format."`
`categoryService.ts:43,45,83`: `"Category name is required."`, `'Category type must be "Income" or "Expense".'`, `"Cannot delete this category — it has linked transactions or recurrences. Remove those first."`
`spaceService.ts:39-41,75`: `"Space name is required."`, `"Space color is required."`, `"Space icon is required."`, `"Cannot delete this space — …"`

These surface directly to toasts via `getErrorMessage(err)` in pages, which is why they are currently untranslatable.

### The racy delete — `src/services/spaceService.ts:21-33,69-81`
```ts
const hasLinkedDocuments = async (userId: string, spaceId: string): Promise<boolean> => {
  const collectionsToCheck = ["transactions", "recurrences"] as const;
  for (const col of collectionsToCheck) {
    const ref = collection(db, "users", userId, col);
    const q = query(ref, where("spaceId", "==", spaceId), limit(1));
    const snap = await getDocs(q);
    if (!snap.empty) return true;
  }
  return false;
};

export const deleteSpace = async (userId: string, spaceId: string): Promise<void> => {
  const hasLinks = await hasLinkedDocuments(userId, spaceId);
  if (hasLinks) throw new Error("Cannot delete this space — …");
  const docRef = doc(db, "users", userId, "spaces", spaceId);
  await deleteDoc(docRef);
};
```
`categoryService.ts:25-37,77-89` is the same with `categoryId`.

## Requirements

### Timestamps

1. **All five services write `serverTimestamp()`** for `createdAt` and `updatedAt`, replacing every `new Date().toISOString()`. Client clocks are not authoritative for financial records. `historyService.addPaymentRecord` included.

2. **`asISOString` converts a Firestore `Timestamp` instead of fabricating a value.** Accept a value exposing a `toDate(): Date` method and return `.toDate().toISOString()`. Keep the string passthrough for legacy documents. **Only** when the value is neither — `null`, `undefined`, a number, an object without `toDate` — fall back, and make the fallback an empty string rather than `new Date().toISOString()`, so a missing timestamp reads as missing rather than as "now". Update the `ISOString` handling in consumers if an empty string breaks them; if it does, report it rather than reverting to the fabricating fallback.
   Do **not** import the `Timestamp` class into `mappers.ts` — duck-type on `toDate` so the mapper stays testable without the Firebase SDK.

3. **Every `add*` function builds its payload once and passes the same object to both `addDoc` and the mapper.** Today `addTransaction` stores normalised tags/notes but returns un-normalised ones built from raw input. Assign the payload to a local `const`, pass it to `addDoc`, and pass the same local to the mapper — with the caveat that `serverTimestamp()` is a sentinel, so the returned object's timestamps will not be readable client-side. Return `null`-valued timestamps in that case rather than inventing a clock value, and note the change in your report. (This also resolves F24, which spec 10 lists — do it here, since it is the same line.)

4. **Write `scripts/backfill-timestamps.js` — do not run it.** A `firebase-admin` Node script converting every string `createdAt`/`updatedAt` to a `Timestamp` across `subscriptions`, `recurrences`, `categories`, `spaces`, `transactions`, and `payments`. It must:
   - accept `--dry-run` (default) and write only on `--apply`
   - use `Timestamp.fromDate(new Date(isoString))`, skipping values that do not parse and logging them
   - be idempotent — a value that is already a `Timestamp` is left alone
   - batch writes (500 per batch, the Firestore limit) and log progress per collection
   - carry a header comment stating it **must be run before the client from Requirement 1 is deployed**, and why (the type-ordering hazard above)

### Rules

5. **`storage.rules` enforces the upload policy server-side.** Writes under `users/{userId}/…` additionally require `request.resource.size < 5 * 1024 * 1024` and a `contentType` matching JPEG, PNG, or PDF. Reads keep the current ownership-only condition. Deletes must remain allowed for the owner (spec 08 adds attachment deletion) — express that explicitly rather than letting it fall out of a broad `write`.

6. **`firestore.rules` gains per-collection field allowlists and type predicates**, replacing the single `match /{document=**}` catch-all with an explicit `match` block per collection: `transactions`, `subscriptions`, `recurrences`, `categories`, `spaces`, `payments`. For each, validate on create and update:
   - the field set is a subset of the known fields for that collection
   - required fields are present on create
   - types match the model (`amount` is a number, `currency` is a string in the six-code set, `transactionDate` matches `^\d{4}-\d{2}-\d{2}$`, `type` is `"Income"` or `"Expense"`, etc.)
   Model shapes are in `src/models/*.ts`; derive the field lists from them.
   **For `recurrences` specifically:** `status` accepts `"active" | "paused" | "completed"` — `"completed"` is a terminal state added by spec 02 (see `CONTEXT.md`, *Completed*), and omitting it from the allowlist would make the Cloud Function's end-date write fail. The allowlist must also permit the boolean `backlogTruncated`. It must **not** permit the legacy `isActive` or `nextExecutionDate`, so no client can write a pre-migration document.

7. **`payments` documents are not client-writable.** Spec 04 makes the Cloud Function the sole writer, and Admin SDK writes bypass rules. Client `create`, `update`, and `delete` on `users/{userId}/payments/{id}` are denied; `read` is allowed to the owner.

8. **Timestamp predicates are written but NOT in the active ruleset.** Requirement 6's rules must **not** assert `createdAt is timestamp`, because tabs holding old JavaScript still write strings.

9. **`firestore.rules.strict` holds the post-migration ruleset** — identical to `firestore.rules` plus the `is timestamp` predicates. It is not referenced by `firebase.json` and is not deployed. Head it with a comment stating the promotion procedure: run the backfill, deploy the Requirement 1 client, allow a client-refresh window, then copy this file over `firestore.rules` and deploy.

### Referential integrity

10. **Create `functions/deleteWithIntegrityCheck.js`** — an `onCall` callable taking `{ collection: "spaces" | "categories", id: string }`. It verifies the caller's `auth.uid`, then inside a single `db.runTransaction` checks for linked `transactions` and `recurrences` and either deletes the document or throws `HttpsError("failed-precondition", "…")` with a machine-readable code. Export it from `functions/index.js`.

11. **`deleteSpace` and `deleteCategory` call the callable** instead of doing a read-then-delete. Keep the function signatures `(userId, id) => Promise<void>` so callers are unaffected. Map the `HttpsError` to the same error-code contract as Requirement 12.

### Errors

12. **Services throw a typed error carrying a code, not an English sentence.** Add to `src/utils/errors.ts`:
    ```ts
    export class ServiceError extends Error {
      constructor(public readonly code: string, message: string) { super(message); this.name = "ServiceError"; }
    }
    export const isServiceError = (err: unknown): err is ServiceError => err instanceof ServiceError;
    ```
    Every service validation failure throws `new ServiceError("<code>", "<existing English sentence>")`. Codes are dot-namespaced and stable, e.g. `transaction.amountRequired`, `transaction.amountTooLarge`, `space.nameRequired`, `category.hasLinkedDocuments`. Keep the English message as the fallback so pages calling `getErrorMessage(err)` continue to show something sensible before spec 11 lands.
    **Do not change any page or context** — spec 11 consumes the codes.

13. **`updateSpace` validates a blank name** the way `updateCategory` already does (`if (data.name !== undefined && !data.name.trim()) throw …`). This is F31, listed under spec 10, but it is the same line you are rewriting — do it here.

14. **Every `update*` function uses explicit field-by-field assignment**, following the `updateTransaction` pattern quoted above. No `...spread`, no `as Record<string, unknown>` cast. This applies to `updateSubscription` and `updateRecurrence`'s remaining callers — note spec 02 deletes `updateRecurrence` entirely, so if it is already gone, skip it.

## Conventions to follow

- **Rules style** — `rules_version = '2';`, two-space indent, `match` blocks nested by path, conditions on `allow` lines. Factor repeated predicates into `function` declarations inside the `match /databases/{database}/documents` block:
  ```
  function isOwner(userId) {
    return request.auth != null && request.auth.uid == userId;
  }
  ```
- **Service functions** take `userId` first and return typed promises; collection refs come from a small local helper (`const getSubsCollection = (userId: string) => collection(db, "users", userId, "subscriptions");`).
- **Mapper helpers** are small named `asX` functions with an explicit fallback; add new ones rather than inlining logic.
- **Test style** — Vitest with globals, `describe` per exported function.

## Tests required

**`src/models/__tests__/mappers.timestamps.test.ts`**
- `asISOString` (via a mapper) with a `{ toDate: () => new Date("2026-01-15T10:00:00Z") }` object returns `"2026-01-15T10:00:00.000Z"`
- with a plain ISO string returns it unchanged
- with `null`/`undefined`/a number returns `""` and **does not** return a value near `Date.now()` — the explicit regression test for the fabricating fallback
- a full `toSubscription` round-trip with mixed-type timestamps

**`src/services/__tests__/serviceErrors.test.ts`**
- each validation failure throws a `ServiceError` with the expected `code`
- `isServiceError` narrows correctly
- a non-`ServiceError` throw is still handled by `getErrorMessage`

Existing tests must continue to pass unchanged.

## Definition of done

```
npm run lint
npm run test
npm run build
```
plus `npm run test` in `functions/`.

Rules files are not covered by the test suite — the orchestrator will review them by inspection and note that emulator-based rules tests are not run.

## Constraints

- **No new dependencies without asking first.** In particular do not add `@firebase/rules-unit-testing`; if you believe rules tests are essential, say so in your report and leave them unwritten.
- **No reformatting of untouched lines.**
- **No refactors beyond the listed files.** Do not touch pages, components, or contexts.
- **Do not put `is timestamp` predicates in `firestore.rules`.** They belong only in `firestore.rules.strict`.
- **Do not run either backfill script**, do not add them to CI, and do not add npm scripts for them.

## Report back

1. The implementation.
2. Your approach — particularly how you derived the field allowlists and what you did about the `serverTimestamp()` sentinel in `add*` return values.
3. Anything skipped, blocked, or decided differently. **Specifically: (a) whether the empty-string timestamp fallback broke any consumer and what you did about it, (b) whether `updateRecurrence` still existed when you got here, and (c) any collection whose field allowlist you could not confidently derive from the models.**
