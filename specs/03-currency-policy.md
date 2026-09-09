# Spec 03 — Currency policy: never sum across currencies (W3)

> **You cannot run shell commands in this environment.** Do not attempt `npm`, `git`, `firebase`, `tsc`, or any test runner — the attempt is auto-denied and aborts your run with no output. Write files only. The orchestrator runs all gates and reports results back to you.

## Context

**Resolves:** F4b (the app contradicts its own documented rule and shows two different monthly totals on two pages), F4a (static exchange rates presented as exact figures), and the `preferredCurrency` half of F7 (a saved setting nothing reads).

SubTracker tracks money in six currencies. `src/utils/balanceUtils.ts` documents the rule in a comment — *"Currencies are NEVER summed together"* — and `SubscriptionsPage` obeys it, keying totals per currency. `DashboardPage` does the opposite: it converts everything into a hardcoded `"EGP"` through a static rate table and shows one merged number.

A user with USD and EGP subscriptions therefore sees one monthly total on `/dashboard` and a different, differently-shaped one on `/subscriptions`, with nothing explaining why.

> **Amended after plan review.** Spec 00 has already renamed the subscription-category symbols: `CATEGORIES` is now `SUBSCRIPTION_CATEGORIES` and `getCategoryById` (the subscription one) is now `getSubscriptionCategoryById`. Code quoted below predates that rename — use the new names.

**The decision has been made by the project owner: option (a) — never sum.** Cross-currency conversion is removed from the product. Do not implement any form of currency conversion, labelled or otherwise, and do not add an FX API.

Additionally, `SettingsPage` lets the user pick a `preferredCurrency`, saves it to Firestore, and shows a success state — but **no code reads it**. Under this spec it becomes the currency the dashboard's single-currency widgets default to.

### A design decision made for you

"Never sum" is unambiguous for the four stat tiles and the income/expense bars: they become per-currency. It is *not* obvious for the two charts — a pie chart and a 12-month bar chart cannot meaningfully render three currencies at once.

**The contract is:** stat tiles and bars render every currency present; the two charts render **one currency at a time**, selected by a currency switcher that defaults to the user's `preferredCurrency`. This is specified concretely in Requirements 6–8. Implement it as written; do not substitute your own approach.

## Scope

**Modify:**
- `src/utils/currencies.ts`
- `src/utils/balanceUtils.ts`
- `src/pages/DashboardPage.tsx`
- `src/pages/SubscriptionsPage.tsx`
- `src/pages/SettingsPage.tsx`

**Create:**
- `src/hooks/useUserSettings.ts`
- `src/hooks/__tests__/useUserSettings.test.ts`
- `src/utils/__tests__/currencies.test.ts`

**Must NOT be touched:**
- `src/services/userService.ts` — it already reads and writes settings correctly; only its *consumers* change
- `src/components/finance/BalanceCard.tsx` — its hardcoded `"en-US"` and duplicate symbol table are spec 11 and spec 10
- `src/contexts/TransactionContext.tsx` — spec 06
- Anything under `functions/` or `shared/`

**Out of scope:** the trend chart's month-bucket collision (spec 04 — it is invisible until payments exist), `reminderDays` (spec 04), removing `BalanceCard`'s symbol table (spec 10).

## Existing code

### `src/utils/currencies.ts` — complete
```ts
import i18n from "@/i18n";
import type { CurrencyCode } from "@/models/common";

export interface CurrencyDefinition {
  code: CurrencyCode;
  name: string;
  symbol: string;
}
export type ExchangeRateMap = Record<CurrencyCode, number>;

export const CURRENCIES: readonly CurrencyDefinition[] = [
  { code: "EGP", name: "Egyptian Pound", symbol: "E£" },
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "SAR", name: "Saudi Riyal", symbol: "﷼" },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ" },
] as const;

export const DEFAULT_CURRENCY: CurrencyCode = "EGP";

export const EXCHANGE_RATES: ExchangeRateMap = {
  USD: 1, EGP: 50.5, EUR: 0.92, GBP: 0.79, SAR: 3.75, AED: 3.67,
};

export const convertCurrency = (
  amount: number, fromCurrency: CurrencyCode, toCurrency: CurrencyCode,
): number => {
  if (fromCurrency === toCurrency) return amount;
  const amountInUSD = amount / EXCHANGE_RATES[fromCurrency];
  return amountInUSD * EXCHANGE_RATES[toCurrency];
};

export const formatCurrency = (
  amount: number, currencyCode: CurrencyCode = "EGP",
): string => {
  const locale = (i18n.language as string) || "en-US";
  return new Intl.NumberFormat(locale, { style: "currency", currency: currencyCode }).format(amount);
};
```

### `src/utils/balanceUtils.ts` — the contract and the shape it produces
```ts
/**
 * Computes per-currency balances from a flat array of transactions.
 * Currencies are NEVER summed together.
 *
 * @returns BalanceMap keyed by currency code — only currencies present in the input appear in the result.
 */
export const computeBalances = (transactions: Transaction[] = []): BalanceMap => { /* ... */ };
```
`BalanceMap` is `Partial<Record<CurrencyCode, CurrencyBalance>>`, and `CurrencyBalance` is `{ income: number; expense: number; balance: number }`.

### `src/pages/DashboardPage.tsx` — every place the violation lives
```tsx
const displayCurrency: CurrencyCode = "EGP";          // :119  hardcoded

const stats = useMemo(() => {
  const totalMonthly = activeSubscriptions.reduce((sum, sub) => {
    const monthly = getMonthlyEquivalent(sub.price, sub.billingCycle, sub.customCycleDays);
    return sum + convertCurrency(monthly, (sub.currency as CurrencyCode) || "EGP", displayCurrency);
  }, 0);                                              // :132-146  merges currencies
  const sorted = [...activeSubscriptions]
    .map((s) => ({ ...s, daysUntil: getDaysUntilRenewal(s.renewalDate) }))
    .filter((s) => s.daysUntil >= 0)
    .sort((a, b) => a.daysUntil - b.daysUntil);
  return { totalMonthly, totalYearly: totalMonthly * 12, activeCount: activeSubscriptions.length,
           nextRenewal: sorted[0] || null, upcoming: sorted.slice(0, 6) };
}, [activeSubscriptions]);

const income = balances[displayCurrency]?.income ?? 0;   // :162
const expense = balances[displayCurrency]?.expense ?? 0; // :163
const flowMax = Math.max(income, expense, 1);

const categoryData = useMemo(() => {                     // :167-182  merges currencies
  const map: Record<string, { value: number; color: string }> = {};
  activeSubscriptions.forEach((sub) => {
    const cat = getCategoryById(sub.category);
    const monthly = convertCurrency(
      getMonthlyEquivalent(sub.price, sub.billingCycle, sub.customCycleDays),
      (sub.currency as CurrencyCode) || "EGP", displayCurrency);
    if (!map[cat.name]) map[cat.name] = { value: 0, color: cat.color };
    map[cat.name]!.value += monthly;
  });
  return Object.entries(map).map(([name, d]) => ({ name, value: Math.round(d.value), color: d.color }))
    .sort((a, b) => b.value - a.value);
}, [activeSubscriptions]);

const trendData = useMemo(() => {                        // :184-211  merges currencies
  /* ... */
  payments.forEach((p) => {
    const label = new Date(p.paidDate).toLocaleDateString(lang, { month: "short" });
    const item = months.find((m) => m.month === label);
    if (item) item.spending += convertCurrency(p.amount, (p.currency as CurrencyCode) || "EGP", displayCurrency);
  });
  /* ... */
}, [payments, activeSubscriptions, totalMonthly, i18n.language]);
```
And in the render, four `StatCard`s plus the income/expense panel:
```tsx
<StatCard label={t("dashboard.monthlyBurnRate", "Monthly burn rate")}
  value={<CountUp value={stats.totalMonthly} currency={displayCurrency} />}
  delta={t("dashboard.perYearValue", { defaultValue: "{{value}} / year",
    value: formatCurrency(stats.totalYearly, displayCurrency) })}
  deltaTone="muted" />
<StatCard label={t("dashboard.monthlyIncome", "Income")}
  value={<CountUp value={income} currency={displayCurrency} />} ... />
<StatCard label={t("dashboard.monthlyExpense", "Expense")}
  value={<CountUp value={expense} currency={displayCurrency} />} ... />
```
```tsx
<span className="figure font-semibold text-gray-900 dark:text-white">
  {formatCurrency(income, displayCurrency)}
</span>
<div className="h-2.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
  <div className="h-full rounded-full bg-success transition-all duration-500"
       style={{ width: `${(income / flowMax) * 100}%` }} />
</div>
...
<span className={`figure font-bold ${income - expense >= 0 ? "text-success" : "text-danger"}`}>
  {income - expense >= 0 ? "+" : "-"}
  {formatCurrency(Math.abs(income - expense), displayCurrency)}
</span>
```
`CountUp` is a local component in the same file taking `{ value: number; currency: CurrencyCode; className?: string }`.

### `src/pages/SubscriptionsPage.tsx:230-243,287-289` — the page that already does it right
```tsx
const headline = useMemo(() => {
  const active = subscriptions.filter((s) => s.status === "active");
  const totals: Record<string, number> = {};
  active.forEach((s) => {
    const monthly = getMonthlyEquivalent(s.price, s.billingCycle, s.customCycleDays);
    const cur = (s.currency as CurrencyCode) || "EGP";
    totals[cur] = (totals[cur] || 0) + monthly;
  });
  return { count: active.length, totals };
}, [subscriptions]);

const totalsLabel = Object.entries(headline.totals)
  .map(([cur, v]) => `${formatCurrency(v, cur as CurrencyCode)}`)
  .join(" · ");
```
This is the pattern to copy.

### `src/pages/SettingsPage.tsx:29-60` — how settings are loaded today
```tsx
useEffect(() => {
  if (user) {
    (async () => {
      try {
        const data = await getUserSettings(user.uid);
        if (data) {
          setSettings({
            preferredCurrency: (data.preferredCurrency as CurrencyCode) || DEFAULT_CURRENCY,
            reminderDays: data.reminderDays ?? 3,
          });
        }
      } catch (err) {
        console.error(err);
        toast.error(t("settings.loadError", "Failed to load settings."));
      }
      setLoading(false);
    })();
  }
}, [user, t]);
```

### `src/services/userService.ts` — complete (do not modify)
```ts
export interface UserSettings {
  preferredCurrency: CurrencyCode;
  reminderDays: number;
}
const getUserRef = (userId: string) => doc(db, "users", userId);

export const getUserSettings = async (userId: string): Promise<Partial<UserSettings> | null> => {
  const snap = await getDoc(getUserRef(userId));
  if (!snap.exists()) return null;
  return snap.data() as Partial<UserSettings>;
};

export const saveUserSettings = async (userId: string, settings: UserSettings): Promise<void> => {
  await setDoc(getUserRef(userId), settings, { merge: true });
};
```

### Context provider pattern to match (`src/contexts/SpaceContext.tsx`)
```tsx
export const useSpaces = (): SpaceContextValue => {
  const ctx = useContext(SpaceContext);
  if (!ctx) throw new Error("useSpaces must be used within SpaceProvider");
  return ctx;
};
```

## Requirements

1. **Delete `convertCurrency` and `EXCHANGE_RATES` from `src/utils/currencies.ts`**, along with the now-unused `ExchangeRateMap` type. After this change no file in the repo may reference any of the three. `CURRENCIES`, `DEFAULT_CURRENCY`, and `formatCurrency` stay.

2. **`src/utils/balanceUtils.ts`'s doc comment is upgraded from a comment to an enforced rule.** Keep the "NEVER summed" sentence and add one line naming this spec as the decision record. Do not change `computeBalances`' behaviour — it is already correct.

3. **Create `src/hooks/useUserSettings.ts`** exposing the user's settings to components. It must:
   - read `preferredCurrency` and `reminderDays` via `getUserSettings` from `@/services/userService`, keyed on the `user` from `useAuth()`
   - return `{ preferredCurrency: CurrencyCode; reminderDays: number; loading: boolean }`
   - default to `DEFAULT_CURRENCY` and `3` before load completes, on error, and when `user` is null
   - **clear `loading` in every path**, including when `user` is null — the existing `SettingsPage` effect has a bug where it does not, and you must not reproduce it
   - never throw to the render tree; log errors with `console.error` as the contexts do

4. **`DashboardPage` no longer declares `const displayCurrency: CurrencyCode = "EGP"`.** All single-currency widgets read `preferredCurrency` from `useUserSettings()`.

5. **`stats.totalMonthly` becomes per-currency.** Replace the `reduce` with the `SubscriptionsPage` pattern: a `Record<CurrencyCode, number>` of monthly equivalents keyed by the subscription's own currency, with no conversion. `totalYearly` becomes the same map with each value × 12.

6. **The "Monthly burn rate" `StatCard` renders every currency present.** Render each currency's monthly total, joined in the same visual style `SubscriptionsPage` uses (`formatCurrency(v, cur)` per entry). The `delta` line shows the corresponding per-currency yearly figures. When the map is empty, show `"—"`. `CountUp` animates a single number and cannot represent a map — use it only when exactly one currency is present; otherwise render the joined static list.

7. **Income, expense, and net render every currency present in `balances`.** `balances` is already a per-currency map — iterate its keys instead of indexing `balances[displayCurrency]`. Each currency gets its own income bar, expense bar, and net line, with `flowMax` computed **per currency** (`Math.max(income_c, expense_c, 1)`) so bar widths stay meaningful within a currency. The "Income" and "Expense" stat tiles likewise show every currency.

8. **The two charts get a currency switcher.**
   - Add local state `chartCurrency`, initialised to `preferredCurrency`.
   - Render a small control listing only the currencies actually present in the data (union of subscription currencies and `Object.keys(balances)`). If that union has fewer than two entries, render no switcher.
   - `categoryData` filters `activeSubscriptions` to `sub.currency === chartCurrency` and sums monthly equivalents **without conversion**.
   - `trendData` filters `payments` to `p.currency === chartCurrency` likewise.
   - Both chart headings state the currency being shown.

9. **Do not fix the trend chart's fabricated-data branch or its month-name bucketing.** Both are spec 04. Your change to `trendData` is limited to the currency filter — leave `if (payments.length === 0 && activeSubscriptions.length > 0)` exactly as it is, even though it is wrong. Touching it here would collide with spec 04.

10. **`SubscriptionsPage` keeps its current per-currency behaviour** and additionally drops any now-dangling import of `convertCurrency` if present. Its `headline`/`totalsLabel` logic is already correct — do not "improve" it.

11. **`SettingsPage` uses `useUserSettings` for its initial values** rather than its own `getUserSettings` effect, while continuing to own the editable form state and the save action. The save path (`saveUserSettings`) is unchanged. After a successful save the hook's value must reflect the new setting without a page reload — expose a refresh/mutate function from the hook and call it.

12. **Every money widget names the ledger it measures.** `balances` covers Transactions only — it excludes every Subscription the user tracks (see `CONTEXT.md`, *Balance*). Today the dashboard shows a "Net" figure beside a subscription-derived chart with nothing to distinguish them, so a reader reasonably assumes one accounts for the other. Label the income/expense/net group as measuring Transactions, and the burn-rate and category widgets as measuring Subscriptions. Wording is yours; the requirement is that no money figure on the dashboard is unattributed. Strings go through `t()` with keys in both locale files.

13. **No user-visible string is added without a translation key.** Any new label (the currency switcher, chart headings) uses `t("…", "English default")` with the same key-path convention as the surrounding code, and the key is added to **both** `src/locales/en/translation.json` and `src/locales/ar/translation.json` in the same change. Arabic values may be a reasonable translation; do not leave English text in the Arabic file.

## Conventions to follow

- **Translation calls always pass an English default as the second argument:**
  ```tsx
  {t("dashboard.monthlyBurnRate", "Monthly burn rate")}
  ```
  Interpolated variants pass an object:
  ```tsx
  {t("dashboard.perYearValue", { defaultValue: "{{value}} / year", value: formatCurrency(...) })}
  ```
- **Locale files are nested by feature** — top-level keys are `common`, `sidebar`, `header`, `dashboard`, `settings`, `subscriptions`, `finance`, etc. Put dashboard keys under `dashboard`.
- **Money is always rendered through `formatCurrency(amount, code)`** — never raw `toFixed`, never a hand-built symbol prefix.
- **Derived values are `useMemo`'d with explicit dependency arrays**, as `stats`, `categoryData`, and `trendData` already are.
- **Tailwind classes carry both light and dark variants** — e.g. `text-gray-900 dark:text-white`. Match the surrounding markup exactly.
- **`figure` is a project CSS class** used on numeric spans; keep it on numbers you render.

## Tests required

**`src/utils/__tests__/currencies.test.ts`**
- `formatCurrency` returns a string containing the expected symbol for each of the six codes
- a guard test asserting `EXCHANGE_RATES` and `convertCurrency` are **not** exported from the module (import the module namespace and assert the keys are absent) — this is the regression test that stops conversion being reintroduced

**`src/hooks/__tests__/useUserSettings.test.ts`**
- returns defaults (`DEFAULT_CURRENCY`, `3`) while loading
- returns the stored `preferredCurrency` after a successful fetch
- returns defaults and does not throw when `getUserSettings` rejects
- **`loading` becomes `false` when `user` is null** — the explicit regression test for Requirement 3
Mock `@/services/userService` and `@/contexts/AuthContext` with `vi.mock`.

Existing tests in `src/utils/balanceUtils.test.ts` must continue to pass unchanged.

## Definition of done

The orchestrator runs:
```
npm run lint      # eslint . && tsc --project tsconfig.app.json --noEmit
npm run test
npm run build
```
The typecheck is the main gate here: deleting `convertCurrency` will fail compilation at every remaining call site, which is the intended forcing function. All of them must be resolved.

## Constraints

- **No new dependencies without asking first.**
- **No reformatting of untouched lines.** `DashboardPage.tsx` is 564 lines; only the currency-related regions change.
- **No refactors beyond the listed files.** Do not extract `StatCard` or `CountUp` into new files, do not restructure the dashboard layout, do not touch the `RenewalDial` or upcoming-renewals rail.
- **Do not implement any currency conversion**, not even behind a flag or a comment saying it could be re-enabled.
- Do not touch `src/components/finance/BalanceCard.tsx`.

## Decision record

This spec implements a decision that must outlive it. When this spec is accepted, the orchestrator commits `docs/adr/0001-never-sum-currencies.md` alongside the change — do not write it yourself.

## Report back

1. The implementation.
2. Your approach — in particular how you laid out multi-currency stat tiles without the layout breaking at three or more currencies.
3. Anything skipped, blocked, or decided differently. **Specifically: list every file where deleting `convertCurrency` forced a change, and confirm none of them are outside this spec's Scope.** If the typecheck would fail somewhere the spec forbids you to touch, stop and report it rather than editing that file.
