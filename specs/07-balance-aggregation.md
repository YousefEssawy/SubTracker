# Spec 07 — Bounded balance queries via server-side aggregation (W6b)

> **You cannot run shell commands in this environment.** Do not attempt `npm`, `git`, `firebase`, `tsc`, or any test runner — the attempt is auto-denied and aborts your run with no output. Write files only. The orchestrator runs all gates and reports results back to you.

## Context

**Resolves:** F10 — every balance recomputation streams the user's entire transaction history to the browser with no limit.

`TransactionContext` runs two Firestore listeners. One is paged (10–50 documents). The other, `subscribeToAllTransactions`, has **no `limit()`** and holds an open `onSnapshot` over the whole `transactions` collection, purely so `computeBalances` can add the numbers up client-side. Read cost, bandwidth, and memory all grow linearly and without bound as the account ages. A user with 20,000 transactions downloads 20,000 documents to display six numbers.

**The approach was decided during plan review, and one option was ruled out.** An earlier draft proposed maintaining denormalised per-currency aggregate documents updated on write. That does not work here: the filter set includes a user-selected free `dateRange` and, after spec 06, a `tag`. Pre-aggregating an arbitrary conjunction over an arbitrary date interval is not a well-posed problem. Do not implement aggregate documents, a counter collection, or a write-time rollup.

Use Firestore's server-side aggregation (`getAggregateFromServer` with `sum()` and `count()`). The database computes the totals and returns scalars.

### The trade-off you are implementing deliberately

Aggregation queries are **one-shot reads, not live listeners**. Balances will stop updating in real time when another tab or the Cloud Function writes a transaction. This is an accepted, intended consequence — the requirements below specify explicit refresh points to compensate. Do not try to preserve live updates by keeping the old listener alongside the new query.

## Scope

**Modify:**
- `src/services/transactionService.ts`
- `src/contexts/TransactionContext.tsx`
- `src/utils/balanceUtils.ts`

**Create:**
- `src/services/__tests__/transactionService.balances.test.ts`
- `src/contexts/__tests__/TransactionContext.balances.test.tsx`

**Must NOT be touched:**
- `src/components/finance/BalanceCard.tsx` — the presentational component; its props do not change
- `src/pages/TransactionsPage.tsx`, `src/pages/DashboardPage.tsx` — they read `balances` from the context and must keep working unchanged
- `src/components/finance/FilterBar.tsx` — spec 06
- `firestore.indexes.json` — spec 01; see Requirement 9 for what to do instead
- Anything under `functions/` or `shared/`

**Out of scope:** pagination and the tag debounce (spec 06 — assume it has landed and `tag` is already in `balanceFilters`), the currency policy (spec 03 — `balances` is already per-currency), memoising the context value (spec 10).

## Existing code

### `src/services/transactionService.ts:53-73` — the shared query builder
```ts
const buildQuery = (userId: string, filters: TransactionFilters = {}) => {
  const ref = getTxCollection(userId);
  const constraints = [];

  if (filters.spaceId) constraints.push(where("spaceId", "==", filters.spaceId));
  if (filters.type) constraints.push(where("type", "==", filters.type));
  if (filters.currency) constraints.push(where("currency", "==", filters.currency));
  if (filters.tag)
    constraints.push(where("tags", "array-contains", filters.tag.toLowerCase().trim()));
  if (filters.dateRange?.start)
    constraints.push(where("transactionDate", ">=", filters.dateRange.start));
  if (filters.dateRange?.end)
    constraints.push(where("transactionDate", "<=", filters.dateRange.end));

  constraints.push(orderBy("transactionDate", "desc"));
  return query(ref, ...constraints);
};
```

### `src/services/transactionService.ts:194-211` — the unbounded listener to remove
```ts
export const subscribeToAllTransactions = (
  userId: string,
  filters: TransactionFilters = {},
  callback: (transactions: Transaction[]) => void,
  onError?: (error: Error) => void,
): (() => void) => {
  const q = buildQuery(userId, filters);          // ← no limit()
  return onSnapshot(q, (snapshot) => {
    const transactions = snapshot.docs.map((d) => toTransaction(d.id, d.data()));
    callback(transactions);
  }, onError);
};
```

### `src/contexts/TransactionContext.tsx` — the consumer (post-spec-06 shape)
```tsx
const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);

useEffect(() => {
  if (!user) { setAllTransactions([]); return; }
  const balanceFilters: TransactionFilters = {
    spaceId: filters.spaceId,
    currency: filters.currency,
    dateRange: filters.dateRange,
    type: filters.type,
    tag: filters.tag,          // added by spec 06
  };
  const unsub = subscribeToAllTransactions(user.uid, balanceFilters, setAllTransactions,
    (err) => { console.error(err); toast.error("Failed to sync balances."); });
  return () => unsub();
}, [user, filters.spaceId, filters.currency, filters.dateRange, filters.type, filters.tag]);

const balances = useMemo(() => computeBalances(allTransactions), [allTransactions]);
```
`balances` is exposed on the context value and consumed by `TransactionsPage` (`<BalanceCard variant="contextual" balances={balances} />`) and `DashboardPage`.

### `src/utils/balanceUtils.ts` — the client-side reducer and the target shape
```ts
export const computeBalances = (transactions: Transaction[] = []): BalanceMap => {
  const result: Partial<Record<CurrencyCode, CurrencyBalance>> = {};
  for (const tx of transactions) {
    const { currency, type, amount } = tx;
    if (!currency || !type || amount == null) continue;
    if (!result[currency]) result[currency] = { income: 0, expense: 0, balance: 0 };
    const entry = result[currency]!;
    const rounded = Math.round(amount * 100) / 100;
    if (type === "Income") entry.income = Math.round((entry.income + rounded) * 100) / 100;
    else if (type === "Expense") entry.expense = Math.round((entry.expense + rounded) * 100) / 100;
  }
  for (const currency of Object.keys(result) as CurrencyCode[]) {
    const entry = result[currency]!;
    entry.balance = Math.round((entry.income - entry.expense) * 100) / 100;
  }
  return result;
};
```
`BalanceMap = Partial<Record<CurrencyCode, CurrencyBalance>>`, `CurrencyBalance = { income: number; expense: number; balance: number }`. **This output shape must not change** — `BalanceCard` and both pages depend on it.

### The six currencies (`src/utils/currencies.ts`)
`"EGP" | "USD" | "EUR" | "GBP" | "SAR" | "AED"` — a fixed, closed set of six.

### The paged-subscription pattern to mirror for signatures
```ts
export const subscribeToTransactions = (
  userId: string,
  filters: TransactionFilters = {},
  callback: (transactions: Transaction[], rawDocs: QueryDocumentSnapshot<DocumentData>[]) => void,
  onError?: (error: Error) => void,
): (() => void) => { /* ... */ };
```

## Requirements

1. **Add `fetchBalances(userId, filters)` to `src/services/transactionService.ts`**, returning `Promise<BalanceMap>`. It must:
   - reuse `buildQuery`'s constraint logic so the filter semantics cannot drift from the paged query — extract the constraint-building into a shared helper rather than duplicating the `if` chain
   - **omit `orderBy`** from the aggregation query; ordering is meaningless for a sum and adds an index requirement for nothing
   - use `getAggregateFromServer` from `firebase/firestore` with `sum("amount")` and `count()`
   - run one aggregation per `(currency, type)` combination **present in the filter set**, not a blanket 12 (6 currencies × 2 types) — see Requirement 2
   - assemble the result into the existing `BalanceMap` shape, applying the same `Math.round(x * 100) / 100` rounding `computeBalances` uses, and computing `balance` as `income - expense`
   - include a currency key only when at least one of its two aggregations returned a non-zero count, preserving the documented behaviour that *"only currencies present in the input appear in the result"*

2. **Query fan-out is bounded and filter-aware.**
   - If `filters.currency` is set, query only that currency (2 aggregations: Income and Expense).
   - If `filters.type` is set, query only that type.
   - Otherwise query all six currencies × both types. Issue them concurrently with `Promise.all`, not sequentially.
   - State the worst-case aggregation count in a comment.

3. **Delete `subscribeToAllTransactions`.** After this spec no code may reference it. `subscribeToTransactions` (the paged one) stays exactly as it is.

4. **`TransactionContext` replaces the listener with a fetch.** Remove `allTransactions` state and the `computeBalances` `useMemo`; hold `balances` in state directly, populated by `fetchBalances`. Keep the same `balanceFilters` object and dependency array so filter semantics are unchanged.

5. **Handle out-of-order responses.** Because this is now an async fetch rather than a subscription, a slow response for filter set A can land after a fast response for filter set B. Guard with a cancellation flag or a request-sequence counter in the effect cleanup so a stale response never overwrites fresher balances. This is a hard requirement, not a nicety.

6. **Expose `refreshBalances(): Promise<void>` on the context value** and add it to `TransactionContextValue`. It re-runs `fetchBalances` with the current filters.

7. **Balances refresh after a local mutation.** `addTransaction` and `updateTransaction` on the context must call `refreshBalances()` after the write resolves, so the figures move immediately for the user who made the change. This is what compensates for losing the live listener.

8. **A `balancesLoading: boolean` flag is exposed** on the context value, true while a `fetchBalances` call is in flight. `BalanceCard` is not being modified in this spec, so nothing has to consume it yet — but the context must expose it. Do not add a spinner to `BalanceCard`.

9. **Do not edit `firestore.indexes.json`.** Aggregation queries use the same indexes as the equivalent `where` query, and dropping `orderBy` means the requirement is no greater than the paged query's. **In your report, list the exact filter combinations that would need a composite index** so the operator can merge them in spec 01's runbook.

10. **Errors are handled, not thrown to render.** On failure: `console.error`, `toast.error` with the same hardcoded English style already used (`"Failed to sync balances."`), leave the previous `balances` value in place rather than clearing to `{}`, and clear `balancesLoading`.

11. **`computeBalances` and `filterTransactions` stay in `src/utils/balanceUtils.ts`.** `computeBalances` is no longer called by the context but remains the canonical definition of the arithmetic and is still under test. Add a comment noting it is now the reference implementation used by tests and by `fetchBalances`' rounding contract. Do not delete either function — `filterTransactions`' removal is spec 10's call.

## Conventions to follow

- **Service functions** take `userId` first, use the local `getTxCollection` helper, and return typed promises:
  ```ts
  const getTxCollection = (userId: string) => collection(db, "users", userId, "transactions");
  ```
- **Firestore imports are named, from `"firebase/firestore"`**, added to the existing import block at the top of the service — do not create a second import statement from the same module.
- **Money rounding is always `Math.round(x * 100) / 100`**, applied at each accumulation step, exactly as `computeBalances` does. Do not substitute `toFixed` or a different rounding strategy — the tests compare against `computeBalances`.
- **Context effects clean up:**
  ```tsx
  useEffect(() => {
    let cancelled = false;
    // ...
    return () => { cancelled = true; };
  }, [deps]);
  ```
- **Errors in contexts** use `console.error` then `toast.error`.

## Tests required

**`src/services/__tests__/transactionService.balances.test.ts`** — mock `firebase/firestore` and assert on the calls:
1. `fetchBalances` with no filters issues aggregations covering all six currencies × two types, and issues them concurrently.
2. `fetchBalances` with `{ currency: "USD" }` issues exactly two aggregations, both for USD.
3. `fetchBalances` with `{ type: "Income" }` issues no Expense aggregation.
4. A currency whose aggregations both return `count === 0` is **absent** from the returned `BalanceMap`.
5. The returned map matches `computeBalances` over an equivalent transaction array — build a fixture array, compute the expected map with `computeBalances`, stub the aggregation results to match, and assert deep equality. This pins the two implementations together.
6. The aggregation query carries **no `orderBy`** constraint.

**`src/contexts/__tests__/TransactionContext.balances.test.tsx`** — with `@testing-library/react` and mocked services:
1. Balances populate on mount.
2. Changing filters triggers a new `fetchBalances` with the updated filter object.
3. **A stale in-flight response does not overwrite a newer one** — resolve two calls out of order and assert the newer filter set's result survives. This is the Requirement 5 regression test.
4. `addTransaction` triggers `refreshBalances`.
5. A rejected `fetchBalances` leaves the previous balances intact and clears `balancesLoading`.

## Definition of done

```
npm run lint
npm run test
npm run build
```

The orchestrator cannot exercise real Firestore aggregation — it will verify by unit test and by inspection, and will say so in the review. If any requirement here can only be validated against a live project, name it in your report.

## Constraints

- **No new dependencies without asking first.** `getAggregateFromServer`, `sum`, and `count` are part of the `firebase` package already in `package.json` (`^12.9.0`).
- **No reformatting of untouched lines.**
- **No refactors beyond the listed files.** `BalanceCard`, both pages, and `FilterBar` are off-limits — if the change forces an edit to any of them, stop and report instead.
- **Do not implement aggregate documents, counters, or write-time rollups.**
- **Do not keep the old listener as a fallback.** One mechanism, not two.
- Do not change the `BalanceMap` / `CurrencyBalance` shapes.

## Report back

1. The implementation.
2. Your approach — especially the fan-out strategy and the staleness guard.
3. Anything skipped, blocked, or decided differently. **Specifically: (a) the list of composite indexes required, for spec 01's runbook, (b) the worst-case number of aggregation queries per filter change, and (c) whether removing the live listener causes any visible regression you think the user should know about beyond the one already accepted above.**
