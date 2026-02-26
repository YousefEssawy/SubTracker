# Implementation Plan: Migrate UI to TSX

**Branch**: `005-migrate-tsx` | **Date**: 2026-02-25 | **Spec**: [specs/005-migrate-tsx/spec.md](spec.md)
**Input**: Feature specification from `/specs/005-migrate-tsx/spec.md`

## Summary

Migrate all remaining React components and pages in the `src/components/` and `src/pages/` directories from `.jsx` to `.tsx`. The immediate first step is to strip out hardcoded `.js` file extensions in import statements across the app to fix the Vite dev server error caused by prior migrations.

## Technical Context

**Language/Version**: TypeScript 5.7+ / React 18  
**Primary Dependencies**: Vite, TailwindCSS, framer-motion, recharts  
**Storage**: N/A (UI layer only; services already migrated)  
**Testing**: `npm run typecheck` (`tsc --noEmit`), `eslint .`  
**Target Platform**: Web (SPA)  
**Project Type**: React Web Application  
**Performance Goals**: Zero impact on bundle size (types are stripped)  
**Constraints**: Zero `any` keyword usage  
**Scale/Scope**: 19 global pages, ~20 reusable components

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- [x] **Strict Typing**: All React components explicitly define Prop structures. No `: any` escapes.
- [x] **Zero Errors**: Build pipeline and TDD flow mandate zero compilation errors.
- [x] **Simple Resolution**: Relying on Vite builder defaults instead of complex alias setups for imports.

## Project Structure

### Documentation (this feature)

```text
specs/005-migrate-tsx/
├── plan.md              # This file
├── research.md          # Vite resolution patterns & React typings
├── data-model.md        # Component Prop models
├── quickstart.md        # Commands to verify build & typecheck
└── tasks.md             # To be created
```

### Source Code (repository root)

```text
src/
├── components/          # To be migrated to .tsx
│   ├── finance/
│   ├── layout/
│   └── ui/
├── pages/               # To be migrated to .tsx
├── App.tsx              # Migration target
└── index.css            # Unchanged
```

**Structure Decision**: The existing Vite application structure remains identical. Only the file extensions (`.jsx` -> `.tsx`) and internal import pathways change.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
| --------- | ---------- | ------------------------------------ |
| _None_    | _N/A_      | _N/A_                                |
