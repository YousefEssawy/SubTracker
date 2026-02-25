---
description: "Task list for strong-typed domain models migration"
---

# Tasks: Strong-Typed Domain Models

**Branch**: `001-strong-type-models`
**Input**: Design documents from `/specs/001-strong-type-models/`
**Prerequisites**: plan.md ✅ · spec.md ✅ · research.md ✅ · data-model.md ✅ · quickstart.md ✅

**Tests**: No test framework is configured in this project. Type-checking via `tsc --noEmit` serves as the verification gate. No test tasks are generated.

**Organization**: Tasks are grouped by user story (P1 → P4) to enable independent delivery. Each phase adds a verifiable type-safety guarantee that can be confirmed by running `npx tsc --project tsconfig.app.json --noEmit`.

---

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no shared dependency on incomplete tasks in same phase)
- **[Story]**: Which user story this task belongs to (US1–US4)
- All file paths are relative to the project root `d:\Learning\Antigarvity\SubTracker\`

---

## Phase 1: Setup (TypeScript Infrastructure)

**Purpose**: Add TypeScript tooling and configuration without touching any source files. The app must continue running on `npm run dev` after every task in this phase.

- [x] T001 Install dev dependencies: run `npm install -D typescript @types/react @types/react-dom` in project root
- [x] T002 Create `tsconfig.json` (root references file) at `tsconfig.json`
- [x] T003 Create `tsconfig.app.json` (strict source config, `allowJs: true`, `checkJs: false`, `moduleResolution: "bundler"`, `noEmit: true`) at `tsconfig.app.json`
- [x] T004 Create `tsconfig.node.json` (for `vite.config.js`) at `tsconfig.node.json`
- [x] T005 Add `"typecheck": "tsc --project tsconfig.app.json --noEmit"` script to `package.json`
- [x] T006 Verify setup: run `npm run typecheck` — expect zero errors (no `.ts` files yet, only config validated)

**Checkpoint**: `npm run dev` still works. `npm run typecheck` exits with 0 errors.

---

## Phase 2: Foundational — Domain Model Types (Blocking Prerequisite)

**Purpose**: Create `src/models/` with all type definitions. No runtime code changes — pure type declarations only. All subsequent phases depend on these types existing.

**⚠️ CRITICAL**: Phases 3–6 cannot begin until this phase is fully complete and `npm run typecheck` reports zero errors on all model files.

- [x] T007 Create `src/models/common.ts` — define `ISOString`, `DateString`, `CurrencyCode` (6-member union), `CategoryId` (10-member union)
- [x] T008 [P] Create `src/models/subscription.ts` — define `SubscriptionStatus`, `BillingCycle`, `Subscription` interface, `SubscriptionInput` (Omit server fields), `SubscriptionUpdate` (Partial of Input)
- [x] T009 [P] Create `src/models/transaction.ts` — define `TransactionType`, `AttachmentMeta` interface, `Transaction` interface, `TransactionInput`, `TransactionUpdate`
- [x] T010 [P] Create `src/models/space.ts` — define `Space` interface, `SpaceInput`
- [x] T011 [P] Create `src/models/category.ts` — define `FinanceCategoryType`, `Category` interface, `CategoryInput`
- [x] T012 [P] Create `src/models/recurrence.ts` — define `RecurrenceStatus`, `RecurrencePattern` (`"daily" | "weekly" | "monthly" | "yearly"`), `Recurrence` interface, `RecurrenceInput`
- [x] T013 [P] Create `src/models/payment.ts` — define `Payment` interface (subscription history entry)
- [x] T014 [P] Create `src/models/balance.ts` — define `CurrencyBalance` interface (`income`, `expense`, `balance`), `BalanceMap` (`Record<CurrencyCode, CurrencyBalance>`)
- [x] T015 Create `src/models/mappers.ts` — implement typed mapper functions: `toSubscription(id, data)`, `toTransaction(id, data)`, `toSpace(id, data)`, `toCategory(id, data)`, `toRecurrence(id, data)`, `toPayment(id, data)` — each accepts `(id: string, data: DocumentData): <Model>`
- [x] T016 Create `src/models/index.ts` — re-export everything from all model files in `src/models/`
- [x] T017 Verify: run `npm run typecheck` — zero errors. Verify `src/models/index.ts` exports all 9 entity types plus all union aliases

**Checkpoint**: `src/models/` is complete. `npm run typecheck` reports zero errors. Foundation ready — user stories can now proceed.

---

## Phase 3: User Story 1 — Compile-Time Safety on Data Shapes (Priority: P1) 🎯 MVP

**Goal**: Migrate `src/utils/` from `.js` to `.ts` with full strict typing. Every utility function has typed inputs and outputs. Discriminated-union return types on validators prevent unsafe `.value` access.

**Independent Test**: `npm run typecheck` against `src/utils/*.ts` reports zero errors. Pass a string where a number is expected in any util function call and the compiler flags it.

### Implementation for User Story 1

- [x] T018 [P] [US1] Rename and type `src/utils/categories.js` → `src/utils/categories.ts` — import `CategoryId` from `@/models`; type `CATEGORIES` as `readonly SubscriptionCategory[]` where `SubscriptionCategory = { id: CategoryId; name: string; icon: string; color: string }`; type `getCategoryById(id: string): SubscriptionCategory` (always returns fallback, never `undefined`)
- [x] T019 [P] [US1] Rename and type `src/utils/currencies.js` → `src/utils/currencies.ts` — import `CurrencyCode` from `@/models`; type `CURRENCIES` as `readonly CurrencyDefinition[]` where `CurrencyDefinition = { code: CurrencyCode; name: string; symbol: string }`; type `EXCHANGE_RATES` as `Record<CurrencyCode, number>`; type `convertCurrency(amount: number, from: CurrencyCode, to: CurrencyCode): number`; type `formatCurrency(amount: number, code: CurrencyCode): string`
- [x] T020 [P] [US1] Rename and type `src/utils/balanceUtils.js` → `src/utils/balanceUtils.ts` — import `Transaction`, `CurrencyBalance`, `BalanceMap` from `@/models`; type `computeBalances(transactions: Transaction[]): BalanceMap`; type `filterTransactions(transactions: Transaction[], filters: TransactionFilters): Transaction[]` where `TransactionFilters` is a new local interface with all optional filter fields
- [x] T021 [P] [US1] Rename and type `src/utils/validationUtils.js` → `src/utils/validationUtils.ts` — add discriminated-union return types: `validateAmount(amount: unknown): { valid: true; value: number } | { valid: false; error: string }`; same pattern for `validateRequired`, `validateCurrency`, `validateDate`, `validateTags`
- [x] T022 [P] [US1] Rename and type `src/utils/dateUtils.js` → `src/utils/dateUtils.ts` — add typed parameter and return types to all exported date helpers; import `DateString`, `ISOString` from `@/models` for date string parameters
- [x] T023 [P] [US1] Rename and type `src/utils/spaceDefaults.js` → `src/utils/spaceDefaults.ts` — import `SpaceInput` from `@/models`; type the defaults export as `SpaceInput` or appropriate typed shape
- [x] T024 [US1] Run `npm run typecheck` — fix any errors in `src/utils/*.ts` until zero errors remain; update any imports in `.jsx` pages/components that reference the renamed utils (update import paths if needed)

**Checkpoint**: `src/utils/` fully typed. `npm run typecheck` — zero errors. Passing wrong argument types to any util function produces a compile error.

---

## Phase 4: User Story 2 — Typed Service & Context API Contracts (Priority: P2)

**Goal**: Migrate `src/services/` and `src/firebase.js` from `.js` to `.ts`. Every service function has typed parameters and return types. Mapper functions from `src/models/mappers.ts` replace all raw `doc.data()` spreads.

**Independent Test**: `npm run typecheck` against `src/services/*.ts` reports zero errors. Calling `addSubscription(userId, { price: "wrong" })` produces a compile error.

### Implementation for User Story 2

- [x] T025 [P] [US2] Rename and type `src/services/firebase.js` → `src/services/firebase.ts` — add `import type { Firestore } from "firebase/firestore"`; export `db` with explicit `Firestore` type
- [x] T026 [P] [US2] Rename and type `src/services/subscriptionService.js` → `src/services/subscriptionService.ts` — import `Subscription`, `SubscriptionInput`, `SubscriptionUpdate` from `@/models`; import `toSubscription` from `@/models/mappers`; type all function signatures: `addSubscription(userId: string, data: SubscriptionInput): Promise<Subscription>`, `updateSubscription(userId: string, id: string, data: SubscriptionUpdate): Promise<void>`, `deleteSubscription(userId: string, id: string): Promise<void>`, `getSubscription(userId: string, id: string): Promise<Subscription | null>`, `subscribeToSubscriptions(userId: string, callback: (subs: Subscription[]) => void): () => void`; replace `{ id: doc.id, ...doc.data() }` spreads with `toSubscription(doc.id, doc.data())`
- [x] T027 [P] [US2] Rename and type `src/services/transactionService.js` → `src/services/transactionService.ts` — import `Transaction`, `TransactionInput`, `TransactionUpdate` from `@/models`; import `toTransaction` from `@/models/mappers`; type all function signatures including `TransactionFilters` interface for `buildQuery`; replace raw Firestore spreads with `toTransaction(d.id, d.data())`
- [x] T028 [P] [US2] Rename and type `src/services/spaceService.js` → `src/services/spaceService.ts` — import `Space`, `SpaceInput` from `@/models`; import `toSpace` from `@/models/mappers`; type all CRUD function signatures; replace spreads with `toSpace(doc.id, doc.data())`
- [x] T029 [P] [US2] Rename and type `src/services/categoryService.js` → `src/services/categoryService.ts` — import `Category`, `CategoryInput` from `@/models`; import `toCategory` from `@/models/mappers`; type all CRUD function signatures
- [x] T030 [P] [US2] Rename and type `src/services/recurrenceService.js` → `src/services/recurrenceService.ts` — import `Recurrence`, `RecurrenceInput` from `@/models`; import `toRecurrence` from `@/models/mappers`; type all function signatures
- [x] T031 [P] [US2] Rename and type `src/services/historyService.js` → `src/services/historyService.ts` — import `Payment` from `@/models`; import `toPayment` from `@/models/mappers`; type `subscribeToPayments(userId: string, callback: (payments: Payment[]) => void): () => void`
- [x] T032 [P] [US2] Rename and type `src/services/storageService.js` → `src/services/storageService.ts` — import `AttachmentMeta` from `@/models`; type upload/delete function signatures using `AttachmentMeta` for metadata return values
- [x] T033 [P] [US2] Rename and type `src/services/authService.js` → `src/services/authService.ts` — add typed return types for all auth functions; import `User` type from `firebase/auth`
- [x] T034 [US2] Run `npm run typecheck` — fix any errors in `src/services/*.ts` until zero errors remain; update `.jsx` imports referencing renamed service files

**Checkpoint**: `src/services/` fully typed. All Firestore callbacks produce typed domain objects (never raw `any`). `npm run typecheck` — zero errors.

---

## Phase 5: User Story 2 (continued) — Typed Context Interfaces (Priority: P2)

**Goal**: Migrate `src/contexts/` from `.jsx` to `.tsx`. Every React Context value shape is defined as a typed interface. Context hooks return typed values.

**Independent Test**: `npm run typecheck` against `src/contexts/*.tsx` reports zero errors. Destructuring a non-existent property from `useSubscriptions()` produces a compile error.

### Implementation for User Story 2 (continued)

- [x] T035 [P] [US2] Rename and type `src/contexts/AuthContext.jsx` → `src/contexts/AuthContext.tsx` — define `AuthContextValue` interface with `user: User | null`, `loading: boolean`, `signIn`, `signOut` function signatures; type the `useAuth()` hook return as `AuthContextValue`
- [x] T036 [P] [US2] Rename and type `src/contexts/SubscriptionContext.jsx` → `src/contexts/SubscriptionContext.tsx` — define `SubscriptionContextValue` interface using `Subscription[]` and `Payment[]` from `@/models`; type `useSubscriptions()` return; replace all inline `{}` state types with explicit typed state
- [x] T037 [P] [US2] Rename and type `src/contexts/TransactionContext.jsx` → `src/contexts/TransactionContext.tsx` — define `TransactionContextValue` interface using `Transaction[]`, `BalanceMap`, `TransactionFilters`; type `addTransaction(data: TransactionInput)` and `updateTransaction(id: string, data: TransactionUpdate)` signatures; type the `pagination` object shape as a named `PaginationControl` interface
- [x] T038 [P] [US2] Rename and type `src/contexts/SpaceContext.jsx` → `src/contexts/SpaceContext.tsx` — define `SpaceContextValue` interface; type `addSpace`, `updateSpace`, `deleteSpace` with `Space`/`SpaceInput` from `@/models`
- [x] T039 [P] [US2] Rename and type `src/contexts/CategoryContext.jsx` → `src/contexts/CategoryContext.tsx` — define `CategoryContextValue` interface; type all CRUD methods with `Category`/`CategoryInput` from `@/models`
- [x] T040 [P] [US2] Rename and type `src/contexts/RecurrenceContext.jsx` → `src/contexts/RecurrenceContext.tsx` — define `RecurrenceContextValue` interface; type all methods using `Recurrence`/`RecurrenceInput` from `@/models`
- [x] T041 [P] [US2] Rename and type `src/contexts/ThemeContext.jsx` → `src/contexts/ThemeContext.tsx` — define `ThemeContextValue` interface with `theme: "light" | "dark"` and `toggleTheme: () => void`
- [x] T042 [P] [US2] Rename and type `src/contexts/ViewportContext.jsx` → `src/contexts/ViewportContext.tsx` — define `ViewportContextValue` interface with `isMobile: boolean`, `isTablet: boolean`
- [x] T043 [US2] Update `src/App.jsx` — fix any import paths to context files now named `.tsx`; no type annotation changes needed in `.jsx` file itself
- [x] T044 [US2] Run `npm run typecheck` — fix any errors in `src/contexts/*.tsx` until zero errors remain

**Checkpoint**: `src/contexts/` fully typed. All context hooks return typed values. `npm run typecheck` — zero errors. US2 complete.

---

## Phase 6: User Story 3 — Typed Utility & Validation Return Types (Priority: P3)

**Goal**: Verify that the discriminated-union validators from Phase 3 are being used correctly throughout the codebase. Identify and fix any `.value` accesses in `.jsx` files that bypass the `valid` check. This is a validation + polish pass, not new migration work.

**Independent Test**: Search the codebase for `.value` accesses on validator return values — each must be preceded by a `if (result.valid)` guard. `npm run typecheck` reports zero errors.

### Implementation for User Story 3

- [x] T045 [US3] Audit all usages of `validateAmount`, `validateRequired`, `validateCurrency`, `validateDate`, `validateTags` across `src/pages/` and `src/components/` — verify each usage guards on `.valid` before accessing `.value`; add guards where missing (these are `.jsx` files — fix logic, not types)
- [x] T046 [US3] Audit all usages of `computeBalances()` in pages/components — verify callers access result as `Record<CurrencyCode, CurrencyBalance>` shape (index by currency string, access `.income`/`.expense`/`.balance`); fix any incorrect property accesses
- [x] T047 [US3] Audit all usages of `getCategoryById()` in pages/components — verify callers treat return as always-present `SubscriptionCategory` (never `undefined`); remove any unnecessary null-guards that now have no purpose
- [x] T048 [US3] Run `npm run typecheck` — zero errors; confirm no `any` keyword appears in `src/utils/*.ts`; document any TypeScript suppressions (`// @ts-ignore`) left in `.jsx` files with a `TODO` comment noting the file should be migrated in a future task

**Checkpoint**: All validators used correctly. Utility layer is fully typed and consistently consumed. Zero `any` in `src/utils/`.

---

## Phase 7: User Story 4 — Typed Component Props (Priority: P4)

**Goal**: Add JSDoc `@typedef` prop type hints to the most critical shared components that accept domain model data. Since components remain `.jsx`, prop types are defined via JSDoc `@param` or inline TypeScript-compatible JSDoc annotations that give IntelliSense without file conversion.

> **Note**: Full `.tsx` conversion of pages/components is out of scope per the Q3 migration decision. This phase adds lightweight type documentation to the most-used shared components.

**Independent Test**: Hovering over props of any enhanced component in VS Code shows typed IntelliSense including the specific domain model type name (e.g., `Subscription`, `Transaction`).

### Implementation for User Story 4

- [x] T049 [P] [US4] Add JSDoc `@param {import('@/models').Subscription} subscription` annotations to subscription card/list-item components in `src/components/` that accept a `subscription` prop — identify all such components and annotate each
- [x] T050 [P] [US4] Add JSDoc `@param {import('@/models').Transaction} transaction` annotations to transaction list-item, detail, and row components in `src/components/` that accept a `transaction` prop
- [x] T051 [P] [US4] Add JSDoc `@param {import('@/models').Space} space` and `@param {import('@/models').Category} category` annotations to any components accepting these domain objects as props
- [x] T052 [US4] Run `npm run typecheck` — zero errors. Open an annotated component in the editor and confirm hovering over the prop shows the typed model fields

**Checkpoint**: All domain-data-accepting components have typed prop documentation. Passing wrong-shaped objects produces IntelliSense warnings.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final verification, zero-`any` audit, npm script finalization, and documentation.

- [x] T053 Run full zero-`any` audit: search `src/models/`, `src/utils/`, `src/services/`, `src/contexts/` for literal `: any` or `as any` — fix every occurrence found
- [x] T054 [P] Verify SC-004: run a search for inline string unions defined more than once (e.g., `"active" | "paused" | "cancelled"` appearing more than once in `.ts` files) — replace duplicates with imports of the canonical named type alias
- [x] T055 [P] Update `package.json` lint script to chain type-check: `"lint": "eslint . && npm run typecheck"` so CI always validates types
- [x] T056 [P] Add `src/models/index.ts` export completeness check — verify all 9 entity interfaces and all named union type aliases are exported from the index barrel file
- [x] T057 Run final `npm run typecheck` — expected: **zero errors, zero warnings** across all `.ts`/`.tsx` files in `src/`
- [x] T058 Run `npm run build` — verify production build succeeds with zero TypeScript errors; confirm bundle size unchanged (TypeScript is stripped at build time)
- [x] T059 [P] Update `specs/001-strong-type-models/checklists/requirements.md` — mark all quality checklist items as complete post-migration

**Checkpoint**: Zero `any` in typed layers. `npm run typecheck` and `npm run build` both succeed. Migration complete. ✅

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)
    └─► Phase 2 (Foundational — Models)    ← BLOCKS all user story phases
            ├─► Phase 3 (US1 — Utils)
            ├─► Phase 4 (US2 — Services)   ← depends on Phase 3 completion for util types
            ├─► Phase 5 (US2 — Contexts)   ← depends on Phases 3 & 4
            ├─► Phase 6 (US3 — Validator audit)  ← depends on Phase 3
            └─► Phase 7 (US4 — Component props)  ← depends on all above
                    └─► Phase 8 (Polish)
```

### User Story Dependencies

| Story                           | Depends On                | Can Parallelize With                           |
| ------------------------------- | ------------------------- | ---------------------------------------------- |
| US1 — Utils (Phase 3)           | Phase 2 complete          | US2 services can start after US1 completes     |
| US2 — Services (Phase 4)        | Phases 2 + 3 complete     | US2 contexts in Phase 5 can start with Phase 4 |
| US2 — Contexts (Phase 5)        | Phases 2 + 3 + 4 complete | —                                              |
| US3 — Validator audit (Phase 6) | Phase 3 complete          | Phase 4 can run in parallel                    |
| US4 — Component props (Phase 7) | Phases 2–5 complete       | Phase 8 polish tasks marked [P]                |

### Within Each Phase

- All tasks marked **[P]** within a phase can run in parallel (they target different files)
- Tasks without [P] must run sequentially (either depend on previous tasks or modify shared files)

---

## Parallel Execution Examples

### Phase 2 (Foundational) — run all model files simultaneously:

```
T008 subscription.ts  |  T009 transaction.ts  |  T010 space.ts
T011 category.ts      |  T012 recurrence.ts   |  T013 payment.ts
T014 balance.ts
```

Then sequentially: T015 mappers.ts → T016 index.ts → T017 verify

### Phase 3 (US1 — Utils) — run all util files simultaneously:

```
T018 categories.ts  |  T019 currencies.ts  |  T020 balanceUtils.ts
T021 validationUtils.ts  |  T022 dateUtils.ts  |  T023 spaceDefaults.ts
```

Then sequentially: T024 verify & fix import paths

### Phase 4+5 (US2) — run all service + context files simultaneously within each phase:

```
Phase 4: T025–T033 (9 service files, all [P])
Phase 5: T035–T042 (8 context files, all [P])
```

---

## Implementation Strategy

### MVP (User Story 1 Only — ~2 hours)

1. ✅ Phase 1: Setup (TypeScript config)
2. ✅ Phase 2: Foundational (all model type definitions)
3. ✅ Phase 3: US1 (migrate `src/utils/`)
4. **STOP & VALIDATE**: `npm run typecheck` — zero errors in models + utils. All util function signatures are typed and IntelliSense works.

### Incremental Delivery

1. Phases 1–2 → TypeScript configured, model types defined ✅
2. Phase 3 → Utils fully typed ✅ (US1 done)
3. Phases 4–5 → Services + Contexts fully typed ✅ (US2 done)
4. Phase 6 → Validator usage audited ✅ (US3 done)
5. Phases 7–8 → Component props + Polish ✅ (US4 + complete)

### Solo Developer Strategy

Work phases sequentially. Within each phase, open all [P]-marked files in parallel editor tabs, complete them, then run `npm run typecheck` once at the end of the phase to catch any cross-file issues before moving on.

---

## Task Summary

| Phase                           | Tasks        | Parallel [P]           | Story |
| ------------------------------- | ------------ | ---------------------- | ----- |
| Phase 1 — Setup                 | T001–T006    | T003                   | —     |
| Phase 2 — Foundational (Models) | T007–T017    | T008–T014              | —     |
| Phase 3 — US1 (Utils)           | T018–T024    | T018–T023              | US1   |
| Phase 4 — US2 (Services)        | T025–T034    | T025–T033              | US2   |
| Phase 5 — US2 (Contexts)        | T035–T044    | T035–T042              | US2   |
| Phase 6 — US3 (Validator audit) | T045–T048    | —                      | US3   |
| Phase 7 — US4 (Component props) | T049–T052    | T049–T051              | US4   |
| Phase 8 — Polish                | T053–T059    | T054–T056, T059        | —     |
| **Total**                       | **59 tasks** | **~40 parallelizable** |       |

---

## Notes

- [P] tasks target different files — open all in parallel tabs and complete in one session
- Commit after each phase checkpoint (8 clean commits total)
- `npm run dev` must stay green at every commit — TypeScript errors in `.ts` files do NOT block Vite from running (they are type-check-only)
- If a `.jsx` component import breaks after a service/util rename, update the import path in the `.jsx` file (one-line fix, no type annotations needed)
- Use `// @ts-ignore` sparingly in `.jsx` files as a temporary escape hatch; leave a `TODO:` comment marking it for a future full `.tsx` migration
