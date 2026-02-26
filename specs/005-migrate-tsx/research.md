# Research: Migrate UI to TSX

**Feature**: `005-migrate-tsx`  
**Date**: 2026-02-25

## 1. Import Resolution in Vite

**Decision**: Remove explicit `.js` and `.jsx` extensions from all local import paths across the codebase.
**Rationale**: The current `Failed to load url` error in `npm run dev` is occurring because pages like `TransactionFormPage.jsx` explicitly `import ... from "../services/transactionService.js"`. Since `transactionService.js` was deleted and replaced by `transactionService.ts`, Vite looks for the exact literal `.js` file and fails. By removing the extension entirely, Vite uses its standard ES module resolution to find `.ts` and `.tsx` equivalents automatically.
**Alternatives considered**: Configuring Vite aliases or a custom Rollup plugin to rewrite `.js` to `.ts`. This is an anti-pattern; fixing the imports to extension-less or valid mapped extensions is the standard practice in TypeScript + bundler setups.

## 2. Typing Third-Party Libraries (Framer Motion, Recharts)

**Decision**: Utilize built-in types strictly and rely on `@types/*` where necessary. For `framer-motion`, use `import { motion, HTMLMotionProps } from "framer-motion"`. For `recharts`, rely on its built-in TypeScript definitions.
**Rationale**: Both libraries ship with strong type definitions. No custom `.d.ts` declaration files are necessary.

## 3. Typing React Functional Components

**Decision**: Use `React.FC<Props>` or standard destructured arguments `const MyComponent = ({ prop1 }: { prop1: string }) => { ... }`. We will standardise on the explicit destructuring approach, leveraging the domain model types imported from `@/models`.
**Rationale**: `React.FC` is often considered legacy since React 18 because it implicitly adds `children` even when not wanted. Explicitly defining props via inline interface or `interface [Name]Props` per file is safer and clearer.
