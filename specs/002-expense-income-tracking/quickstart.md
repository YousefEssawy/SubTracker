# Quickstart: Expense & Income Tracking System

**Branch**: `002-expense-income-tracking`  
**Date**: 2026-02-24

---

## Prerequisites

- Node.js 18+
- npm 9+
- Firebase project configured (existing from Sprint 1)
- Firebase CLI installed (for Cloud Functions deployment in Phase 3)

## Setup

```bash
# Clone and checkout the feature branch
git checkout 002-expense-income-tracking

# Install dependencies
npm install

# Ensure .env has Firebase config (already configured from Sprint 1)
# VITE_FIREBASE_API_KEY=...
# VITE_FIREBASE_AUTH_DOMAIN=...
# VITE_FIREBASE_PROJECT_ID=...
# VITE_FIREBASE_STORAGE_BUCKET=...
# VITE_FIREBASE_MESSAGING_SENDER_ID=...
# VITE_FIREBASE_APP_ID=...
# VITE_FIREBASE_MEASUREMENT_ID=...

# Start dev server
npm run dev
```

## New Dependencies (to add)

```bash
# Firebase Storage (for file attachments in Phase 2)
# Already included in the `firebase` package — no separate install needed.
# Just import: import { getStorage } from "firebase/storage";
```

## Project Structure (new files for this feature)

```
src/
├── services/
│   ├── firebase.js              # Existing — add getStorage export
│   ├── spaceService.js          # NEW — CRUD for spaces
│   ├── categoryService.js       # NEW — CRUD for categories
│   ├── transactionService.js    # NEW — CRUD + queries for transactions
│   ├── recurrenceService.js     # NEW — CRUD for recurrences (Phase 3)
│   └── storageService.js        # NEW — File upload/download (Phase 2)
├── contexts/
│   ├── SpaceContext.jsx          # NEW — Spaces state provider
│   ├── CategoryContext.jsx       # NEW — Categories state provider
│   └── TransactionContext.jsx    # NEW — Transactions + balance state provider
├── pages/
│   ├── SpacesPage.jsx            # NEW — Manage spaces
│   ├── CategoriesPage.jsx        # NEW — Manage categories
│   ├── TransactionsPage.jsx      # NEW — Transaction list with filters
│   ├── TransactionFormPage.jsx   # NEW — Create/edit transaction
│   ├── TransactionDetailPage.jsx # NEW — Transaction detail view (Phase 2)
│   └── RecurrencesPage.jsx       # NEW — Manage recurrences (Phase 3)
├── components/
│   ├── finance/
│   │   ├── BalanceCard.jsx       # NEW — Balance summary card
│   │   ├── TransactionListItem.jsx # NEW — Single transaction row
│   │   ├── FilterBar.jsx         # NEW — Space/type/currency/date filters
│   │   ├── SpaceForm.jsx         # NEW — Create/edit space modal
│   │   ├── CategoryForm.jsx      # NEW — Create/edit category modal
│   │   ├── TagInput.jsx          # NEW — Tag input component (Phase 2)
│   │   ├── FileUpload.jsx        # NEW — File attachment component (Phase 2)
│   │   └── RecurrenceForm.jsx    # NEW — Create recurrence form (Phase 3)
│   └── ui/
│       └── Pagination.jsx        # NEW — Reusable pagination component
└── utils/
    ├── currencies.js             # Existing — already has currency list + formatter
    ├── balanceUtils.js           # NEW — Balance computation logic
    └── validationUtils.js        # NEW — Shared validation (amount, fields)

# Cloud Functions (Phase 3)
functions/
├── index.js                      # NEW — Cloud Function entry point
└── recurrenceProcessor.js        # NEW — Daily recurrence execution logic
```

## Development Phases

### Phase 1 — Core Financial Engine

1. Create `spaceService.js`, `SpaceContext.jsx`, `SpacesPage.jsx`
2. Create `categoryService.js`, `CategoryContext.jsx`, `CategoriesPage.jsx`
3. Create `transactionService.js`, `TransactionContext.jsx`, `TransactionsPage.jsx`, `TransactionFormPage.jsx`
4. Create `balanceUtils.js`, `BalanceCard.jsx`
5. Add new routes to `App.jsx`
6. Update `Sidebar.jsx` with new navigation items

### Phase 2 — Transaction Quality Layer

1. Add `notes`, `tags` fields to transaction form
2. Create `storageService.js`, `FileUpload.jsx`
3. Create `TransactionDetailPage.jsx`
4. Add tag and date filtering to `FilterBar.jsx`

### Phase 3 — Recurring Engine

1. Create `recurrenceService.js`, `RecurrencesPage.jsx`, `RecurrenceForm.jsx`
2. Set up Firebase Cloud Functions project
3. Implement `recurrenceProcessor.js`
4. Deploy and test scheduled function

### Phase 4 — Multi-Currency Improvements

1. Enhance `BalanceCard.jsx` with grouped currency display
2. Add currency filter to `FilterBar.jsx`
3. Ensure currency indicators on all transaction displays

## Key Commands

```bash
# Development
npm run dev          # Start Vite dev server

# Build
npm run build        # Production build

# Lint
npm run lint         # ESLint check

# Cloud Functions (Phase 3)
cd functions && npm install
firebase deploy --only functions
```

## Testing Guidance

- **Balance accuracy**: Create 10+ transactions across 2 currencies, 2 spaces. Verify balance matches manual calculation.
- **Deletion guards**: Create a space with transactions, try to delete → should fail. Delete transactions first → delete should succeed.
- **Pagination**: Create 25+ transactions, verify page navigation works correctly.
- **Filters**: Apply space, type, currency, date filters individually and combined.
- **Recurrence** (Phase 3): Create a monthly recurrence, trigger Cloud Function, verify transaction created and next date advanced.
