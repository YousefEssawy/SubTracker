# Spec 13 — Route-level code splitting (W13)

> **You cannot run shell commands in this environment.** Do not attempt `npm`, `git`, `firebase`, `tsc`, or any test runner — the attempt is auto-denied and aborts your run with no output. Write files only. The orchestrator runs all gates and reports results back to you.

## Context

**Resolves:** F29 — all eighteen pages are eagerly imported; there is no route-level code splitting.

`src/App.tsx` opens with seventeen static page imports. `React.lazy` and `Suspense` appear nowhere in the codebase. Everything ships in one bundle: the 572-line `LandingPage`, the 564-line `DashboardPage`, every form page, plus `recharts` (only the dashboard uses it) and the heavier `framer-motion` surfaces.

The practical cost falls on the worst-affected visitor: someone who lands on the public marketing page, logged out, downloads the entire authenticated application — every page, every chart library — before seeing the hero section.

**This spec runs after spec 09**, which converts `App.jsx` to `App.tsx`, adds the error boundaries, and adds the catch-all route. Both specs rewrite the same file. Read the current `src/App.tsx` before starting — the code quoted below is the post-spec-09 shape and you must verify it against what is actually there.

## Scope

**Modify:**
- `src/App.tsx`

**Create:**
- `src/components/ui/RouteFallback.tsx`

**Must NOT be touched:**
- `src/main.tsx` — spec 09 owns the root boundary
- `src/components/layout/Layout.tsx` — spec 09 owns the per-route boundary
- `vite.config.js` — see Requirement 7
- Any page or component under `src/pages/` or `src/components/` other than the new fallback
- Anything under `src/services/`, `src/contexts/`, `functions/`, or `shared/`

**Out of scope:** manual chunk configuration, prefetch/preload hints, splitting `recharts` or `framer-motion` out by hand, converting any page's own imports to dynamic ones, image or font optimisation.

## Existing code

### `src/App.tsx` — the import block (post-spec-09; verify)
```tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ViewportProvider } from "@/contexts/ViewportContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { SpaceProvider } from "@/contexts/SpaceContext";
import { CategoryProvider } from "@/contexts/CategoryContext";
import { TransactionProvider } from "@/contexts/TransactionContext";
import { RecurrenceProvider } from "@/contexts/RecurrenceContext";
import Layout from "@/components/layout/Layout";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import LandingPage from "@/pages/LandingPage";
import DashboardPage from "@/pages/DashboardPage";
import SubscriptionsPage from "@/pages/SubscriptionsPage";
import SubscriptionFormPage from "@/pages/SubscriptionFormPage";
import HistoryPage from "@/pages/HistoryPage";
import SettingsPage from "@/pages/SettingsPage";
import AboutPage from "@/pages/AboutPage";
import HowToPage from "@/pages/HowToPage";
import ComingSoonPage from "@/pages/ComingSoonPage";
import SpacesPage from "@/pages/SpacesPage";
import CategoriesPage from "@/pages/CategoriesPage";
import TransactionsPage from "@/pages/TransactionsPage";
import TransactionFormPage from "@/pages/TransactionFormPage";
import TransactionDetailPage from "@/pages/TransactionDetailPage";
import RecurrencesPage from "@/pages/RecurrencesPage";
// plus NotFoundPage, added by spec 09
```

### The router structure
```tsx
const App = () => (
  <ThemeProvider>
    <ViewportProvider>
      <Router basename="/SubTracker">
        <AuthProvider>
          <Routes>
            <Route path="/" element={<RootRoute />} />
            <Route path="/login" element={<PublicAuthRoute><LoginPage /></PublicAuthRoute>} />
            <Route path="/signup" element={<PublicAuthRoute><SignupPage /></PublicAuthRoute>} />
            <Route path="/*" element={
              <SubscriptionProvider><SpaceProvider><CategoryProvider>
                <TransactionProvider><RecurrenceProvider>
                  <Layout>
                    <Routes>
                      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                      <Route path="/subscriptions" element={<ProtectedRoute><SubscriptionsPage /></ProtectedRoute>} />
                      <Route path="/subscriptions/add" element={<ProtectedRoute><SubscriptionFormPage /></ProtectedRoute>} />
                      <Route path="/subscriptions/:id" element={<ProtectedRoute><SubscriptionFormPage /></ProtectedRoute>} />
                      <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
                      <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                      <Route path="/spaces" element={<ProtectedRoute><SpacesPage /></ProtectedRoute>} />
                      <Route path="/categories" element={<ProtectedRoute><CategoriesPage /></ProtectedRoute>} />
                      <Route path="/transactions" element={<ProtectedRoute><TransactionsPage /></ProtectedRoute>} />
                      <Route path="/transactions/add" element={<ProtectedRoute><TransactionFormPage /></ProtectedRoute>} />
                      <Route path="/transactions/:id/edit" element={<ProtectedRoute><TransactionFormPage /></ProtectedRoute>} />
                      <Route path="/transactions/:id" element={<ProtectedRoute><TransactionDetailPage /></ProtectedRoute>} />
                      <Route path="/recurrences" element={<ProtectedRoute><RecurrencesPage /></ProtectedRoute>} />
                      <Route path="/about" element={<AboutPage />} />
                      <Route path="/how-to" element={<HowToPage />} />
                      <Route path="/coming-soon" element={<ComingSoonPage />} />
                      <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                  </Layout>
                </RecurrenceProvider></TransactionProvider>
              </CategoryProvider></SpaceProvider></SubscriptionProvider>
            } />
          </Routes>
        </AuthProvider>
      </Router>
    </ViewportProvider>
  </ThemeProvider>
);
```
Note `RootRoute` renders `<LandingPage />` directly for logged-out visitors, and `SubscriptionFormPage` and `TransactionFormPage` each serve two routes.

### The existing loading spinner, to match visually — `src/App.tsx` (`RootRoute`)
```tsx
<div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
  <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
</div>
```
And the in-layout variant used by pages — `src/pages/TransactionFormPage.tsx:204-209`:
```tsx
<div className="flex items-center justify-center min-h-64">
  <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
</div>
```

### `vite.config.js` — complete, for reference
```js
export default defineConfig({
  plugins: [react()],
  base: "/SubTracker/",
  server: { port: Number(process.env.PORT) || 5173 },
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  css: { preprocessorOptions: { scss: { additionalData: `@use "@/styles/_variables.scss" as *;` } } },
  test: { environment: "jsdom", globals: true, setupFiles: ["./src/test/setup.ts"] },
});
```
No `build.rollupOptions` — Vite's default chunking applies.

## Requirements

1. **`LoginPage`, `SignupPage`, and `LandingPage` stay statically imported.** They are the first paint for an unauthenticated visitor; lazy-loading them adds a network round trip to the very page this change is meant to speed up. `Layout`, all contexts, and the route guards likewise stay static.

2. **Every other page becomes `React.lazy`.** That is `DashboardPage`, `SubscriptionsPage`, `SubscriptionFormPage`, `HistoryPage`, `SettingsPage`, `SpacesPage`, `CategoriesPage`, `TransactionsPage`, `TransactionFormPage`, `TransactionDetailPage`, `RecurrencesPage`, `AboutPage`, `HowToPage`, `ComingSoonPage`, and `NotFoundPage`:
   ```tsx
   const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
   ```
   Every page uses a default export, so no `.then(m => ({ default: m.X }))` shim is needed. Verify that before relying on it.

3. **`SubscriptionFormPage` and `TransactionFormPage` are each declared as a single `lazy()` constant** reused across their two and three routes respectively. Declaring them twice would produce two chunks of the same module.

4. **Create `src/components/ui/RouteFallback.tsx`** — the `Suspense` fallback. It renders the in-layout spinner shape above (`min-h-64`, `w-8 h-8`), not the full-screen one, because it renders inside `Layout`'s `<main>`. It takes no required props. Give it `role="status"` and an `aria-label` from `t("common.loading", "Loading...")` — spec 11 adds that key; if it is absent, add it to both locale files.

5. **One `<Suspense>` wraps the inner `<Routes>`**, inside `Layout` and inside the error boundary spec 09 placed there, with `fallback={<RouteFallback />}`. Do not wrap each route individually — that produces fifteen boundaries where one suffices, and makes the fallback flash on every navigation.

6. **The public routes outside `/*` gain no `Suspense`**, because Requirement 1 keeps them static. Do not add one "just in case".

7. **Do not add `build.rollupOptions.manualChunks` to `vite.config.js`.** Vite's default splitting already emits a chunk per dynamic import and hoists shared dependencies. Hand-tuning chunk boundaries without measuring is exactly the speculative work this spec is not doing. If you believe a manual chunk is essential, say so in your report and leave the config alone.

8. **Route order and guard nesting do not change.** `ProtectedRoute` still wraps each protected element; the catch-all `path="*"` stays last; the provider stack keeps its order and nesting.

9. **The error boundary must remain outside `Suspense`.** A chunk that fails to load (a stale deploy, a dropped connection) throws during render; the boundary spec 09 added to `Layout` is what catches it. Verify the nesting order is `ErrorBoundary` → `Suspense` → `Routes`, not the reverse — if it is inverted, a failed chunk load blanks the page again and reintroduces F21 for exactly the case this spec creates.

10. **No page component is modified.** If a page turns out to have a named-only export or a side-effectful import that breaks under `lazy`, stop and report rather than editing the page.

## Conventions to follow

- **Imports use the `@/` alias**, configured in `vite.config.js`:
  ```tsx
  import DashboardPage from "@/pages/DashboardPage";
  ```
  Keep the alias in the dynamic form: `lazy(() => import("@/pages/DashboardPage"))`.
- **React imports are named:** `import { lazy, Suspense } from "react";`
- **Default export for components:**
  ```tsx
  const RouteFallback = () => { /* ... */ };
  export default RouteFallback;
  ```
- **Tailwind classes carry light and dark variants:** `bg-background-light dark:bg-background-dark`, `border-primary/30 border-t-primary`.
- **Translation calls pass an English default:** `t("common.loading", "Loading...")`.
- **Spinner markup** in this project is a bordered div with `animate-spin` — reuse the exact class list quoted above rather than inventing a new one.

## Tests required

**None.** Code splitting is a build-time concern with no behavioural assertion that a jsdom unit test can make honestly — `React.lazy` resolves modules synchronously enough under Vitest that a passing test would prove nothing about the emitted bundle. Do not write a test that merely renders a lazy route and asserts it appears; that is a test written to pass.

Existing tests must continue to pass unchanged. If any existing test imports `App` and breaks under `Suspense`, report it rather than adjusting the test to hide it.

The real verification is the build output, which the orchestrator inspects — see below.

## Definition of done

```
npm run lint
npm run test
npm run build
```

The orchestrator additionally checks the `dist/assets/` output and expects:
- **more than one JavaScript chunk** (today the build emits essentially one)
- a chunk containing `recharts` that is **not** the entry chunk
- the entry chunk measurably smaller than before this change

State in your report what you expect the chunk layout to look like, so the orchestrator can compare against it.

## Constraints

- **No new dependencies without asking first.** `lazy` and `Suspense` are React built-ins.
- **No reformatting of untouched lines.** This is a change to the import block plus one `<Suspense>` wrapper. The route JSX itself should be diff-identical apart from that wrapper.
- **No refactors beyond the listed files.**
- **Do not modify `vite.config.js`.**
- **Do not add prefetch, preload, or route-prefetch-on-hover behaviour.** Out of scope.
- Do not lazy-load `Layout`, `Header`, `Sidebar`, `BottomTabBar`, any context, or any `src/components/core` primitive.

## Report back

1. The implementation.
2. Your approach — which pages you left static and why, and where exactly you placed `Suspense` relative to the error boundary.
3. Anything skipped, blocked, or decided differently. **Specifically: (a) confirmation that every lazily-loaded page has a default export, (b) the chunk layout you expect the build to produce, and (c) whether the `ErrorBoundary` → `Suspense` → `Routes` nesting in Requirement 9 was already correct or needed reordering.**
