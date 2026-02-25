# Quickstart: Strong-Typed Domain Models Migration

**Feature**: `001-strong-type-models` | **Branch**: `001-strong-type-models`

This guide explains how to run, verify, and extend the TypeScript migration.

---

## Prerequisites

Install new dev dependencies (TypeScript + React types):

```bash
npm install -D typescript @types/react @types/react-dom
```

> All other project dependencies (`firebase`, `framer-motion`, `recharts`, `date-fns`, `react-router-dom`, `react-icons`, `react-i18next`, `i18next`) already ship their own TypeScript types — no additional `@types/*` packages are needed.

---

## Project Config Files Added

### `tsconfig.json` (root — references only)

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

### `tsconfig.app.json` (source files)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "allowJs": true,
    "checkJs": false,
    "noEmit": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "allowImportingTsExtensions": true,
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["src"]
}
```

### `tsconfig.node.json` (vite.config.js and other Node scripts)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.js"]
}
```

---

## Type-Check the Migration

Run the TypeScript compiler in check-only mode (no output emitted):

```bash
npx tsc --project tsconfig.app.json --noEmit
```

Or add it as an npm script in `package.json`:

```json
"typecheck": "tsc --project tsconfig.app.json --noEmit"
```

Then run:

```bash
npm run typecheck
```

**Expected result after full migration**: zero errors, zero warnings.

---

## Dev Server (unchanged)

The dev server works exactly as before — Vite handles transpilation; TypeScript only type-checks:

```bash
npm run dev
```

---

## New Source Layout after Migration

```
src/
├── models/               ← NEW: all TypeScript type definitions
│   ├── index.ts          ← re-exports all models
│   ├── common.ts         ← CurrencyCode, CategoryId, ISOString, DateString
│   ├── subscription.ts   ← Subscription, SubscriptionInput, SubscriptionUpdate
│   ├── transaction.ts    ← Transaction, TransactionInput, AttachmentMeta
│   ├── space.ts          ← Space, SpaceInput
│   ├── category.ts       ← Category, CategoryInput, FinanceCategoryType
│   ├── recurrence.ts     ← Recurrence, RecurrenceInput, RecurrencePattern
│   ├── payment.ts        ← Payment
│   ├── balance.ts        ← CurrencyBalance, BalanceMap
│   └── mappers.ts        ← toSubscription(), toTransaction(), toSpace(), etc.
│
├── utils/                ← Renamed .js → .ts (8 files)
│   ├── categories.ts     ← typed SubscriptionCategory[], getCategoryById()
│   ├── currencies.ts     ← typed CurrencyDefinition[], EXCHANGE_RATES
│   ├── dateUtils.ts      ← typed date helpers
│   ├── balanceUtils.ts   ← typed computeBalances(), filterTransactions()
│   ├── validationUtils.ts ← discriminated union validators
│   └── spaceDefaults.ts  ← typed defaults
│
├── services/             ← Renamed .js → .ts (7 files)
│   ├── subscriptionService.ts
│   ├── transactionService.ts
│   ├── categoryService.ts
│   ├── spaceService.ts
│   ├── recurrenceService.ts
│   ├── historyService.ts
│   └── storageService.ts
│
├── contexts/             ← Renamed .jsx → .tsx (6 files)
│   ├── AuthContext.tsx
│   ├── SubscriptionContext.tsx
│   ├── TransactionContext.tsx
│   ├── CategoryContext.tsx
│   ├── SpaceContext.tsx
│   └── RecurrenceContext.tsx
│
├── pages/                ← UNCHANGED (.jsx) — benefits from typed imports
└── components/           ← UNCHANGED (.jsx) — benefits from typed imports
```

---

## Adding a New Field to a Model

1. Open `src/models/<entity>.ts` and add the field with its type.
2. Run `npm run typecheck` — the compiler will list every call site that needs updating.
3. Fix each reported error (mapper function, service function, context provider, components).
4. Run `npm run typecheck` again — zero errors means you're done.

This workflow replaces manual text searches with compiler-driven discovery.

---

## Common Patterns

### Using a model type in a component (`.jsx` file)

```jsx
// No need to import — JSX files get type benefits via inference
import { formatCurrency } from "@/utils/currencies";

// Typed via inference from the context
const { subscriptions } = useSubscriptions();
subscriptions.forEach((sub) => {
  console.log(sub.price); // number — typed
  console.log(sub.status); // "active" | "paused" | "cancelled" — typed
});
```

### Creating a typed subscription object

```typescript
import type { SubscriptionInput } from "@/models";

const newSub: SubscriptionInput = {
  name: "Netflix",
  price: 15.99,
  currency: "USD",
  billingCycle: "monthly",
  customCycleDays: null,
  renewalDate: "2026-03-01",
  category: "streaming",
  status: "active",
  paymentMethod: null,
  notes: null,
};
```
