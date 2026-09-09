# Spec 00 — Disambiguate Subscription Category from Finance Category

> **You cannot run shell commands in this environment.** Do not attempt `npm`, `git`, `firebase`, `tsc`, or any test runner — the attempt is auto-denied and aborts your run with no output. Write files only. The orchestrator runs all gates and reports results back to you.

## Context

**Resolves:** a domain-model ambiguity recorded in `CONTEXT.md`. Not one of the 45 review findings — this spec exists so the eleven specs that follow are written against unambiguous names.

The word **Category** means two unrelated things in this codebase:

| | Subscription Category | Finance Category |
|---|---|---|
| What it is | A fixed, built-in set of vendor kinds — streaming, software, gaming… | A user-created grouping for Transactions, typed Income or Expense |
| Where it lives | A hardcoded array in `src/utils/categories.ts` | One Firestore document per category, under `users/{uid}/categories` |
| Type | `CategoryId` — a ten-value string union | `Category` — an interface with `id`, `name`, `type`, `icon`, `color` |
| Lookup | `getCategoryById` from `@/utils/categories` | `getCategoryById` from `useCategories()` |

Both lookups are called `getCategoryById`. `DashboardPage` uses the first; `TransactionDetailPage` uses the second. Any future code reaching for "the category of this thing" has an even chance of importing the wrong one, and the two are not type-compatible, so the mistake surfaces as a confusing compile error at best.

This is a **pure rename**. No behaviour changes, no Firestore documents change, no user-visible text changes.

### What is explicitly NOT renamed

The Firestore **field** `subscription.category` keeps its name. Renaming a persisted field would require a data migration, a dual-read window in the mapper, and a rules update — for a cosmetic gain. Once its *type* is called `SubscriptionCategoryId`, `subscription.category` reads unambiguously on its own.

## Scope

**Modify:**
- `src/models/common.ts`
- `src/utils/categories.ts`
- `src/models/subscription.ts`
- `src/models/mappers.ts`
- `src/models/index.ts` (only if it re-exports a renamed symbol)
- `src/pages/DashboardPage.tsx`
- `src/pages/SubscriptionsPage.tsx`
- `src/pages/SubscriptionFormPage.tsx`
- Any other file the compiler flags — see Requirement 6

**Must NOT be touched:**
- `src/models/category.ts` — the Finance Category model is already correctly named
- `src/contexts/CategoryContext.tsx` — its `getCategoryById` is the Finance Category one and keeps its name
- `src/services/categoryService.ts`
- `src/pages/CategoriesPage.tsx`, `src/components/finance/CategoryForm.tsx`
- `src/locales/en/translation.json`, `src/locales/ar/translation.json` — no user-visible string changes
- `firestore.rules`, `firestore.indexes.json`, anything under `functions/` or `shared/`

**Out of scope:** renaming the `subscription.category` Firestore field, merging the two concepts, changing the ten built-in categories, any behaviour change whatsoever.

## Existing code

### `src/models/common.ts:15-29` — the type to rename
```ts
/**
 * ID of a subscription category.
 * Maps to the `id` field of entries in CATEGORIES constant.
 */
export type CategoryId =
  | "streaming"
  | "software"
  | "gaming"
  | "cloud"
  | "ai"
  | "news"
  | "health"
  | "education"
  | "utilities"
  | "other";
```

### `src/utils/categories.ts` — complete
```ts
import type { CategoryId } from "@/models/common";

/** A subscription category constant entry */
export interface SubscriptionCategory {
  id: CategoryId;
  name: string;
  icon: string;
  color: string;
}

export const CATEGORIES: readonly SubscriptionCategory[] = [
  { id: "streaming", name: "Streaming", icon: "🎬", color: "#EF4444" },
  { id: "software", name: "Software", icon: "💻", color: "#6366F1" },
  { id: "gaming", name: "Gaming", icon: "🎮", color: "#8B5CF6" },
  { id: "cloud", name: "Cloud & Storage", icon: "☁️", color: "#06B6D4" },
  { id: "ai", name: "AI Subscription", icon: "🤖", color: "#10B981" },
  { id: "news", name: "News & Media", icon: "📰", color: "#F59E0B" },
  { id: "health", name: "Health & Fitness", icon: "💪", color: "#EC4899" },
  { id: "education", name: "Education", icon: "📚", color: "#14B8A6" },
  { id: "utilities", name: "Utilities", icon: "⚡", color: "#F97316" },
  { id: "other", name: "Other", icon: "📦", color: "#64748B" },
] as const;

/**
 * Returns the category matching the given id.
 * Always returns a value — falls back to "other" if not found.
 */
export const getCategoryById = (id: string): SubscriptionCategory =>
  CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1];
```
Note `SubscriptionCategory` (the interface) is **already** correctly named — only `CategoryId`, `CATEGORIES`, and `getCategoryById` are ambiguous.

### `src/models/subscription.ts:1,23` — the consumer
```ts
import type { CurrencyCode, CategoryId, ISOString, DateString } from "./common";
...
  category: CategoryId;
```
The field name `category` stays; only its type annotation changes.

### `src/models/mappers.ts:35-49,109` — the coercion helper
```ts
const asCategoryId = (v: unknown): CategoryId => {
  const allowed: CategoryId[] = [
    "streaming", "software", "gaming", "cloud", "ai",
    "news", "health", "education", "utilities", "other",
  ];
  return allowed.includes(v as CategoryId) ? (v as CategoryId) : "other";
};
...
    category: asCategoryId(data["category"]),
```

### The colliding call sites

`src/pages/DashboardPage.tsx:9,170,172` — the **Subscription** Category:
```tsx
import { getCategoryById } from "@/utils/categories";
...
const cat = getCategoryById(sub.category);
```
```tsx
<RenewalDial
  icon={getCategoryById(stats.nextRenewal.category).icon}
  iconColor={getCategoryById(stats.nextRenewal.category).color}
```

`src/pages/TransactionDetailPage.tsx:19,44` — the **Finance** Category, from the context. **Do not touch this file.**
```tsx
const { getCategoryById } = useCategories();
...
const category = getCategoryById(transaction.categoryId);
```

`src/pages/SubscriptionsPage.tsx:11,246-249` — the Subscription Category:
```tsx
import { getCategoryById, CATEGORIES } from "@/utils/categories";
...
const usedCategories = useMemo(() => {
  const ids = new Set(subscriptions.map((s) => s.category));
  return CATEGORIES.filter((c) => ids.has(c.id));
}, [subscriptions]);
```

`src/pages/SubscriptionFormPage.tsx:198-202` — the Subscription Category:
```tsx
{CATEGORIES.map((c) => (
  <option key={c.id} value={c.id}>
    {c.icon} {c.name}
  </option>
))}
```

### `src/contexts/CategoryContext.tsx:95-98` — the Finance Category lookup, which **keeps its name**
```tsx
const getCategoryById = useCallback(
  (id: string): Category | undefined => categories.find((c) => c.id === id),
  [categories],
);
```

## Requirements

1. **`CategoryId` → `SubscriptionCategoryId`** in `src/models/common.ts`. Update its doc comment to say it maps to `SUBSCRIPTION_CATEGORIES`, and add one sentence distinguishing it from the Finance Category in `src/models/category.ts`.

2. **`CATEGORIES` → `SUBSCRIPTION_CATEGORIES`** in `src/utils/categories.ts`. The array contents are byte-identical — same ten entries, same order, same ids, names, icons, and colours.

3. **`getCategoryById` → `getSubscriptionCategoryById`** in `src/utils/categories.ts`. Its behaviour is unchanged, including the fallback to the last entry (`other`) for an unknown id.

4. **`asCategoryId` → `asSubscriptionCategoryId`** in `src/models/mappers.ts`, with its internal `allowed` array typed by the renamed type. Behaviour unchanged, including the `"other"` fallback.

5. **`SubscriptionCategory` (the interface) keeps its name.** It is already unambiguous. Do not rename it, and do not rename the `subscription.category` **field**.

6. **Every call site is updated.** Deleting the old names makes the typecheck fail at each one, which is the mechanism for finding them — work through the compiler's list rather than a text search. Files known to be affected: `src/models/subscription.ts`, `src/models/mappers.ts`, `src/pages/DashboardPage.tsx`, `src/pages/SubscriptionsPage.tsx`, `src/pages/SubscriptionFormPage.tsx`. There may be others; `src/models/index.ts` re-exports model symbols and may need updating.

7. **No compatibility aliases.** Do not leave `export type CategoryId = SubscriptionCategoryId` or an aliased `getCategoryById` behind. A half-completed rename is worse than none — the ambiguity survives and now has two spellings.

8. **`CategoryContext.getCategoryById` is untouched.** It is the Finance Category lookup and its name is correct. After this spec the two lookups have distinct names and there is no collision.

9. **No behaviour changes at all.** No string the user sees changes, no Firestore read or write changes shape, no default or fallback changes. A reviewer diffing this change should see only identifier renames and import updates.

10. **No test changes beyond renames.** If an existing test references a renamed symbol, update the reference. Do not add or restructure tests — Requirement 11 explains why.

## Conventions to follow

- **Type-only imports use `import type`:**
  ```ts
  import type { CurrencyCode, SubscriptionCategoryId, ISOString, DateString } from "./common";
  ```
- **Constants are `SCREAMING_SNAKE_CASE`**, declared `readonly` with `as const`:
  ```ts
  export const SUBSCRIPTION_CATEGORIES: readonly SubscriptionCategory[] = [ /* ... */ ] as const;
  ```
- **Mapper helpers are named `asX`**, take `unknown`, and return the domain type with a safe fallback — see `asCurrencyCode`, `asBillingCycle` in the same file.
- **Path alias `@/` maps to `src/`.** Keep imports in the existing form (`@/utils/categories`, `@/models/common`).
- **Doc comments use `/** … */` on exported types and constants**, one or two lines, saying what the thing *is*.

## Tests required

**None.** This is a rename verified in full by the TypeScript compiler: every reference to a deleted symbol is a compile error, so `npm run lint` (which runs `tsc --noEmit`) proves completeness more thoroughly than any test could. Adding tests here would be tests written to pass.

Every existing test must continue to pass unchanged, apart from identifier renames if any test references the old names.

## Definition of done

```
npm run lint      # eslint . && tsc --project tsconfig.app.json --noEmit
npm run test
npm run build
```

`npm run lint` is the real gate. If it passes, the rename is complete by construction.

## Constraints

- **No new dependencies.**
- **No reformatting of untouched lines.** The diff should be renames and import updates, nothing else.
- **No refactors beyond the listed files.** Do not reorganise `src/utils/categories.ts`, do not move the constants into a model file, do not extract anything.
- **No behaviour changes**, including no changes to the fallback semantics in Requirement 3 or 4.
- **Do not rename the `subscription.category` Firestore field**, and do not touch any Finance Category file.

## Report back

1. The implementation.
2. Your approach — in particular, the complete list of files the compiler flagged.
3. Anything skipped, blocked, or decided differently. **Specifically: (a) confirm no compatibility alias was left behind, (b) confirm `CategoryContext.getCategoryById` is untouched, and (c) name any file you had to change that is not listed in Scope.**
