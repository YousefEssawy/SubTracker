# Implementation Plan: Expense & Income Tracking System

**Branch**: `002-expense-income-tracking` | **Date**: 2026-02-24 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/002-expense-income-tracking/spec.md`

## Summary

Expand the SubTracker application from a subscription tracker into a full personal finance tracking system. The feature adds four new entity types (Spaces, Categories, Transactions, Recurrences) with Firestore-backed CRUD operations, real-time computed balances grouped by currency, file attachments via Firebase Storage, and automated recurring transaction generation via Cloud Functions. The implementation follows the existing service → context → page architecture and is delivered in 4 incremental phases.

## Technical Context

**Language/Version**: JavaScript (ES2022+), React 19, JSX  
**Primary Dependencies**: React 19, React Router 7, Firebase SDK 12 (Auth, Firestore, Storage), Framer Motion, react-icons, date-fns, i18next, Recharts, react-hot-toast  
**Storage**: Firebase Firestore (documents), Firebase Storage (file attachments)  
**Testing**: Manual testing (no test framework currently configured)  
**Target Platform**: Web application (SPA), hosted on GitHub Pages  
**Project Type**: Single-page web application (React + Vite)  
**Performance Goals**: Transaction list loads < 2s for 1,000 transactions; balance updates in real-time  
**Constraints**: No server-side rendering; client-side only except Cloud Functions for recurrences; no currency conversion  
**Scale/Scope**: Single user, 1,000–10,000 transactions, 6 supported currencies, ~15 new pages/components

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

The project constitution is not yet configured (template only). No gates to evaluate. Proceeding with best practices:

- ✅ Business logic separated from UI (service layer pattern)
- ✅ No stored computed values (balance always derived)
- ✅ Real-time data via Firestore onSnapshot listeners
- ✅ Existing patterns preserved (service → context → page)

## Project Structure

### Documentation (this feature)

```text
specs/002-expense-income-tracking/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 — technical decisions
├── data-model.md        # Phase 1 — entity models & relationships
├── quickstart.md        # Phase 1 — setup & development guide
├── contracts/
│   └── service-contracts.md  # Phase 1 — service & context interfaces
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 — task breakdown (via /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── services/
│   ├── firebase.js              # Existing — add getStorage export
│   ├── authService.js           # Existing
│   ├── subscriptionService.js   # Existing
│   ├── historyService.js        # Existing
│   ├── spaceService.js          # NEW — Space CRUD + deletion guard
│   ├── categoryService.js       # NEW — Category CRUD + deletion guard
│   ├── transactionService.js    # NEW — Transaction CRUD + queries + pagination
│   ├── recurrenceService.js     # NEW — Recurrence CRUD (Phase 3)
│   └── storageService.js        # NEW — Firebase Storage uploads (Phase 2)
├── contexts/
│   ├── AuthContext.jsx           # Existing
│   ├── ThemeContext.jsx          # Existing
│   ├── SubscriptionContext.jsx   # Existing
│   ├── SpaceContext.jsx          # NEW — Spaces state + real-time sync
│   ├── CategoryContext.jsx       # NEW — Categories state + type filtering
│   └── TransactionContext.jsx    # NEW — Transactions + balance + pagination
├── pages/
│   ├── DashboardPage.jsx         # MODIFIED — add BalanceCard
│   ├── SpacesPage.jsx            # NEW — Space management
│   ├── CategoriesPage.jsx        # NEW — Category management
│   ├── TransactionsPage.jsx      # NEW — Transaction list + filters + balance header
│   ├── TransactionFormPage.jsx   # NEW — Create/edit transaction form
│   ├── TransactionDetailPage.jsx # NEW — Full transaction view (Phase 2)
│   └── RecurrencesPage.jsx       # NEW — Manage recurrences (Phase 3)
├── components/
│   ├── finance/                  # NEW directory
│   │   ├── BalanceCard.jsx       # Balance summary (dashboard + list header)
│   │   ├── TransactionListItem.jsx
│   │   ├── FilterBar.jsx         # Multi-filter component
│   │   ├── SpaceForm.jsx         # Create/edit space modal
│   │   ├── CategoryForm.jsx      # Create/edit category modal
│   │   ├── TagInput.jsx          # Tag input (Phase 2)
│   │   ├── FileUpload.jsx        # File upload (Phase 2)
│   │   └── RecurrenceForm.jsx    # Recurrence form (Phase 3)
│   ├── layout/
│   │   ├── Sidebar.jsx           # MODIFIED — add finance nav items
│   │   └── ...existing
│   └── ui/
│       └── Pagination.jsx        # NEW — reusable pagination
├── utils/
│   ├── currencies.js             # Existing — already has currency list
│   ├── categories.js             # Existing — subscription categories (unrelated)
│   ├── dateUtils.js              # Existing — extend for recurrence date math
│   ├── balanceUtils.js           # NEW — balance computation logic
│   └── validationUtils.js        # NEW — shared field validation
└── App.jsx                       # MODIFIED — add new routes

functions/                         # NEW directory (Phase 3)
├── package.json
├── index.js                       # Cloud Function entry
└── recurrenceProcessor.js         # Daily recurrence execution
```

**Structure Decision**: Follows the existing single-project React SPA structure. All new financial features are added under the existing `src/` tree with a new `components/finance/` subdirectory to keep finance-specific components organized. Cloud Functions are isolated in a top-level `functions/` directory per Firebase convention.

## Complexity Tracking

> No constitution violations detected. No complexity justifications needed.
