# Feature Specification: Migrate UI to TSX

**Feature Branch**: `005-migrate-tsx`  
**Created**: 2026-02-25  
**Status**: Draft  
**Input**: User description: "I need to change the project to tsx"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Fix Dev Server and Imports (Priority: P1)

The immediate priority is to resolve the broken development server caused by the previous TypeScript migration. Some remaining `.jsx` components and pages explicitly import `.js` service or utility files that no longer exist (because they were renamed to `.ts` and then the `.js` files were deleted).

**Why this priority**: The application cannot be run or developed locally until the Vite dev server successfully compiles.

**Independent Test**: Can be fully tested by running `npm run dev` and verifying the application loads without "Failed to load url" or "Does the file exist?" errors in the terminal or browser console.

**Acceptance Scenarios**:

1. **Given** the current broken state, **When** developers remove explicit `.js` extensions from import paths across the codebase, **Then** Vite's ES module resolution correctly finds the `.ts` and `.tsx` equivalents automatically.
2. **Given** the application code, **When** running `npm run dev`, **Then** the application starts successfully and renders the UI.

---

### User Story 2 - Migrate Shared Components to TSX (Priority: P2)

Migrate the generic, reusable UI components (e.g., buttons, inputs, layouts) and domain-specific components (e.g., `BalanceCard`, `TransactionListItem`) from `.jsx` to `.tsx`.

**Why this priority**: Shared components are the building blocks of the application. Typing them first ensures that when pages are migrated later, they consume strongly-typed component props, maximizing the value of the TypeScript compiler.

**Independent Test**: Can be independently verified by checking that all files in `src/components/` end in `.tsx` and running `npm run typecheck` produces zero errors.

**Acceptance Scenarios**:

1. **Given** a shared `.jsx` component, **When** it is converted to `.tsx`, **Then** its props must be explicitly typed using TypeScript interfaces (using domain models where appropriate).
2. **Given** a migrated component, **When** a parent passes an incorrect prop type, **Then** the TypeScript compiler flags it as an error.

---

### User Story 3 - Migrate Application Pages to TSX (Priority: P3)

Migrate the top-level application route pages (e.g., `DashboardPage`, `TransactionsPage`, `RecurrencesPage`) from `.jsx` to `.tsx`.

**Why this priority**: Pages orchestrate context, services, and components. They represent the final layer of the frontend stack to receive strong typing, completing the end-to-end type safety of the application.

**Independent Test**: Verified by checking that all files in `src/pages/` end in `.tsx`, with a successful, zero-error `npm run typecheck`.

**Acceptance Scenarios**:

1. **Given** a page component, **When** it fetches data from strongly-typed services or contexts, **Then** it must correctly pass that typed data down to its child components without requiring `any` casts.
2. **Given** all pages migrated, **When** `npm run build` is executed, **Then** the production bundle builds successfully with zero TypeScript compilation errors.

---

### Edge Cases

- What happens when third-party libraries (e.g., `react-hot-toast`, `framer-motion`, `recharts`) lack types or export complex generics? (Should use appropriate `@types/*` packages or minimal type declarations).
- How does the system handle complex event types from form inputs or drag-and-drop interactions? (Must use React's built-in `ChangeEvent`, `MouseEvent`, etc.).

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST resolve all module imports correctly without relying on explicit `.js` extensions that break when files are converted to `.ts`/`.tsx`.
- **FR-002**: All files in `src/components/` MUST be converted from `.jsx` to `.tsx`.
- **FR-003**: All files in `src/pages/` MUST be converted from `.jsx` to `.tsx`.
- **FR-004**: React component props MUST be explicitly defined using TypeScript `interface` or `type` declarations.
- **FR-005**: All `useState`, `useReducer`, and `useRef` hooks MUST be correctly typed, either via inference or explicit generic arguments.
- **FR-006**: The application MUST NOT utilize the `any` type keyword to bypass type checking in the newly migrated files.
- **FR-007**: Event handlers (e.g., `onClick`, `onChange`, `onSubmit`) MUST use correct React event types (e.g., `React.MouseEvent<HTMLButtonElement>`).

### Key Entities

- **Component Props**: Interfaces defining the expected inputs, callbacks, and optional parameters for every UI component.
- **React Events**: Standardized TypeScript definitions for DOM interactions.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 100% of `.jsx` files in `src/components/` and `src/pages/` are removed and replaced with `.tsx`.
- **SC-002**: The command `npm run typecheck` completes with exactly 0 errors.
- **SC-003**: The command `npm run build` completes successfully with an exit code of 0.
- **SC-004**: A codebase search for `: any` or `as any` yields 0 results across all `.tsx` and `.ts` files, enforcing strict type safety.
- **SC-005**: The Vite development server (`npm run dev`) starts with 0 "Failed to load" or module resolution errors.
