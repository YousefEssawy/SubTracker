# Research: Strong-Typed Domain Models

**Feature**: `001-strong-type-models`
**Date**: 2026-02-25

---

## R-001: TypeScript + Vite Configuration

**Decision**: Use a split `tsconfig.json` / `tsconfig.app.json` structure with `strict: true`, `allowJs: true`, `checkJs: false`, `jsx: "react-jsx"`, `moduleResolution: "bundler"`, `noEmit: true`.

**Rationale**:

- Vite projects use `noEmit: true` because Vite handles the actual bundling/transpilation — the TypeScript compiler is only for type checking.
- `allowJs: true` + `checkJs: false` is the standard pattern for incremental migrations: `.ts`/`.tsx` files are strictly checked; `.jsx` files are allowed but not type-checked.
- `moduleResolution: "bundler"` is required for Vite's module resolution (introduced in TS 5.0, supersedes `"node16"` for bundler contexts).
- `strict: true` must be in `tsconfig.app.json` (the source-code config), not the root `tsconfig.json` which references node scripts.

**Alternatives considered**:

- JSDoc annotations only — rejected: no runtime tooling, no `.ts` files, incomplete compile-time checking.
- `checkJs: true` on `.jsx` files — rejected: would generate thousands of errors in unmigrated page files before they're ready.
- Single flat `tsconfig.json` — rejected: Vite's recommended split structure (`tsconfig.json` + `tsconfig.app.json` + `tsconfig.node.json`) separates concerns correctly.

**Concrete `tsconfig.app.json`**:

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

---

## R-002: Firestore Typed Mapper Pattern

**Decision**: Implement typed mapper functions as plain functions (not `FirestoreDataConverter` classes) — one per entity, each accepting a Firestore `DocumentSnapshot` and returning the typed model.

**Rationale**:

- Firebase's `FirestoreDataConverter` interface is available and provides `toFirestore` + `fromFirestore` lifecycle hooks. However, the current codebase uses raw `doc.data()` spread patterns throughout all services — refactoring all service calls to use `withConverter()` is a larger change than needed.
- The agreed approach (Q2 in `spec.md`) is manual typed mapper functions. These are simpler, have zero Firebase coupling, and can be introduced one service at a time without changing query/subscription call sites.
- Pattern: `export function toSubscription(id: string, data: DocumentData): Subscription { ... }` — called inside `onSnapshot` callbacks.
- This is equivalent to the `fromFirestore` approach but without requiring `withConverter()` plumbing at every collection reference.

**Alternatives considered**:

- `FirestoreDataConverter` with `withConverter()` — viable but requires changing every `collection(db, ...)` call site. Could be adopted in a follow-up refactor.
- Zod schemas — rejected per Q2 clarification: adds a dependency and runtime overhead not required for this refactoring.
- Direct `as Subscription` casting — rejected per FR-014: unsafe, masks schema drift.

---

## R-003: TypeScript `type` vs `interface` for Domain Models

**Decision**: Use `interface` for all object-shaped domain models (Subscription, Transaction, Space, Category, Recurrence, Payment, AttachmentMeta, CurrencyBalance). Use `type` for union aliases (SubscriptionStatus, BillingCycle, TransactionType, RecurrenceStatus, RecurrencePattern, CurrencyCode, CategoryId).

**Rationale**:

- `interface` is idiomatic for object shapes in TypeScript — supports declaration merging and provides clearer error messages. Best practice for domain models.
- `type` is preferred for union literals and computed types. Named union aliases (e.g., `type SubscriptionStatus = "active" | "paused" | "cancelled"`) create a single source of truth reusable across models and services.
- Avoids inline union duplicates (addressed by SC-004).

**Alternatives considered**:

- All `type` — valid but loses interface clarity for object shapes.
- `enum` for status/type unions — rejected: TypeScript enums compile to objects with runtime overhead; string literal unions are zero-cost and more idiomatic in modern TS.
- `class` for models — rejected: adds unnecessary OOP overhead for plain data transfer objects.

---

## R-004: Input Types vs Read Types Separation

**Decision**: Define **two forms** for mutable entities: a full model interface (including `id`, `createdAt`, `updatedAt`) and an `Input` type (omitting server-generated fields).

**Rationale**:

- Service functions like `addSubscription(userId, data)` should NOT require `id`, `createdAt`, `updatedAt` from callers — these are assigned by Firestore/the service.
- Pattern: `type SubscriptionInput = Omit<Subscription, "id" | "createdAt" | "updatedAt">` and `type SubscriptionUpdate = Partial<SubscriptionInput>`.
- This eliminates the current implicit `any` pattern where callers pass free-form objects to `addDoc`.

**Alternatives considered**:

- Single model type (requiring callers to supply all fields) — rejected: callers can't supply `id` before Firestore assigns it.
- Separate full `SubscriptionInput` file — unnecessary overhead; `Omit`/`Partial` utility types handle this cleanly.

---

## R-005: File Migration Order

**Decision**: Migrate in this dependency order to ensure each step compiles cleanly before the next:

1. `src/models/` — pure type definitions, no imports from other `src/` code
2. `src/utils/` — imports only from `src/models/` and external libraries
3. `src/services/` — imports from `src/models/` and `src/utils/`
4. `src/contexts/` — imports from all above layers

**Rationale**:

- Migrating leaf modules first ensures no circular dependency errors during the migration window.
- Each layer becomes a typed contract the next layer can rely on.
- Page and component `.jsx` files are NOT migrated (per Q3 clarification) — they remain as-is and benefit from IntelliSense via type inference from the layers above.

---

## R-006: `@types` packages needed

**Decision**: Install `@types/react`, `@types/react-dom`, and `typescript` as dev dependencies. No other `@types` packages needed.

**Rationale**:

- `firebase`, `react-router-dom`, `framer-motion`, `recharts`, `react-icons`, `date-fns`, `react-i18next`, `i18next` all ship their own TypeScript types — no `@types/*` packages required.
- `react` and `react-dom` require `@types/react` and `@types/react-dom` respectively as separate packages.
