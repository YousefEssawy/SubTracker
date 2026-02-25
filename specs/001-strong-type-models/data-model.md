# Data Model: Strong-Typed Domain Models

**Feature**: `001-strong-type-models`
**Date**: 2026-02-25

All types are defined here as the single source of truth. Implementation tasks will transcribe these into `src/models/*.ts` files.

---

## File Structure: `src/models/`

```
src/models/
├── index.ts            — re-exports everything from all model files
├── common.ts           — shared primitive aliases (CurrencyCode, CategoryId, ISOString)
├── subscription.ts     — Subscription, SubscriptionInput, SubscriptionUpdate, SubscriptionStatus, BillingCycle
├── transaction.ts      — Transaction, TransactionInput, TransactionUpdate, TransactionType, AttachmentMeta
├── space.ts            — Space, SpaceInput
├── category.ts         — Category, CategoryInput, FinanceCategoryType
├── recurrence.ts       — Recurrence, RecurrenceInput, RecurrenceStatus, RecurrencePattern
├── payment.ts          — Payment (HistoryEntry)
└── balance.ts          — CurrencyBalance, BalanceMap
```

---

## `common.ts` — Shared Primitives

```typescript
/** ISO 8601 date-time string, e.g. "2026-02-25T12:00:00.000Z" */
export type ISOString = string;

/** YYYY-MM-DD date string, e.g. "2026-02-25" */
export type DateString = string;

/** ISO 4217 currency code supported by the app */
export type CurrencyCode = "EGP" | "USD" | "EUR" | "GBP" | "SAR" | "AED";

/** ID of a subscription category */
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

---

## `subscription.ts`

```typescript
import type { CurrencyCode, CategoryId, ISOString, DateString } from "./common";

export type SubscriptionStatus = "active" | "paused" | "cancelled";

export type BillingCycle = "monthly" | "yearly" | "weekly" | "custom";

export interface Subscription {
  id: string;
  name: string;
  price: number;
  currency: CurrencyCode;
  billingCycle: BillingCycle;
  /** Required when billingCycle === "custom". Null otherwise. */
  customCycleDays: number | null;
  renewalDate: DateString;
  category: CategoryId;
  status: SubscriptionStatus;
  paymentMethod: string | null;
  notes: string | null;
  createdAt: ISOString;
  updatedAt: ISOString;
}

/** Payload accepted by addSubscription() — server fields excluded */
export type SubscriptionInput = Omit<
  Subscription,
  "id" | "createdAt" | "updatedAt"
>;

/** Payload accepted by updateSubscription() — all fields optional */
export type SubscriptionUpdate = Partial<SubscriptionInput>;
```

---

## `transaction.ts`

```typescript
import type { CurrencyCode, ISOString, DateString } from "./common";

export type TransactionType = "Income" | "Expense";

export interface AttachmentMeta {
  /** Original filename as uploaded */
  name: string;
  /** File size in bytes */
  size: number;
  /** MIME type, e.g. "image/jpeg" or "application/pdf" */
  type: string;
  /** Firebase Storage path — present after successful upload */
  storagePath?: string;
}

export interface Transaction {
  id: string;
  spaceId: string;
  categoryId: string;
  type: TransactionType;
  amount: number;
  currency: CurrencyCode;
  transactionDate: DateString;
  notes: string | null;
  tags: string[];
  attachmentUrl: string | null;
  attachmentMeta: AttachmentMeta | null;
  recurrenceId: string | null;
  createdAt: ISOString;
  updatedAt: ISOString;
}

/** Payload accepted by addTransaction() */
export type TransactionInput = Omit<
  Transaction,
  "id" | "createdAt" | "updatedAt"
>;

/** Payload accepted by updateTransaction() */
export type TransactionUpdate = Partial<TransactionInput>;
```

---

## `space.ts`

```typescript
import type { ISOString } from "./common";

export interface Space {
  id: string;
  name: string;
  icon: string;
  color: string;
  createdAt: ISOString;
}

export type SpaceInput = Omit<Space, "id" | "createdAt">;
```

---

## `category.ts`

```typescript
import type { ISOString } from "./common";

/** Type for finance categories (Income/Expense transactions) */
export type FinanceCategoryType = "Income" | "Expense";

export interface Category {
  id: string;
  name: string;
  type: FinanceCategoryType;
  icon: string;
  color: string;
  createdAt: ISOString;
}

export type CategoryInput = Omit<Category, "id" | "createdAt">;
```

---

## `recurrence.ts`

```typescript
import type { CurrencyCode, ISOString, DateString } from "./common";
import type { TransactionType } from "./transaction";

export type RecurrenceStatus = "active" | "paused";

export type RecurrencePattern = "daily" | "weekly" | "monthly" | "yearly";

export interface Recurrence {
  id: string;
  spaceId: string;
  categoryId: string;
  type: TransactionType;
  amount: number;
  currency: CurrencyCode;
  /** The base frequency unit */
  pattern: RecurrencePattern;
  /** Multiplier — e.g. interval=2 with pattern="weekly" means every 2 weeks */
  interval: number;
  startDate: DateString;
  endDate: DateString | null;
  nextDate: DateString;
  status: RecurrenceStatus;
  createdAt: ISOString;
}

export type RecurrenceInput = Omit<Recurrence, "id" | "createdAt" | "nextDate">;
```

---

## `payment.ts`

```typescript
import type { CurrencyCode, ISOString, DateString } from "./common";

/** A logged payment event from a subscription renewal */
export interface Payment {
  id: string;
  subscriptionId: string;
  subscriptionName: string;
  amount: number;
  currency: CurrencyCode;
  paidDate: DateString;
  paymentMethod: string | null;
  createdAt: ISOString;
}
```

---

## `balance.ts`

```typescript
import type { CurrencyCode } from "./common";

/** Per-currency financial summary */
export interface CurrencyBalance {
  income: number;
  expense: number;
  balance: number;
}

/** Map of currency code → balance summary. Keys are CurrencyCode values. */
export type BalanceMap = Record<CurrencyCode, CurrencyBalance>;
```

---

## Utility Constant Types (live in `utils/`, not `models/`)

These types belong alongside the constants that define them:

### In `utils/currencies.ts`

```typescript
export interface CurrencyDefinition {
  code: CurrencyCode;
  name: string;
  symbol: string;
}

export type ExchangeRateMap = Record<CurrencyCode, number>;
```

### In `utils/categories.ts`

```typescript
export interface SubscriptionCategory {
  id: CategoryId;
  name: string;
  icon: string;
  color: string;
}
```

---

## Mapper Function Signatures

Each service file will use these mapper functions (implemented in a `src/models/mappers.ts` or inline in services):

```typescript
import type { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";

export function toSubscription(id: string, data: DocumentData): Subscription;
export function toTransaction(id: string, data: DocumentData): Transaction;
export function toSpace(id: string, data: DocumentData): Space;
export function toCategory(id: string, data: DocumentData): Category;
export function toRecurrence(id: string, data: DocumentData): Recurrence;
export function toPayment(id: string, data: DocumentData): Payment;
```

Pattern for each:

```typescript
export function toSubscription(id: string, data: DocumentData): Subscription {
  return {
    id,
    name: data["name"] ?? "",
    price: typeof data["price"] === "number" ? data["price"] : 0,
    currency: data["currency"] ?? "EGP",
    billingCycle: data["billingCycle"] ?? "monthly",
    customCycleDays: data["customCycleDays"] ?? null,
    renewalDate: data["renewalDate"] ?? "",
    category: data["category"] ?? "other",
    status: data["status"] ?? "active",
    paymentMethod: data["paymentMethod"] ?? null,
    notes: data["notes"] ?? null,
    createdAt: data["createdAt"] ?? new Date().toISOString(),
    updatedAt: data["updatedAt"] ?? new Date().toISOString(),
  };
}
```

---

## State Transitions

| Entity       | Field                                                                            | Allowed Transitions                                             |
| ------------ | -------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Subscription | status                                                                           | `active` ↔ `paused`, `active → cancelled`, `paused → cancelled` |
| Recurrence   | status                                                                           | `active` ↔ `paused`                                             |
| Transaction  | (immutable after creation, only amount/notes/tags/attachment mutable via update) | —                                                               |

---

## Validation Rules (from FR-003 to FR-010)

| Model        | Field           | Constraint                                                        |
| ------------ | --------------- | ----------------------------------------------------------------- |
| Subscription | price           | `number > 0`, max `999_999_999.99`                                |
| Subscription | billingCycle    | member of `BillingCycle` union                                    |
| Subscription | customCycleDays | `number \| null` — must be `> 0` when `billingCycle === "custom"` |
| Transaction  | amount          | `number > 0`, max `999_999_999.99`                                |
| Transaction  | type            | `"Income" \| "Expense"` only                                      |
| Transaction  | tags            | `string[]`, max 10 items, each ≤ 30 chars                         |
| Transaction  | transactionDate | YYYY-MM-DD format                                                 |
| Recurrence   | interval        | `number ≥ 1`                                                      |
| Recurrence   | pattern         | member of `RecurrencePattern` union                               |
| All          | currency        | member of `CurrencyCode` union                                    |
