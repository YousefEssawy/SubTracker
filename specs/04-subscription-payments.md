# Spec 04 — Server-side subscription advancement and payment history (W4)

> **You cannot run shell commands in this environment.** Do not attempt `npm`, `git`, `firebase`, `tsc`, or any test runner — the attempt is auto-denied and aborts your run with no output. Write files only. The orchestrator runs all gates and reports results back to you.

## Context

**Resolves:** F3 (payment history is never written; the dashboard chart shows fabricated data), F17 (12-month trend buckets collide across years), F19 (`advanceRenewalDate` hangs the browser forever if `customCycleDays ≤ 0`), F23 (`SubscriptionsPage` bypasses its context and calls services directly), F40 (`subscribeToPayments` is unbounded), F44 (resuming a paused subscription silently discards the paused periods), and the `reminderDays` half of F7.

A **subscription** in SubTracker has a `renewalDate` and a `billingCycle`. When the renewal date passes, the app is supposed to roll it forward and record that a payment happened. Today it rolls the date forward and **records nothing** — `addPaymentRecord` exists in `src/services/historyService.ts` and has no callers anywhere. So the `payments` collection is always empty, the History page is always empty, and the dashboard's spending chart takes a fallback branch that paints twelve identical invented months.

Worse, the roll-forward runs **on the client**, inside an `onSnapshot` callback, guarded by a `useRef` `Set` that only lives for the current tab session. Consequences:
- Nothing is recorded for a user who does not open the app. A user away for three months has no history for those months.
- Three devices open at once all evaluate the same skipped periods and race.
- The guard resets on every reload.

**The project owner has decided:** move advancement into the scheduled Cloud Function beside the recurrence processor. The client becomes read-only for this data.

> **Two amendments from plan review.**
>
> **Payments stay a separate ledger.** A Payment is *not* a Transaction and must never be written into the `transactions` collection. A Subscription has no Space and no Finance Category, and `addTransaction` requires both — see `CONTEXT.md`, *Ledger* / *Payment*. Do not "unify" the two collections, do not add a `subscriptionId` field to transactions, and do not invent a default Space or Category.
>
> **Mirror the recurrence processor deliberately.** Requirement 16 below governs this.

## Scope

**Create:**
- `functions/subscriptionProcessor.js` — the new scheduled handler
- `functions/subscriptionProcessor.test.js`
- `shared/billingCycles.js` — shared cycle-advance logic
- `shared/billingCycles.test.js`

**Modify:**
- `functions/index.js` — export the new scheduled function
- `src/contexts/SubscriptionContext.tsx` — remove the client-side writer, add mutators
- `src/services/historyService.ts` — paginate
- `src/services/subscriptionService.ts` — only if a mutator signature requires it
- `src/pages/SubscriptionsPage.tsx` — use context mutators instead of direct service calls
- `src/pages/SubscriptionFormPage.tsx` — same
- `src/pages/HistoryPage.tsx` — subscribe lazily
- `src/pages/DashboardPage.tsx` — trend chart only
- `src/components/layout/Header.tsx` — read `reminderDays`
- `src/utils/dateUtils.ts` — clamp `customCycleDays`

**Must NOT be touched:**
- `functions/recurrenceProcessor.js`, `shared/recurrenceDates.js` — spec 02 owns these
- `firestore.rules`, `firestore.indexes.json` — specs 01 and 05
- `src/contexts/TransactionContext.tsx` — spec 06
- `src/utils/currencies.ts` — spec 03

**Out of scope:** the currency policy (spec 03 already landed — `convertCurrency` no longer exists, do not reintroduce it), the modal/dialog work (spec 12), `SubscriptionsPage`'s search and filter UI.

## Existing code

### `src/contexts/SubscriptionContext.tsx` — the client-side writer to remove
```tsx
const advanceRenewalDate = (sub: Subscription): string | null => {
  if (!sub.renewalDate) return null;
  let nextDate = typeof sub.renewalDate === "string" ? parseISO(sub.renewalDate) : sub.renewalDate;
  let advanced = false;
  while (isPastDue(nextDate)) {                       // ← infinite if the step is 0 days (F19)
    nextDate = getNextRenewalDate(nextDate, sub.billingCycle, sub.customCycleDays);
    advanced = true;
  }
  return advanced ? format(nextDate, "yyyy-MM-dd") : null;
};

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const renewalCheckedRef = useRef(new Set<string>());   // ← per-session only

  useEffect(() => {
    if (!user) { setSubscriptions([]); setPayments([]); setLoading(false); renewalCheckedRef.current.clear(); return; }
    setLoading(true);
    const unsubSubs = subscribeToSubscriptions(user.uid, (subs) => {
      setSubscriptions(subs);
      setLoading(false);
      subs.forEach((sub) => {
        if (sub.status === "active" && !renewalCheckedRef.current.has(sub.id)) {
          renewalCheckedRef.current.add(sub.id);
          const newDate = advanceRenewalDate(sub);
          if (newDate) {
            updateSubscription(user.uid, sub.id, { renewalDate: newDate }).catch((err) => {
              console.error(err);
              toast.error("Failed to advance renewal date.");
            });
          }
        }
      });
    }, (err) => { console.error(err); toast.error("Failed to sync subscriptions."); setLoading(false); });

    const unsubPayments = subscribeToPayments(user.uid, (pays) => { setPayments(pays); },
      (err) => { console.error(err); toast.error("Failed to sync payment history."); });

    return () => { unsubSubs(); unsubPayments(); renewalCheckedRef.current.clear(); };
  }, [user]);

  const activeSubscriptions = useMemo(() => subscriptions.filter((s) => s.status === "active"), [subscriptions]);
  const pausedSubscriptions = useMemo(() => subscriptions.filter((s) => s.status === "paused"), [subscriptions]);
  const cancelledSubscriptions = useMemo(() => subscriptions.filter((s) => s.status === "cancelled"), [subscriptions]);

  const value: SubscriptionContextValue = {
    subscriptions, payments, loading,
    activeSubscriptions, pausedSubscriptions, cancelledSubscriptions,
  };
  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
};
```
Note `SubscriptionContextValue` exposes **no mutators** — that is F23's cause.

### `src/utils/dateUtils.ts:33-53` — the cycle step, and the `0` hole
```ts
export const getNextRenewalDate = (
  currentDate: Date | DateString,
  billingCycle: BillingCycle,
  customDays: number | null = null,
): Date => {
  const date = typeof currentDate === "string" ? parseISO(currentDate) : currentDate;
  switch (billingCycle) {
    case "weekly":  return addWeeks(date, 1);
    case "monthly": return addMonths(date, 1);
    case "yearly":  return addYears(date, 1);
    case "custom":  return addDays(date, customDays ?? 30);   // ← `0` is not nullish; passes through
    default:        return addMonths(date, 1);
  }
};
```
`BillingCycle` is `"monthly" | "yearly" | "weekly" | "custom"`.

### `src/services/historyService.ts` — complete
```ts
const getPaymentsCollection = (userId: string) => collection(db, "users", userId, "payments");

export const addPaymentRecord = async (
  userId: string,
  paymentData: Omit<Payment, "id" | "createdAt">,
): Promise<Payment> => {
  const paymentsRef = getPaymentsCollection(userId);
  const now = new Date().toISOString();
  const docRef = await addDoc(paymentsRef, { ...paymentData, createdAt: now });
  return toPayment(docRef.id, { ...paymentData, createdAt: now });
};

export const subscribeToPayments = (
  userId: string,
  callback: (payments: Payment[]) => void,
  onError?: (error: Error) => void,
): (() => void) => {
  const paymentsRef = getPaymentsCollection(userId);
  const q = query(paymentsRef, orderBy("paidDate", "desc"));   // ← no limit()
  return onSnapshot(q, (snapshot) => {
    const payments = snapshot.docs.map((d) => toPayment(d.id, d.data()));
    callback(payments);
  }, onError);
};
```

### `src/models/payment.ts` shape (via `toPayment` in `mappers.ts`)
```ts
{
  id: string;
  subscriptionId: string;
  subscriptionName: string;
  amount: number;
  currency: CurrencyCode;
  paidDate: DateString;          // "YYYY-MM-DD"
  paymentMethod: string | null;
  createdAt: ISOString;
}
```

### `src/pages/DashboardPage.tsx:184-211` — the fabrication and the bucket collision
```tsx
const trendData = useMemo(() => {
  const months: { month: string; spending: number }[] = [];
  const now = new Date();
  const lang = i18n.language || "en";
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ month: d.toLocaleDateString(lang, { month: "short" }), spending: 0 });
  }
  payments.forEach((p) => {
    const label = new Date(p.paidDate).toLocaleDateString(lang, { month: "short" });
    const item = months.find((m) => m.month === label);      // ← "Jan" matches any year (F17)
    if (item) item.spending += /* per spec 03, no conversion */ p.amount;
  });
  if (payments.length === 0 && activeSubscriptions.length > 0) {
    months.forEach((m) => (m.spending = Math.round(totalMonthly)));   // ← fabricated (F3)
  }
  return months;
}, [payments, activeSubscriptions, totalMonthly, i18n.language]);
```

### `src/pages/SubscriptionsPage.tsx` — the layering violation
```tsx
import { deleteSubscription, updateSubscription } from "@/services/subscriptionService";
...
const handleDelete = async () => {
  if (deleteTarget && user) {
    try { await deleteSubscription(user.uid, deleteTarget); }
    catch (err) { console.error(err); toast.error(t("subscriptions.deleteError", "Failed to delete subscription.")); }
    setDeleteTarget(null);
  }
};

const handleToggleStatus = async (sub: Subscription) => {
  if (!user) return;
  const newStatus: SubscriptionStatus = sub.status === "active" ? "paused" : "active";
  try { await updateSubscription(user.uid, sub.id, { status: newStatus }); }
  catch (err) { console.error(err); toast.error(t("subscriptions.toggleError", "Failed to update subscription.")); }
};
```
Resuming (`"paused"` → `"active"`) does **not** touch `renewalDate` — that is F44.

### The mutator pattern every other context follows (`src/contexts/SpaceContext.tsx`)
```tsx
const addSpace = useCallback(async (data: SpaceInput) => {
  if (!user) throw new Error("Not authenticated");
  await addSpaceSvc(user.uid, data);
}, [user]);
```

### `src/components/layout/Header.tsx:51-53` — the hardcoded threshold
```tsx
const upcomingRenewals = activeSubscriptions.filter((s) =>
  isRenewingSoon(s.renewalDate, 7),
);
```

### The scheduled-function pattern to copy (`functions/recurrenceProcessor.js`, post-spec-02)
It uses `onSchedule("every day 00:00", ...)`, a `db.collectionGroup(...)` query, a `db.runTransaction` per document with a re-read guard, `FieldValue.serverTimestamp()` for timestamps, and `console.log`/`console.error` with ids interpolated.

## Requirements

1. **Create `shared/billingCycles.js`** exporting `advanceBillingDate(dateStr, billingCycle, customCycleDays)` — UTC, string-in/string-out `"YYYY-MM-DD"`, mirroring `shared/recurrenceDates.js` from spec 02 (reuse its `addMonthsClamped` by importing it; do not copy it).
   - `"weekly"` → +7 days · `"monthly"` → +1 clamped month · `"yearly"` → +12 clamped months
   - `"custom"` → `+customCycleDays` days, where **`customCycleDays` is clamped to a minimum of 1**; `null`, `undefined`, `0`, negatives, and non-integers all fall back to `30` (F19)
   - an unrecognised cycle throws
   - zero dependencies

2. **`getNextRenewalDate` in `src/utils/dateUtils.ts` delegates to `advanceBillingDate`** and therefore inherits the clamp. Its public signature (`Date | DateString`, returns `Date`) does not change — callers must not break.

3. **Create `functions/subscriptionProcessor.js`** exporting a scheduled handler, and export it from `functions/index.js` as `dailySubscriptionProcessor`. It runs `"every day 00:00"`, the same as the recurrence processor.

4. **The processor advances every past-due active subscription and records a payment per elapsed period.** For each subscription where `status === "active"` and `renewalDate <= today` (UTC `YYYY-MM-DD`), inside a single `db.runTransaction`:
   - re-read the document and re-check `status` and `renewalDate` before writing (mirrors `recurrenceProcessor.js`)
   - loop while `renewalDate <= today`: write one `payments` document for that occurrence, then advance `renewalDate` via `advanceBillingDate`
   - hard cap **500** iterations per subscription per run; on hitting it, stop, leave `renewalDate` at the last computed value, and `console.warn` with the user id and subscription id
   - write the advanced `renewalDate` back once, at the end
   - use `db.collectionGroup("subscriptions")` and derive the user id from `docRef.parent.parent.id`; if that is null, `console.error` and skip

5. **Each payment document is written with a deterministic id so the write is idempotent.** The document id is `` `${subscriptionId}_${paidDate}` `` (e.g. `abc123_2026-03-01`). Use `tx.set(ref, data)` at that id — a re-run overwrites rather than duplicating. Fields:
   ```js
   { subscriptionId, subscriptionName, amount, currency, paidDate, paymentMethod,
     createdAt: FieldValue.serverTimestamp() }
   ```
   `subscriptionName`, `amount`, `currency`, and `paymentMethod` come from the subscription document; `paymentMethod` defaults to `null`.
   **State in your report** whether this key can collide for a legitimate second charge on the same date, and what happens if so.

6. **The client no longer advances renewal dates.** Delete `advanceRenewalDate`, `renewalCheckedRef`, and the `subs.forEach(...)` block from `SubscriptionContext.tsx`, along with the now-unused imports (`updateSubscription` for that purpose, `getNextRenewalDate`, `isPastDue`, `format`, `parseISO` — check each before removing).

7. **`SubscriptionContext` gains mutators (F23):** `addSubscription(data)`, `updateSubscription(id, data)`, `deleteSubscription(id)`, each wrapped in `useCallback` with the `if (!user) throw new Error("Not authenticated")` guard the other four contexts use. Add them to `SubscriptionContextValue`.

8. **`SubscriptionsPage` and `SubscriptionFormPage` stop importing from `@/services/subscriptionService`** and call the context mutators instead. They no longer reference `user.uid` for these operations. `getSubscription` (a read used by the form page) may stay a direct service import if adding it to the context is awkward — say which you chose and why.

9. **Resuming a paused subscription re-anchors `renewalDate` (F44).** When `handleToggleStatus` flips `"paused"` → `"active"`, if the stored `renewalDate` is in the past, advance it forward past today using `getNextRenewalDate` before writing, and write both fields in one update. Pausing (`"active"` → `"paused"`) does not touch the date.
   **Consequence to implement deliberately:** periods elapsed while paused are *skipped*, not billed. Add a short comment saying so.

10. **`subscribeToPayments` is paginated (F40).** Add a `pageSize` parameter (default 50) applied via `limit()`. Follow the existing paged pattern in `src/services/transactionService.ts:161-192`.

11. **Payments are subscribed lazily, not in the provider.** `SubscriptionContext` stops subscribing to payments on mount. `HistoryPage` subscribes when it mounts and unsubscribes when it unmounts. `DashboardPage` needs payments for the trend chart — it may subscribe too; whichever way you wire it, an authenticated user sitting on `/settings` must not hold an open payments listener. `SubscriptionContextValue` keeps a `payments` field only if it is genuinely still used; if not, remove it and update consumers.

12. **The trend chart stops fabricating data (F3).** Delete the `if (payments.length === 0 && activeSubscriptions.length > 0)` branch entirely. When there are no payments, render an empty-state message instead of a chart of zeros — a chart of twelve zero bars is not an acceptable substitute. Add the string via `t()` with an English default and add the key to both locale files.

13. **Trend buckets are keyed by `yyyy-MM`, not by month name (F17).** Build the twelve buckets with a `yyyy-MM` key plus a separate localized `label` for display; match payments on the key. `p.paidDate` is already `"YYYY-MM-DD"`, so its first seven characters are the key — do not round-trip through `new Date()`.

14. **`Header` reads `reminderDays` instead of the hardcoded `7`.** Use the `useUserSettings` hook created in spec 03. If settings are still loading, fall back to `3` (the app-wide default used at `authService.ts:60` and `SettingsPage`).

15. **No user-visible string without a translation key**, added to both `src/locales/en/translation.json` and `src/locales/ar/translation.json` in the same change.

16. **`subscriptionProcessor.js` mirrors `recurrenceProcessor.js` structurally, on purpose.** The two share a mechanism: a collection-group query, deriving the user id from `docRef.parent.parent.id`, a `runTransaction` with a re-read guard, a bounded 500-iteration backlog loop, and a per-document `try/catch` with interpolated logging. Keep the same order of operations, the same variable names for the shared concepts, and the same log-message shape, so the two files diff cleanly against each other. **Do not extract a shared runner in this spec** — spec 10 extracts it from two working implementations rather than from one plus a guess. Add a comment at the top of the new file naming `recurrenceProcessor.js` as the structure it deliberately mirrors, and saying the shared runner is spec 10's work.

## Conventions to follow

- **Cloud Function structure** — top-level `initializeApp()` and `const db = getFirestore()`, handler wrapped in `onSchedule`, per-document `try/catch` so one bad document does not abort the run:
  ```js
  try {
    await db.runTransaction(async (tx) => { /* ... */ });
    console.log(`Processed subscription ${id} for user ${userId}.`);
  } catch (err) {
    console.error(`Error processing subscription ${id} for user ${userId}:`, err);
  }
  ```
- **Firestore transactions read before they write** — all `tx.get` calls precede all `tx.set`/`tx.update`.
- **Server timestamps in functions** use `FieldValue.serverTimestamp()`; the client services currently use ISO strings. Do **not** change client timestamp handling here — that is spec 05.
- **Context mutators** follow the `useCallback` + auth-guard pattern quoted above.
- **Toast errors in contexts** currently use hardcoded English (`toast.error("Failed to sync subscriptions.")`). Leave existing ones alone — spec 11 translates them. Any *new* toast you add must use `t()`.

## Tests required

**`shared/billingCycles.test.js`**
- each cycle advances correctly, including month-end clamping (`2026-01-31` monthly → `2026-02-28`)
- `customCycleDays` of `0`, `-5`, `null`, `undefined`, and `2.5` all fall back to `30` — the direct F19 regression test
- `customCycleDays: 1` advances by exactly one day
- unknown cycle throws

**`functions/subscriptionProcessor.test.js`** — against a fake/stub Firestore, no emulator:
- a subscription 3 months past due produces exactly 3 payment documents and one final `renewalDate` write
- payment document ids are `${subscriptionId}_${paidDate}` and a second run over the same data produces no additional documents (idempotency)
- a `cancelled` or `paused` subscription is not advanced
- the 500-iteration cap stops runaway generation and logs a warning
- a subscription whose `renewalDate` is in the future is untouched

**Trend bucketing** — a test that payments from January 2025 and January 2026 land in **different** buckets (the F17 regression test). Put it in `src/pages/__tests__/` or extract the bucketing into a small exported helper and test that; extracting is preferred and permitted.

## Definition of done

```
npm run lint
npm run test
npm run build
```
plus `npm run test` in `functions/`.

## Constraints

- **No new dependencies without asking first.**
- **No reformatting of untouched lines.**
- **No refactors beyond the listed files.**
- **Do not reintroduce `convertCurrency` or any cross-currency arithmetic** — spec 03 deleted it deliberately. Payments and trend data are per-currency; the chart shows one currency at a time via the `chartCurrency` state spec 03 added.
- Do not modify `functions/recurrenceProcessor.js`. If you need shared helpers from it, import them from `shared/`.
- Do not run any migration or backfill.

## Decision record

This spec implements a decision that must outlive it. When this spec is accepted, the orchestrator commits `docs/adr/0002-server-side-payment-writer.md` alongside the change — do not write it yourself.

## Report back

1. The implementation.
2. Your approach — especially the transaction structure for the backlog loop and how you kept all reads before all writes.
3. Anything skipped, blocked, or decided differently. **Specifically: (a) your answer to the idempotency-key question in Requirement 5, (b) whether you moved `getSubscription` into the context or left it a direct import and why, and (c) where you wired the payments subscription for the dashboard.**
