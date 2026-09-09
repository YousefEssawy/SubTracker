# Spec 10 — Collapse duplication and delete dead code (W9)

> **You cannot run shell commands in this environment.** Do not attempt `npm`, `git`, `firebase`, `tsc`, or any test runner — the attempt is auto-denied and aborts your run with no output. Write files only. The orchestrator runs all gates and reports results back to you.

## Context

**Resolves:** F25 (dead code — an unused validation module plus nine unreferenced exports and two orphan locale files), F26 (duplicated implementations — two near-identical service/context pairs, three re-implementations of the confirm dialog, duplicated upload constants, a duplicate currency-symbol table), F27 (context values recreated on every render), F31 (`updateSpace` accepts a blank name while `updateCategory` rejects it), F34 (`_existingAttachmentUrl` underscore-prefixed as if unused but read on the submit path).

**This spec runs last, after specs 01–09 and 11–12 have landed.** It rewrites files those specs also touch, and the factory in Requirement 1 should be shaped by what they actually needed. Several findings listed here may already be resolved by an earlier spec — Requirement 12 tells you what to do in that case.

Nothing here changes user-visible behaviour except F31 (a blank space name becomes rejected). If any other change alters behaviour, you have gone too far.

## Scope

**Modify:**
- `src/services/spaceService.ts`
- `src/services/categoryService.ts`
- `src/contexts/SpaceContext.tsx`
- `src/contexts/CategoryContext.tsx`
- `src/contexts/TransactionContext.tsx`
- `src/contexts/RecurrenceContext.tsx`
- `src/contexts/SubscriptionContext.tsx`
- `src/contexts/ThemeContext.tsx`
- `src/contexts/ViewportContext.tsx`
- `src/pages/CategoriesPage.tsx`
- `src/pages/SpacesPage.tsx`
- `src/pages/TransactionFormPage.tsx`
- `src/components/finance/BalanceCard.tsx`
- `src/services/transactionService.ts`
- `src/utils/dateUtils.ts`

**Create:**
- `src/services/ownedCollection.ts`
- `src/services/__tests__/ownedCollection.test.ts`

**Delete:**
- `src/utils/validationUtils.ts`
- `src/locales/en/translation_old.json`
- `src/locales/ar/translation_old.json`

**Also modify (added after plan review):**
- `functions/recurrenceProcessor.js`
- `functions/subscriptionProcessor.js`

**Also create:**
- `functions/dueDocumentRunner.js`
- `functions/dueDocumentRunner.test.js`

**Must NOT be touched:**
- `firestore.rules`, `storage.rules`, `firestore.indexes.json`, `.github/workflows/deploy.yml`
- `shared/recurrenceDates.js`, `shared/billingCycles.js` — the date modules are already shared and correct
- `src/components/ui/ConfirmDialog.tsx` — spec 12 owns it; consume its post-spec-12 interface
- `src/models/*` — the model shapes do not change

**Out of scope:** modal accessibility (spec 12), i18n of hardcoded strings (spec 11), any behaviour change.

## Existing code

### The two near-identical services

`src/services/spaceService.ts` and `src/services/categoryService.ts` differ only in collection name, mapper, validated fields, and the linked-document field name.

```ts
// spaceService.ts — the shared shape
const getSpacesCollection = (userId: string) => collection(db, "users", userId, "spaces");

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

export const addSpace = async (userId: string, spaceData: SpaceInput): Promise<Space> => {
  if (!spaceData.name?.trim()) throw new Error("Space name is required.");
  if (!spaceData.color) throw new Error("Space color is required.");
  if (!spaceData.icon) throw new Error("Space icon is required.");
  const spacesRef = getSpacesCollection(userId);
  const now = new Date().toISOString();
  const docRef = await addDoc(spacesRef, {
    name: spaceData.name.trim(), color: spaceData.color, icon: spaceData.icon, createdAt: now,
  });
  return toSpace(docRef.id, { ...spaceData, createdAt: now });
};

export const updateSpace = async (userId: string, spaceId: string, data: SpaceUpdate): Promise<void> => {
  const docRef = doc(db, "users", userId, "spaces", spaceId);
  const updateData: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  if (data.name !== undefined) updateData["name"] = data.name.trim();   // ← no blank guard (F31)
  if (data.color !== undefined) updateData["color"] = data.color;
  if (data.icon !== undefined) updateData["icon"] = data.icon;
  await updateDoc(docRef, updateData);
};

export const subscribeToSpaces = (
  userId: string, callback: (spaces: Space[]) => void, onError?: (error: Error) => void,
): (() => void) => {
  const spacesRef = getSpacesCollection(userId);
  const q = query(spacesRef, orderBy("createdAt", "asc"));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((d) => toSpace(d.id, d.data())));
  }, onError);
};
```
`categoryService.ts` is the same with `categories`/`toCategory`/`categoryId`, and **does** have the blank-name guard:
```ts
if (data.name !== undefined && !data.name.trim()) throw new Error("Category name is required.");
```

> **Note:** spec 05 may already have rewritten these to throw `ServiceError` with codes, replaced the ISO timestamps with `serverTimestamp()`, moved the delete behind a callable, and added the F31 guard. Read the current files before assuming the code above is what you will find.

### The two near-identical contexts

`src/contexts/SpaceContext.tsx` and `src/contexts/CategoryContext.tsx` share the same effect, the same `useCallback` mutators, and the same `getXById` finder. `CategoryContext` additionally derives `incomeCategories` / `expenseCategories` with `useMemo`.

### Context values rebuilt every render (F27)

```tsx
// TransactionContext.tsx — a fresh object literal, including a new closure each render
const value: TransactionContextValue = {
  transactions, loading, filters,
  setFilters: handleSetFilters,
  balances,
  pagination: {
    hasNext, hasPrev, goNext, goPrev, pageSize,
    setPageSize: (size: number) => { setPageSize(size); resetPagination(); },   // ← new closure
    pageSizeOptions: PAGE_SIZE_OPTIONS,
  },
  addTransaction, updateTransaction,
};
```
```tsx
// RecurrenceContext.tsx — all four mutators are plain functions in the component body
const addRecurrence = async (data: RecurrenceInput): Promise<Recurrence> => {
  if (!user) throw new Error("Not authenticated");
  return addRec(user.uid, data);
};
```
```tsx
// ViewportContext.tsx — inline object, and an unthrottled resize handler
return (
  <ViewportContext.Provider value={{ width, isMobile, isTablet, isDesktop }}>
```
`SpaceContext` and `CategoryContext` memoise their callbacks but not the value object.

### Three re-implementations of the confirm dialog

`src/pages/SpacesPage.tsx:18-27`
```tsx
const ConfirmDialog = ({ spaceName, onConfirm, onCancel, loading }: {
  spaceName: string; onConfirm: () => void; onCancel: () => void; loading: boolean;
}) => { /* fixed inset-0 z-50 ... bg-black/50 overlay, framer-motion, backdrop click */ };
```
`src/pages/CategoriesPage.tsx:36-48`
```tsx
interface ConfirmDialogProps { name: string; onConfirm: () => void; onCancel: () => void; loading: boolean; }
const ConfirmDialog = ({ name, onConfirm, onCancel, loading }: ConfirmDialogProps) => { /* same markup */ };
```
`src/pages/RecurrencesPage.tsx:301-329` — the same overlay inlined anonymously, driven by `const [confirmDelete, setConfirmDelete] = useState<string | null>(null)` at `:149`.

All three shadow `src/components/ui/ConfirmDialog.tsx`, which `SubscriptionsPage.tsx:431-440` uses correctly:
```tsx
<ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)}
  onConfirm={handleDelete} title={t("subscriptions.deleteTitle")}
  message={t("subscriptions.deleteMessage")} confirmText={t("subscriptions.delete")}
  cancelText={t("subscriptions.cancel")} variant="danger" />
```
**The local copies have a `loading` prop the shared one lacks.** Spec 12 is responsible for adding it; check whether it did before migrating.

### The duplicate currency-symbol table — `src/components/finance/BalanceCard.tsx:7-26`
```tsx
const currencySymbolMap: Record<string, string> = {
  EGP: "E£", USD: "$", EUR: "€", GBP: "£", SAR: "﷼", AED: "د.إ",
  QAR: "﷼", KWD: "د.ك", BHD: "BD", OMR: "﷼", JOD: "JD", LBP: "ل.ل",
  TRY: "₺", CNY: "¥", JPY: "¥", INR: "₹", CAD: "CA$", AUD: "A$",
};
```
Eighteen currencies; the app supports six. `CURRENCIES` in `src/utils/currencies.ts` already carries `symbol` for each supported code.

### The dead exports

| Location | Symbol | Status |
|---|---|---|
| `src/utils/validationUtils.ts` | whole file, 117 lines | no importer; duplicates the live inline validation in `transactionService.ts:32-49` |
| `src/services/transactionService.ts:213` | `hasLinkedTransactions` | definition only |
| `src/utils/dateUtils.ts:142` | `getYearlyEquivalent` | definition only |
| `src/utils/dateUtils.ts:177` | `countRetroactiveOccurrences` | definition only |
| `src/utils/dateUtils.ts:195` | `generateRetroactiveDates` | definition only |
| `src/utils/balanceUtils.ts:59` | `filterTransactions` | referenced only by its own test |
| `src/locales/{en,ar}/translation_old.json` | both files | tracked; `src/i18n.js:5-6` imports only `translation.json` |
| `src/locales/en/translation.json` | `landing.howTo.{1..4}.color` | orphan keys; the colours are hardcoded at `LandingPage.tsx:329-347` |

### The misleading underscore — `src/pages/TransactionFormPage.tsx:60,139`
```tsx
const [_existingAttachmentUrl, setExistingAttachmentUrl] = useState<string | null>(null);
...
attachmentUrl: _existingAttachmentUrl,     // ← read on the submit path
```
ESLint's `varsIgnorePattern: "^[A-Z_]"` is why this passes lint.

## Requirements

1. **Create `src/services/ownedCollection.ts`** exporting a factory that builds the shared CRUD surface for a user-owned subcollection. It must produce `add`, `update`, `delete`, and `subscribe`, parameterised by: collection name, mapper function, `orderBy` field and direction, the linked-document field name (`spaceId` / `categoryId`), and a validator pair for create and update. It must **preserve every current behaviour exactly**, including the specific error messages or `ServiceError` codes each service throws today.

2. **`spaceService.ts` and `categoryService.ts` are rewritten on top of the factory** while keeping their existing public exports and signatures byte-compatible: `addSpace`, `updateSpace`, `deleteSpace`, `subscribeToSpaces`, and the category equivalents. No caller changes.

3. **`updateSpace` rejects a blank name (F31)**, matching `updateCategory`. If spec 05 already added this guard, verify it and leave it.

4. **Do not merge `SpaceContext` and `CategoryContext` into one generic context.** The services share a shape; the contexts have different derived values (`incomeCategories`/`expenseCategories`) and different consumers. A generic context factory here would be harder to read than the duplication it removes. Leave them as two files.

5. **Every context memoises its value object (F27).** Wrap each provider's `value` in `useMemo` with an explicit dependency array, and every handler in `useCallback`. This applies to all seven contexts listed in Scope. In `TransactionContext`, the inline `setPageSize` closure and the `pagination` sub-object must both be memoised, not just the outer object.

6. **`RecurrenceContext`'s four mutators become `useCallback`s** with the same `if (!user) throw new Error("Not authenticated")` guard they already have.

7. **`ViewportContext`'s resize handler is throttled** to at most one state update per animation frame, and its value object is memoised. It is the outermost provider, so an unthrottled `setWidth` re-renders the entire tree on every resize event. Use `requestAnimationFrame` — no dependency.

8. **All three local confirm dialogs are deleted** and their pages use `@/components/ui/ConfirmDialog`. `SpacesPage`, `CategoriesPage`, and `RecurrencesPage` each pass `isOpen`, `onClose`, `onConfirm`, `title`, `message`, `confirmText`, `cancelText`, and `variant="danger"`, preserving the exact translation keys and interpolations they use today (e.g. `finance.spaces.deleteMessage` with `{ name }`). If the shared component lacks a `loading` prop after spec 12, report it and keep the button-disabled behaviour by whatever means the shared component supports — do **not** re-add a local dialog.

9. **`BalanceCard` uses `CURRENCIES` from `@/utils/currencies`** for symbols. Delete `currencySymbolMap`. For a code absent from `CURRENCIES`, keep the existing fallback of rendering the code itself.

10. **Delete every dead symbol in the table above**, including the two `translation_old.json` files and the orphan `landing.howTo.{1..4}.color` keys from the English locale.
    - `filterTransactions` is used only by `src/utils/balanceUtils.test.ts`. **Delete both the function and its tests** — the app filters server-side and keeping a tested-but-unused code path is worse than removing it. `computeBalances` and its tests stay.
    - Before deleting `validationUtils.ts`, confirm nothing imported it during specs 01–09. If something now does, stop and report rather than deleting.

11. **Rename `_existingAttachmentUrl` to `existingAttachmentUrl` (F34)** in `TransactionFormPage.tsx`, updating both the declaration and the read.

12. **Findings already resolved by an earlier spec are verified, not redone.** Spec 05 may have covered F31 and F24 (the `add*` return-value mismatch); spec 08 covered the `ALLOWED_TYPES`/`MAX_SIZE` duplication; spec 12 covers the dialog component itself. For each, check the current state, leave it alone if correct, and **list in your report which findings were already resolved and by which spec**.

13. **Extract the shared processor runner.** Specs 02 and 04 deliberately built two structurally identical scheduled processors, deferring the abstraction to this spec so it could be shaped by two working implementations. Extract `functions/dueDocumentRunner.js` taking the parts that genuinely differ — collection id, the due-date field name, the advance function, and an emit callback — and leaving the shared mechanism in one place: the collection-group query, the user-id-from-path derivation (including the null-parent guard), the `runTransaction` with its re-read guard, the bounded 500-iteration loop, and the per-document `try/catch` and logging. Both processors then configure it. **The extraction must not change either processor's behaviour**; the tests written in specs 02 and 04 must pass unchanged, which is the check that it didn't.

14. **The category rename is already done — do not repeat it.** Spec 00 renamed `CategoryId` → `SubscriptionCategoryId`, `CATEGORIES` → `SUBSCRIPTION_CATEGORIES`, `getCategoryById` → `getSubscriptionCategoryById`, and `asCategoryId` → `asSubscriptionCategoryId`. The `subscription.category` **field** was deliberately left alone; do not rename it here.

15. **`npm run lint` must pass with no new suppressions.** Removing `_existingAttachmentUrl`'s underscore means `varsIgnorePattern` no longer covers it — the variable is genuinely used, so this should be fine, but verify the reasoning holds.

## Conventions to follow

- **Service functions** take `userId` first, return typed promises, and get their collection ref from a small local helper.
- **Context providers** expose a `useX` hook that throws when used outside the provider:
  ```tsx
  export const useSpaces = (): SpaceContextValue => {
    const ctx = useContext(SpaceContext);
    if (!ctx) throw new Error("useSpaces must be used within SpaceProvider");
    return ctx;
  };
  ```
- **Mutators** are `useCallback`s guarded by `if (!user) throw new Error("Not authenticated")`.
- **Derived collections** use `useMemo` with an explicit dependency array:
  ```tsx
  const incomeCategories = useMemo(() => categories.filter((c) => c.type === "Income"), [categories]);
  ```
- **Translation keys are preserved exactly** when migrating markup — a dialog that showed `finance.spaces.deleteTitle` must still show it.

## Tests required

**`src/services/__tests__/ownedCollection.test.ts`** — mock `firebase/firestore`:
- the factory's `add` trims the name and rejects a blank one
- `update` rejects a blank name for both spaces and categories (the F31 regression test)
- `delete` refuses when linked documents exist, using the configured field name
- `subscribe` builds the query with the configured `orderBy` field and direction

Existing tests must continue to pass, **except** `filterTransactions`' tests, which are deleted with the function. `computeBalances`' tests in the same file stay untouched.

**No new tests for the memoisation work.** Requirement 5 is a performance change with no observable behaviour difference; a test asserting render counts would be brittle. State in your report how you convinced yourself the memoisation did not change behaviour.

## Definition of done

```
npm run lint
npm run test
npm run build
```

Deleting `validationUtils.ts` and the dead exports means the typecheck is the primary safety net — any surviving importer fails compilation, which is the intended forcing function.

## Constraints

- **No new dependencies without asking first.**
- **No reformatting of untouched lines.**
- **No refactors beyond the listed files.** In particular: do not generalise the contexts (Requirement 4), do not restructure any page's layout, do not touch `src/models/`.
- **No behaviour changes** other than F31. If a refactor would alter what the user sees, stop and report instead.
- Do not delete `computeBalances`, `hasLinkedDocuments` (used by the factory), or anything a spec 01–09 change introduced.

## Report back

1. The implementation.
2. Your approach — especially the factory's parameterisation and how you kept the two services' differing validation intact.
3. Anything skipped, blocked, or decided differently. **Specifically: (a) the list from Requirement 12 of findings already resolved by earlier specs, (b) how you satisfied yourself the memoisation changed no behaviour, and (c) whether `validationUtils.ts` had acquired any importer.**
