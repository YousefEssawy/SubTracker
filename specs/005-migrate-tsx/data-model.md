# Data Model: UI Component Props

**Feature**: `005-migrate-tsx`  
**Date**: 2026-02-25

> **Note**: Core domain models (`Transaction`, `Subscription`, `Space`, `Category`, etc.) were established in Phase 1 (`001-strong-type-models`). This document focuses exclusively on the component prop signatures being introduced in this UI migration.

## Shared UI Props

**ModalProps**
Common interfaces for modal dialogs (`SpaceForm.tsx`, `CategoryForm.tsx`, `RecurrenceForm.tsx`):

```typescript
interface ModalProps<T, U> {
  entity?: T | null; // null for creation, populated for editing
  onSubmit: (data: U) => Promise<void>;
  onClose: () => void;
  loading?: boolean;
}
```

**ListItemProps**
Common interface for lists displaying domain entities:

```typescript
interface TransactionListItemProps {
  transaction: import("@/models").Transaction;
}
```

## State & Event Models

**React Event Handlers**

- Mouse Events: `React.MouseEvent<HTMLButtonElement>`
- Form Submissions: `React.FormEvent<HTMLFormElement>`
- Input Changes: `React.ChangeEvent<HTMLInputElement | HTMLSelectElement>`

_(No Firestore or database schemas are modified in this feature)_
