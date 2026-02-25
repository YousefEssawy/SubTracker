# SubTracker Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-02-24

## Active Technologies
- JavaScript (ES6+), React 19 + React Router v7, Tailwind CSS v3.4.19, Framer Motion v12 (1-mobile-design-refactor)
- N/A (UI Refactor only) (1-mobile-design-refactor)
- JavaScript (ES2022+), React 19, JSX + React 19, React Router 7, Firebase SDK 12 (Auth, Firestore, Storage), Framer Motion, react-icons, date-fns, i18next, Recharts, react-hot-toast (002-expense-income-tracking)
- Firebase Firestore (documents), Firebase Storage (file attachments) (002-expense-income-tracking)
- JavaScript (React 19+, ESM) + Vite, TailwindCSS v3, Framer Motion, Recharts, React-i18next (004-responsive-rtl-revision)
- N/A (UI-only revision, state via existing Context/Firebase) (004-responsive-rtl-revision)
- JavaScript (React 19+, ESM) + Vite, TailwindCSS v3, i18next v25+, react-i18next v16+, date-fns (003-system-localization)
- LocalStorage (for locale persistence), Firebase (for user profile sync if applicable) (003-system-localization)
- JavaScript (ES2020) → TypeScript 5.x (partial migration); React 19 with JSX + Vite 7, Firebase 12, React Router 7, Framer Motion 12, Recharts, i18next (001-strong-type-models)
- Firebase Firestore (cloud) — no local storage layer (001-strong-type-models)

- [e.g., Python 3.11, Swift 5.9, Rust 1.75 or NEEDS CLARIFICATION] + [e.g., FastAPI, UIKit, LLVM or NEEDS CLARIFICATION] (001-mobile-design-refactor)

## Project Structure

```text
backend/
frontend/
tests/
```

## Commands

cd src; pytest; ruff check .

## Code Style

[e.g., Python 3.11, Swift 5.9, Rust 1.75 or NEEDS CLARIFICATION]: Follow standard conventions

## Recent Changes
- 001-strong-type-models: Added JavaScript (ES2020) → TypeScript 5.x (partial migration); React 19 with JSX + Vite 7, Firebase 12, React Router 7, Framer Motion 12, Recharts, i18next
- 003-system-localization: Added JavaScript (React 19+, ESM) + Vite, TailwindCSS v3, i18next v25+, react-i18next v16+, date-fns
- 004-responsive-rtl-revision: Added JavaScript (React 19+, ESM) + Vite, TailwindCSS v3, Framer Motion, Recharts, React-i18next


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
