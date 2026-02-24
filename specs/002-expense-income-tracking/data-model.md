# Data Model: Expense & Income Tracking System

**Branch**: `002-expense-income-tracking`  
**Date**: 2026-02-24  
**Source**: [spec.md](./spec.md) | [research.md](./research.md)

---

## Firestore Collection Structure

```
users/{userId}/
├── spaces/{spaceId}
├── categories/{categoryId}
├── transactions/{transactionId}
└── recurrences/{recurrenceId}
```

---

## Entity: Space

**Collection**: `users/{userId}/spaces`

| Field       | Type   | Required | Description                                              |
| ----------- | ------ | -------- | -------------------------------------------------------- |
| `id`        | string | auto     | Firestore document ID (auto-generated)                   |
| `name`      | string | yes      | User-defined space name                                  |
| `color`     | string | yes      | Hex color code from predefined palette (e.g., `#6366F1`) |
| `icon`      | string | yes      | Emoji icon (e.g., `💼`, `🏠`, `💰`)                      |
| `createdAt` | string | yes      | ISO 8601 timestamp                                       |
| `updatedAt` | string | yes      | ISO 8601 timestamp                                       |

**Validation Rules**:

- `name`: Non-empty string, max 50 characters, trimmed
- `color`: Must be from the predefined palette (10–12 colors)
- `icon`: Must be a valid emoji from the predefined set

**Deletion Guard**: Cannot delete if any document in `transactions` or `recurrences` references this `spaceId`. Check via `where("spaceId", "==", spaceId).limit(1)`.

---

## Entity: Category

**Collection**: `users/{userId}/categories`

| Field       | Type   | Required | Description                                              |
| ----------- | ------ | -------- | -------------------------------------------------------- |
| `id`        | string | auto     | Firestore document ID (auto-generated)                   |
| `name`      | string | yes      | User-defined category name                               |
| `type`      | string | yes      | `"Income"` or `"Expense"` — **immutable after creation** |
| `createdAt` | string | yes      | ISO 8601 timestamp                                       |
| `updatedAt` | string | yes      | ISO 8601 timestamp                                       |

**Validation Rules**:

- `name`: Non-empty string, max 50 characters, trimmed
- `type`: Must be exactly `"Income"` or `"Expense"`. Cannot be changed after creation.

**Deletion Guard**: Cannot delete if any document in `transactions` or `recurrences` references this `categoryId`. Check via `where("categoryId", "==", categoryId).limit(1)`.

---

## Entity: Transaction

**Collection**: `users/{userId}/transactions`

| Field             | Type     | Required | Phase | Description                                             |
| ----------------- | -------- | -------- | ----- | ------------------------------------------------------- |
| `id`              | string   | auto     | 1     | Firestore document ID (auto-generated)                  |
| `spaceId`         | string   | yes      | 1     | Reference to space document ID                          |
| `categoryId`      | string   | yes      | 1     | Reference to category document ID                       |
| `type`            | string   | yes      | 1     | `"Income"` or `"Expense"`                               |
| `amount`          | number   | yes      | 1     | Positive number, max 999,999,999.99, 2 decimals         |
| `currency`        | string   | yes      | 1     | ISO 4217 code (e.g., `"EGP"`, `"USD"`)                  |
| `transactionDate` | string   | yes      | 1     | ISO 8601 date string (`"YYYY-MM-DD"`)                   |
| `notes`           | string   | no       | 2     | Free-text note, max 500 characters                      |
| `tags`            | string[] | no       | 2     | Array of tag strings, max 10 tags, each max 30 chars    |
| `attachmentUrl`   | string   | no       | 2     | Firebase Storage download URL                           |
| `attachmentMeta`  | object   | no       | 2     | `{ fileName, fileSize, contentType }`                   |
| `recurrenceId`    | string   | no       | 3     | Reference to recurrence document ID (if auto-generated) |
| `createdAt`       | string   | yes      | 1     | ISO 8601 timestamp                                      |
| `updatedAt`       | string   | yes      | 1     | ISO 8601 timestamp                                      |

**Validation Rules**:

- `amount`: Must be > 0 and ≤ 999,999,999.99. Rounded to 2 decimal places before storage.
- `type`: Must match the `type` of the referenced category (FR-010).
- `spaceId`: Must reference an existing space owned by the user.
- `categoryId`: Must reference an existing category owned by the user.
- `currency`: Must be a valid code from the supported currencies list.
- `transactionDate`: Must be a valid date string in `YYYY-MM-DD` format.
- `tags`: Each tag is lowercased and trimmed before storage.
- `attachmentMeta.fileSize`: Must be ≤ 5,242,880 bytes (5 MB).
- `attachmentMeta.contentType`: Must be `image/jpeg`, `image/png`, or `application/pdf`.

**Editable Fields** (FR-042): `spaceId`, `categoryId`, `type`, `amount`, `currency`, `transactionDate`, `notes`, `tags`. Attachment can be replaced but not removed.

**Indexes Required**:

- `transactionDate` (descending) — default list sort
- `spaceId` + `transactionDate` (descending) — space filter
- `type` + `transactionDate` (descending) — type filter
- `currency` + `transactionDate` (descending) — currency filter
- `tags` (array-contains) + `transactionDate` (descending) — tag filter

---

## Entity: Recurrence

**Collection**: `users/{userId}/recurrences`

| Field               | Type    | Required | Description                                     |
| ------------------- | ------- | -------- | ----------------------------------------------- |
| `id`                | string  | auto     | Firestore document ID (auto-generated)          |
| `type`              | string  | yes      | `"Income"` or `"Expense"`                       |
| `spaceId`           | string  | yes      | Reference to space document ID                  |
| `categoryId`        | string  | yes      | Reference to category document ID               |
| `amount`            | number  | yes      | Positive number, max 999,999,999.99             |
| `currency`          | string  | yes      | ISO 4217 code                                   |
| `recurrencePattern` | string  | yes      | `"Weekly"`, `"Monthly"`, `"Yearly"`, `"Custom"` |
| `interval`          | number  | yes      | Pattern multiplier (e.g., 2 = every 2 weeks)    |
| `startDate`         | string  | yes      | ISO 8601 date string (`"YYYY-MM-DD"`)           |
| `endDate`           | string  | no       | ISO 8601 date string, nullable                  |
| `nextExecutionDate` | string  | yes      | ISO 8601 date string — next scheduled date      |
| `isActive`          | boolean | yes      | Whether the recurrence is active                |
| `createdAt`         | string  | yes      | ISO 8601 timestamp                              |
| `updatedAt`         | string  | yes      | ISO 8601 timestamp                              |

**Validation Rules**:

- `recurrencePattern`: Must be one of the four allowed values.
- `interval`: Must be a positive integer ≥ 1.
- `startDate`: Must be a valid date. If in the past, trigger retroactive generation (max 12 without confirmation, per clarification).
- `endDate`: If provided, must be ≥ `startDate`.
- `nextExecutionDate`: Computed on creation, advanced after each generated transaction.
- `isActive`: Defaults to `true` on creation. Set to `false` on pause or when end date is exceeded.

**State Transitions**:

```
Created (isActive=true)
    │
    ├── Pause → Paused (isActive=false)
    │   └── Reactivate → Active (isActive=true, nextExecutionDate recalculated)
    │
    ├── End date exceeded → Deactivated (isActive=false)
    │
    └── Delete → Removed (linked transactions preserved)
```

**Indexes Required**:

- `isActive` + `nextExecutionDate` (ascending) — Cloud Function query for due recurrences

---

## Entity Relationships

```
Space (1) ←── (N) Transaction
Space (1) ←── (N) Recurrence

Category (1) ←── (N) Transaction
Category (1) ←── (N) Recurrence

Recurrence (1) ←── (N) Transaction (via recurrenceId, optional)
```

---

## Balance Computation (Derived, Not Stored)

```
For a given filter set { spaceId?, currency?, dateRange? }:

  incomeTotal  = SUM(amount) WHERE type == "Income"  AND matchesFilters
  expenseTotal = SUM(amount) WHERE type == "Expense" AND matchesFilters

  Balance per currency = incomeTotal - expenseTotal

  Result: Map<currency, { income, expense, balance }>
```

**Important**: Balances are always grouped by currency. Different currencies are never combined. The computation runs on the client from cached `onSnapshot` data.
