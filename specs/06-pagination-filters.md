# Spec 06 — Transaction pagination and filter consistency (W6a)

> **You cannot run shell commands in this environment.** Do not attempt `npm`, `git`, `firebase`, `tsc`, or any test runner — the attempt is auto-denied and aborts your run with no output. Write files only. The orchestrator runs all gates and reports results back to you.

## Context

**Resolves:** F2 (the "Next" button does nothing), F11 (typing in the tag filter rebuilds a Firestore listener per keystroke), F39 (the tag filter is silently excluded from the balance figures).

The transactions page shows a paged list beside a "contextual" balance card and a filter bar. Three defects, all in `TransactionContext`:

**F2 — pagination is a no-op.** `subscribeToTransactions` hands the callback two arguments: the mapped transactions *and* the raw Firestore document snapshots needed to build a cursor. The context's callback takes only the first. `cursorStackRef` is declared and cleared but **never written to**, so `cursorStackRef.current[cursorIndex]` is always `undefined`, `startAfterDoc` is always `undefined`, and clicking "Next" re-runs the same first-page query — while `hasPrev` flips to `true`, so the UI claims you have moved.

**F11 — a listener per keystroke.** The tag input calls `setFilters` on every `onChange`. `filters` is a dependency of the paged effect, so each character tears down the Firestore listener and opens a new one, and resets pagination. The query is `array-contains` on an exact lowercased tag, so every intermediate prefix matches nothing anyway.

**F39 — balances ignore the tag.** The second effect builds `balanceFilters` by copying `spaceId`, `currency`, `dateRange`, and `type` — every filter **except** `tag`. Filter by tag and the list narrows while the income/expense/balance figures above it do not move. The card is explicitly the filter-aware variant and sits directly above the filter controls.

**F11 and F39 must land together.** Adding `tag` to `balanceFilters` without the debounce turns every keystroke into a full-collection re-read, which is strictly worse than the bug being fixed.

## Scope

**Modify:**
- `src/contexts/TransactionContext.tsx`
- `src/components/finance/FilterBar.tsx`

**Create:**
- `src/contexts/__tests__/TransactionContext.pagination.test.tsx`
- `src/contexts/__tests__/TransactionContext.filters.test.tsx`

**Must NOT be touched:**
- `src/services/transactionService.ts` — its callback signature is already correct; the bug is that the context ignores it. If you believe a service change is genuinely required, stop and report rather than editing it.
- `src/components/ui/Pagination.tsx` — the presentational component is correct
- `src/pages/TransactionsPage.tsx`
- `src/components/finance/BalanceCard.tsx`
- Anything under `functions/`, `shared/`, or `src/services/`

**Out of scope:** the unbounded balance stream (spec 07 — leave `subscribeToAllTransactions` in place), `BalanceCard`'s hardcoded `"en-US"` (spec 11), the `FilterBar` layout.

## Existing code

### `src/contexts/TransactionContext.tsx` — the whole relevant body
```tsx
const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;
const DEFAULT_PAGE_SIZE = 10;

interface PaginationControl {
  hasNext: boolean;
  hasPrev: boolean;
  goNext: () => void;
  goPrev: () => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  pageSizeOptions: readonly number[];
}

export const TransactionProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();

  const [filters, setFilters] = useState<TransactionFilters>({});
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const cursorStackRef = useRef<QueryDocumentSnapshot<DocumentData>[]>([]);
  const [cursorIndex, setCursorIndex] = useState(-1);
  const [hasNext, setHasNext] = useState(false);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (!user) { setTransactions([]); setLoading(false); return; }
    setLoading(true);
    const cursor = cursorIndex >= 0 ? cursorStackRef.current[cursorIndex] : null;
    const unsub = subscribeToTransactions(
      user.uid,
      { ...filters, pageSize: pageSize + 1, startAfterDoc: cursor ?? undefined },
      (docs) => {                                   // ← rawDocs dropped (F2)
        if (docs.length > pageSize) {
          setTransactions(docs.slice(0, pageSize));
          setHasNext(true);
        } else {
          setTransactions(docs);
          setHasNext(false);
        }
        setLoading(false);
      },
      (err) => { console.error(err); toast.error("Failed to sync transactions."); setLoading(false); },
    );
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, filters, pageSize, cursorIndex]);

  useEffect(() => {
    if (!user) { setAllTransactions([]); return; }
    const balanceFilters: TransactionFilters = {
      spaceId: filters.spaceId,
      currency: filters.currency,
      dateRange: filters.dateRange,
      type: filters.type,
                                                    // ← tag missing (F39)
    };
    const unsub = subscribeToAllTransactions(user.uid, balanceFilters, setAllTransactions,
      (err) => { console.error(err); toast.error("Failed to sync balances."); });
    return () => unsub();
  }, [user, filters.spaceId, filters.currency, filters.dateRange, filters.type]);

  const balances = useMemo(() => computeBalances(allTransactions), [allTransactions]);

  const hasPrev = cursorIndex >= 0;

  const goNext = useCallback(() => {
    if (!hasNext || transactions.length === 0) return;
    setCursorIndex((i) => i + 1);
  }, [hasNext, transactions]);

  const goPrev = useCallback(() => { setCursorIndex((i) => Math.max(i - 1, -1)); }, []);

  const resetPagination = useCallback(() => {
    cursorStackRef.current = [];                    // ← the only write, and it clears
    setCursorIndex(-1);
  }, []);

  const handleSetFilters = useCallback((newFilters: TransactionFilters) => {
    setFilters(newFilters);
    resetPagination();
  }, [resetPagination]);

  const value: TransactionContextValue = {
    transactions, loading, filters,
    setFilters: handleSetFilters,
    balances,
    pagination: {
      hasNext, hasPrev, goNext, goPrev, pageSize,
      setPageSize: (size: number) => { setPageSize(size); resetPagination(); },
      pageSizeOptions: PAGE_SIZE_OPTIONS,
    },
    addTransaction, updateTransaction,
  };
  return <TransactionContext.Provider value={value}>{children}</TransactionContext.Provider>;
};
```

### `src/services/transactionService.ts:161-192` — the callback that already supplies the cursor
```ts
export const subscribeToTransactions = (
  userId: string,
  filters: TransactionFilters = {},
  callback: (
    transactions: Transaction[],
    rawDocs: QueryDocumentSnapshot<DocumentData>[],   // ← second argument, unused by the context
  ) => void,
  onError?: (error: Error) => void,
): (() => void) => {
  const baseQuery = buildQuery(userId, filters);
  const pageSize = filters.pageSize ?? 10;

  let q = query(baseQuery, limit(pageSize));
  if (filters.startAfterDoc) {
    q = query(baseQuery, startAfter(filters.startAfterDoc as QueryDocumentSnapshot<DocumentData>), limit(pageSize));
  }

  return onSnapshot(q, (snapshot) => {
    const transactions = snapshot.docs.map((d) => toTransaction(d.id, d.data()));
    callback(transactions, snapshot.docs);
  }, onError);
};
```

### `src/utils/balanceUtils.ts:8-16` — the filter shape
```ts
export interface TransactionFilters {
  spaceId?: string;
  currency?: CurrencyCode;
  type?: "Income" | "Expense";
  dateRange?: { start?: string; end?: string };
  tag?: string;
  pageSize?: number;
  startAfterDoc?: unknown;
}
```

### `src/components/finance/FilterBar.tsx` — the un-debounced input and the update helpers
```tsx
const updateFilter = <K extends keyof Filters>(key: K, value: Filters[K]) => {
  setFilters({ ...filters, [key]: value });
};

const updateDateRange = (field: "start" | "end", value: string) => {
  const current = filters.dateRange || {};
  const next = { ...current, [field]: value || undefined };
  if (!next.start && !next.end) {
    const { dateRange: _dr, ...rest } = filters;
    setFilters(rest as Filters);
  } else {
    setFilters({ ...filters, dateRange: next });
  }
};

const clearAll = () => setFilters({});
```
```tsx
<input
  type="text"
  value={filters.tag || ""}
  onChange={(e) => updateFilter("tag", e.target.value || undefined)}   // ← every keystroke
  placeholder={t("finance.filters.tagPlaceholder", "Filter by tag…")}
  className="input-field text-sm py-2"
/>
```
The space, currency, and type controls are `<select>` and buttons — they fire once per choice and need no debounce.

### `src/services/transactionService.ts:53-73` — how `tag` reaches Firestore
```ts
if (filters.tag)
  constraints.push(where("tags", "array-contains", filters.tag.toLowerCase().trim()));
```

## Requirements

1. **The context's snapshot callback accepts `rawDocs` and maintains the cursor stack.** On each snapshot, when there are more than `pageSize` documents, store the snapshot at index `pageSize - 1` (the last document of the *current* page) as the cursor for the **next** page, at `cursorStackRef.current[cursorIndex + 1]`. `goNext` then advances `cursorIndex` and the effect re-queries with that cursor.

2. **`goNext` does nothing unless a cursor for the next page exists.** Guard on both `hasNext` and the presence of `cursorStackRef.current[cursorIndex + 1]`, so a race between the click and the snapshot cannot advance into an undefined cursor and silently reset to page 1.

3. **The cursor stack is truncated, not just cleared, when the query changes.** Changing filters or `pageSize` invalidates every stored cursor. `resetPagination` must empty the array *and* set `cursorIndex` to `-1` — it already does both; keep that behaviour and make sure no stale entries survive a `goPrev` followed by a filter change.

4. **`goPrev` returns to the previous page correctly**, including from page 2 back to page 1 (`cursorIndex` `0` → `-1`, cursor `null`).

5. **`hasPrev` is true only when a previous page actually exists** — i.e. `cursorIndex >= 0`. Unchanged in principle, but it must not be true after a filter reset.

6. **The tag filter input is debounced by 300 ms** before it reaches `setFilters`. Requirements:
   - `FilterBar` holds local state for the tag text so typing stays responsive and the input remains controlled from local state, not from `filters.tag`
   - the debounced value is pushed to `setFilters` 300 ms after the last keystroke
   - the pending timer is cleared on unmount
   - when `filters.tag` changes from outside (the "clear all" button, or the chip's remove control), the local state resyncs — clearing the filter must visibly clear the input
   - pressing **Enter** or blurring the input commits immediately without waiting for the timer
   - the other filter controls are **not** debounced

7. **`balanceFilters` includes `tag`**, and `filters.tag` is added to the second effect's dependency array. Because of Requirement 6, this fires at most once per 300 ms of typing rather than per keystroke.

8. **The balance figures and the transaction list always reflect the same filter set.** After this change the only intentional difference between the two queries is pagination — the paged query carries `pageSize`/`startAfterDoc`, the balance query does not. Add a short comment in `balanceFilters` saying that any new filter must be added in both places, so the next person does not repeat F39.

9. **No behaviour change to `addTransaction` / `updateTransaction`** in this context.

10. **The `eslint-disable-next-line react-hooks/exhaustive-deps` on the paged effect stays only if still necessary.** If your changes let the dependency array be honest, remove the suppression. If not, keep it and explain why in your report — do not add new suppressions.

## Conventions to follow

- **Context state lives in the provider; the value object exposes callbacks wrapped in `useCallback`:**
  ```tsx
  const goPrev = useCallback(() => { setCursorIndex((i) => Math.max(i - 1, -1)); }, []);
  ```
- **Subscriptions are always torn down in the effect's cleanup:**
  ```tsx
  const unsub = subscribeToX(...);
  return () => unsub();
  ```
- **Errors in contexts** are logged with `console.error` and surfaced with `toast.error`. The existing strings are hardcoded English — leave them; spec 11 translates them. Do not add new hardcoded strings.
- **`FilterBar` reads and writes filters only through its `filters` / `setFilters` props** — it holds no other cross-component state. Local UI state (like `showMore`) is fine, and the debounce state belongs in that category.
- **Tailwind classes carry light and dark variants.** Match surrounding markup if you touch any.

## Tests required

Test files go in `src/contexts/__tests__/`. Use Vitest with globals plus `@testing-library/react` (both already configured — `src/test/setup.ts` imports the jest-dom matchers). Mock `@/services/transactionService` and `@/contexts/AuthContext` with `vi.mock`.

**`TransactionContext.pagination.test.tsx`** — the F2 regression suite. Drive the mocked `subscribeToTransactions` so you control what the callback receives, and assert on the `filters` object the service is called with:
1. Initial mount queries with `startAfterDoc: undefined`.
2. Given a snapshot of `pageSize + 1` documents, `hasNext` is `true` and only `pageSize` transactions are exposed.
3. **After `goNext()`, the service is called again with `startAfterDoc` set to the last document of page 1** — this is the assertion that fails against the current code and is the point of the suite.
4. `goPrev()` from page 2 queries with `startAfterDoc: undefined` again.
5. Changing filters resets to page 1 and `hasPrev` becomes `false`.
6. `goNext()` is a no-op when `hasNext` is `false`.

**`TransactionContext.filters.test.tsx`** — the F39/F11 suite:
1. `subscribeToAllTransactions` is called with a filter object **containing `tag`** when a tag filter is set.
2. The balance query's filter object matches the paged query's, ignoring `pageSize` and `startAfterDoc`.
3. Typing a multi-character tag results in **one** `subscribeToAllTransactions` call after the debounce window, not one per character. Use `vi.useFakeTimers()` and advance them.

Write these to fail against the current implementation and pass against the fixed one. A test that passes either way has not tested anything.

## Definition of done

```
npm run lint
npm run test
npm run build
```

## Constraints

- **No new dependencies without asking first.** Write the debounce with `useEffect` + `setTimeout`, or a small local hook — do not add `lodash.debounce` or `use-debounce`.
- **No reformatting of untouched lines.**
- **No refactors beyond the listed files.** Do not memoise the context value (that is spec 10), do not touch the balance query's boundedness (spec 07), do not restructure `FilterBar`'s markup.
- Do not change `src/services/transactionService.ts`.

## Report back

1. The implementation.
2. Your approach — specifically how you index the cursor stack, and how you handle the resync in Requirement 6's fourth bullet.
3. Anything skipped, blocked, or decided differently. **Specifically: confirm that the pagination test's assertion 3 genuinely fails against the original code, and say how you satisfied yourself of that without running it.** Also state whether you were able to remove the `exhaustive-deps` suppression.
