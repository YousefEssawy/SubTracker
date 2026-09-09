# Spec 09 — Error boundaries, safe storage, 404, and TypeScript entry points (W8)

> **You cannot run shell commands in this environment.** Do not attempt `npm`, `git`, `firebase`, `tsc`, or any test runner — the attempt is auto-denied and aborts your run with no output. Write files only. The orchestrator runs all gates and reports results back to you.

## Context

**Resolves:** F21 (no React error boundary anywhere — one render throw blanks the app), F30 (`localStorage` accessed unguarded, white-screening at boot in blocked-storage contexts), F28 (no catch-all route — an unknown URL renders the shell with an empty content area), F43 (`TransactionDetailPage` renders a blank page for a missing transaction), F36 (`SettingsPage` has a `loading` flag with one clearing path guarded by a condition that can be false), F33 (the two files that wire the app together are untyped JS in an otherwise fully typed codebase).

Six defects that share one theme: **the app has no floor.** When something goes wrong it renders nothing at all, with no message and no way back.

`grep -rn "ErrorBoundary\|componentDidCatch" src/` returns no matches. Any uncaught render error unmounts the whole tree to a blank white page — including the five deliberate `throw new Error("useX must be used within XProvider")` guards the contexts raise.

**F21 and F30 must land together, in that order.** The `localStorage` throw is only a white screen *because* there is no boundary. Fix the boundary first and F30 degrades from "app is dead" to "theme preference lost".

## Scope

**Create:**
- `src/components/ui/ErrorBoundary.tsx`
- `src/utils/safeStorage.ts`
- `src/pages/NotFoundPage.tsx`
- `src/utils/__tests__/safeStorage.test.ts`
- `src/components/ui/__tests__/ErrorBoundary.test.tsx`

**Rename and modify:**
- `src/main.jsx` → `src/main.tsx`
- `src/App.jsx` → `src/App.tsx`

**Modify:**
- `src/contexts/ThemeContext.tsx`
- `src/i18n.js`
- `src/pages/TransactionDetailPage.tsx`
- `src/pages/SettingsPage.tsx`
- `src/components/layout/Layout.tsx`

**Must NOT be touched:**
- `index.html` — it references `/src/main.jsx`; see Requirement 3
- `vite.config.js`, `tsconfig.app.json` — see Requirement 3 before assuming otherwise
- Any service, or anything under `functions/` / `shared/`
- `src/pages/DashboardPage.tsx`, `src/pages/TransactionsPage.tsx`

**Out of scope:** route-level code splitting (spec 13 — it rewrites the same `App` file and runs *after* this one), translating existing hardcoded strings (spec 11), the attachment work on the detail page (spec 08).

## Existing code

### `src/main.jsx` — complete
```jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "../design_system/tokens.css";
import "./styles/globals.scss";
import "./i18n";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```
`document.getElementById("root")` is dereferenced without a null check — TypeScript will flag this once the file is `.tsx`.

### `src/App.jsx` — the route guards and the router shape
```jsx
// Redirect authenticated users away from auth-only pages (login/signup)
const PublicAuthRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
};

// Redirect unauthenticated users away from protected pages
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }
  return user ? children : <Navigate to="/login" replace />;
};

const RootRoute = () => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }
  return user ? <Navigate to="/dashboard" replace /> : <LandingPage />;
};

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
                      {/* ... 12 more protected routes ... */}
                      <Route path="/about" element={<AboutPage />} />
                      <Route path="/how-to" element={<HowToPage />} />
                      <Route path="/coming-soon" element={<ComingSoonPage />} />
                      {/* ← no path="*" here (F28) */}
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
`ProtectedRoute`'s `"Loading..."` string is hardcoded English — leave it; spec 11 owns that.

### `src/contexts/ThemeContext.tsx:24-41` — the unguarded boot-time read
```tsx
export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem("subtracker-theme");   // ← throws in blocked-storage contexts
    return (saved === "dark" ? "dark" : "light") as Theme;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("subtracker-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === "light" ? "dark" : "light"));
  ...
};
```

### `src/i18n.js:38-56` — module-scope access, before React mounts
```js
i18n.on("languageChanged", (lng) => {
  const dir = lng === "ar" ? "rtl" : "ltr";
  document.documentElement.dir = dir;
  document.documentElement.lang = lng;
  localStorage.setItem("i18nextLng", lng);
});

const storedLng = localStorage.getItem("i18nextLng");     // ← runs at import time
const currentLng = storedLng || i18n.language || "en";

if (storedLng !== currentLng) {
  localStorage.setItem("i18nextLng", currentLng);
}

document.documentElement.dir = currentLng === "ar" ? "rtl" : "ltr";
document.documentElement.lang = currentLng;
```
The i18next `LanguageDetector` is separately configured with `caches: ["localStorage"]` — that is inside the library and out of scope.

### `src/pages/TransactionDetailPage.tsx:23-41` — the blank page
```tsx
useEffect(() => {
  if (!id || !user) return;
  getTransaction(user.uid, id)
    .then((tx) => { setTransaction(tx); })
    .catch(() => navigate("/transactions"))
    .finally(() => setLoading(false));
}, [id, user, navigate]);

if (loading) {
  return (
    <div className="flex items-center justify-center min-h-64">
      <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );
}

if (!transaction) return null;      // ← chrome with an empty content area (F43)
```
`getTransaction` resolves `null` for a nonexistent id (`transactionService.ts:151-159`). Compare `TransactionFormPage.tsx:72-76`, which handles it correctly:
```tsx
.then((tx) => {
  if (!tx) { navigate("/transactions"); return; }
  ...
})
```

### `src/pages/SettingsPage.tsx:29-48` — the flag that can never clear
```tsx
useEffect(() => {
  if (user) {
    (async () => {
      try {
        const data = await getUserSettings(user.uid);
        if (data) { setSettings({ ... }); }
      } catch (err) {
        console.error(err);
        toast.error(t("settings.loadError", "Failed to load settings."));
      }
      setLoading(false);
    })();
  }
  // ← no else branch (F36)
}, [user, t]);
```

### `src/components/layout/Layout.tsx` — where the per-route boundary goes
```tsx
const Layout = ({ children }: LayoutProps) => {
  const { isDesktop } = useViewport();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  ...
  return (
    <div className="h-screen flex flex-col bg-background-light dark:bg-background-dark overflow-hidden">
      <Header onMenuToggle={handleMenuToggle} />
      <div className="flex flex-1 min-h-0">
        <Sidebar isDrawerOpen={mobileDrawerOpen} isCollapsed={sidebarCollapsed}
                 onClose={() => setMobileDrawerOpen(false)} />
        <main className="flex-1 min-w-0 overflow-y-auto">
          <div className="page-container pb-24 lg:pb-6">
            <motion.div key={location.pathname}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}>
              {children}
            </motion.div>
          </div>
        </main>
      </div>
      <BottomTabBar />
    </div>
  );
};
```

### An existing full-page empty state to match — `src/pages/TransactionsPage.tsx:12-38`
```tsx
const EmptyNoData = ({ onAdd }: { onAdd: () => void }) => {
  const { t } = useTranslation();
  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
        <HiOutlineBanknotes className="w-10 h-10 text-primary" />
      </div>
      <h3 className="font-display text-lg font-semibold tracking-tight text-gray-800 dark:text-gray-200 mb-2">
        {t("finance.transactions.noTransactions", "No transactions yet")}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mb-6">
        {t("finance.transactions.noTransactionsDesc", "Record your first income or expense transaction to get started.")}
      </p>
      <Button onClick={onAdd} className="flex items-center gap-2">
        <HiOutlinePlus className="w-4 h-4" />
        {t("finance.transactions.addTransaction", "Add Transaction")}
      </Button>
    </motion.div>
  );
};
```

### `src/components/core/Button.tsx` exists and is the standard button — import it rather than hand-rolling.

## Requirements

1. **Create `src/components/ui/ErrorBoundary.tsx`** — a class component (React has no hook equivalent) implementing `getDerivedStateFromError` and `componentDidCatch`. Props: `children`, an optional `fallback?: ReactNode`, and an optional `onReset?: () => void`. It must:
   - log the error and the component stack with `console.error`
   - render a recoverable fallback: a heading, a short message, and a "Try again" button that clears the error state and re-renders `children`
   - expose a `resetKey?: string | number` prop; when it changes, the boundary clears its error state automatically (this is how a route change recovers the per-route boundary)
   - never render raw error text to the user in production; put the message behind `import.meta.env.DEV`

2. **A root boundary wraps the entire app** in `main.tsx`, outside `<App />` but inside `<StrictMode>`, so a throw in any provider is caught.

3. **`main.jsx` → `main.tsx` and `App.jsx` → `App.tsx`.** Vite resolves `index.html`'s `<script type="module" src="/src/main.jsx">` literally — **update that one attribute in `index.html`** to point at `main.tsx`. This is the single permitted edit to `index.html`; make no other change to it. Verify no other file imports `./App` or `./main` by extension.

4. **`main.tsx` null-checks the root element.** `document.getElementById("root")` may be `null`; throw an explicit `Error("Root element #root not found")` rather than using a non-null assertion.

5. **The three route guards in `App.tsx` are typed.** Give each a props interface with `children: ReactNode` and annotate the return. No `any`, no implicit `any`.

6. **A per-route boundary sits inside `Layout`**, wrapping `{children}` inside the `motion.div`, with `resetKey={location.pathname}`. A page crash must leave the header, sidebar, and bottom tab bar usable so the user can navigate away.

7. **Create `src/pages/NotFoundPage.tsx`** in the empty-state style quoted above: icon tile, heading, description, and a `Button` linking to `/dashboard`. All strings via `t()` with English defaults, keys added to both locale files under a new `notFound` top-level key.

8. **A catch-all route renders it.** Add `<Route path="*" element={<NotFoundPage />} />` as the **last** route inside the inner `<Routes>` in `App.tsx`. Do not add one to the outer `<Routes>` — the outer `/*` already delegates everything.

9. **Create `src/utils/safeStorage.ts`** exporting `getItem(key): string | null`, `setItem(key, value): void`, and `removeItem(key): void`. Every one wraps the `localStorage` call in `try/catch`; on failure `getItem` returns `null` and the writers no-op. Do not log on every call — a blocked-storage browser would flood the console; log at most once per session behind a module-level flag.

10. **`ThemeContext` and `i18n.js` use `safeStorage`** for every `localStorage` access. The theme initializer must return `"light"` when storage is unavailable, and the app must render normally.

11. **`TransactionDetailPage` renders a not-found state** instead of `return null`. Reuse `NotFoundPage`'s presentation or render an inline equivalent with a "Back to transactions" action. Also set `setLoading(true)` when `id` changes, so navigating between two detail pages does not briefly show the previous transaction.

12. **`SettingsPage` clears `loading` in every path** — add the missing `else { setLoading(false); }`.

13. **No behaviour change to authentication, routing order, or the provider nesting.** The five providers stay in their current order; `/`, `/login`, and `/signup` keep their current guards.

## Conventions to follow

- **Named exports for utilities, default export for components:**
  ```ts
  export const getItem = (key: string): string | null => { ... };
  ```
  ```tsx
  const NotFoundPage = () => { ... };
  export default NotFoundPage;
  ```
- **Props typed with an exported interface** where the component is reusable:
  ```tsx
  export interface ConfirmDialogProps { isOpen: boolean; onClose: () => void; /* ... */ }
  ```
- **Translation calls pass an English default:** `t("notFound.title", "Page not found")`.
- **Locale files are nested by feature** — top-level keys today are `common`, `sidebar`, `header`, `comingSoon`, `dashboard`, `about`, `howTo`, `login`, `signup`, `settings`, `subscriptions`, `subscriptionForm`, `history`, `landing`, `finance`.
- **Tailwind classes always carry a dark variant**: `text-gray-800 dark:text-gray-200`, `bg-background-light dark:bg-background-dark`.
- **Page entry animations** use `framer-motion` with `initial`/`animate` as in the empty state above.
- **TypeScript strictness:** `tsconfig.app.json` compiles with `noUnusedLocals`-style strictness and the codebase uses bracket access for index signatures (`data["spaceId"]`). Match what the compiler demands rather than adding casts.

## Tests required

**`src/utils/__tests__/safeStorage.test.ts`**
- `getItem` returns the stored value normally
- `getItem` returns `null` — and does **not** throw — when `localStorage.getItem` throws (stub it with `vi.spyOn` and `mockImplementation(() => { throw new Error("SecurityError"); })`)
- `setItem` and `removeItem` swallow throws
- repeated failures log at most once

**`src/components/ui/__tests__/ErrorBoundary.test.tsx`** with `@testing-library/react`
- renders children when no error
- renders the fallback when a child throws, and the app root is still present (not blank)
- "Try again" clears the error and re-renders children
- changing `resetKey` clears the error state
Suppress React's expected `console.error` noise for the throwing-child cases.

## Definition of done

```
npm run lint      # eslint . && tsc --project tsconfig.app.json --noEmit
npm run test
npm run build
```

The typecheck is the real gate: converting `App.jsx`/`main.jsx` to TypeScript moves two previously-unchecked files under the compiler, and `npm run build` failing would mean the `index.html` entry point is wrong.

## Constraints

- **No new dependencies without asking first.** No `react-error-boundary` package — write the class component.
- **No reformatting of untouched lines.** `App.tsx` is a mechanical rename plus the typing, the catch-all route, and nothing else. Do not reorder routes, do not reformat the JSX nesting, do not "tidy" the provider stack.
- **No refactors beyond the listed files.**
- **Do not add `React.lazy` or `Suspense`** — spec 13 does that, to this same file, and doing it here guarantees a conflict.
- Do not modify `index.html` beyond the single `src` attribute in Requirement 3.

## Report back

1. The implementation.
2. Your approach — particularly the `resetKey` mechanism and how the root and per-route boundaries interact.
3. Anything skipped, blocked, or decided differently. **Specifically: (a) every type error the `.jsx` → `.tsx` conversion surfaced and how you resolved each, (b) confirmation that `index.html` now points at `main.tsx`, and (c) whether any file imported `./App` or `./main` with an explicit extension.**
