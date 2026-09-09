# Spec 12 — One accessible modal primitive, and form labels that work (W11)

> **You cannot run shell commands in this environment.** Do not attempt `npm`, `git`, `firebase`, `tsc`, or any test runner — the attempt is auto-denied and aborts your run with no output. Write files only. The orchestrator runs all gates and reports results back to you.

## Context

**Resolves:** F35 (modals are not keyboard-accessible: no Escape, no focus trap, no dialog semantics), F42 (`Input` and `Select` render labels that are never associated with their control).

**F42 is the cheapest high-value fix in the whole plan.** `src/components/core/Input.tsx` and `Select.tsx` wire `<label htmlFor={id}>` to `<input id={id}>` — but `id` is optional and **no caller passes it**. All eleven usage sites across `src/pages/` and `src/components/` pass `label` and `name` only. Both attributes resolve to `undefined`, so every label in every form built on these primitives is decorative: clicking it does not focus the field, and a screen reader announces the input as unlabelled.

**F35** covers four modal surfaces. `src/components/ui/ConfirmDialog.tsx` is the shared one and is the best of them, but it still has no `role="dialog"`, no `aria-modal`, no labelling, no Escape handler, and no focus management. The three ad-hoc copies in `SpacesPage`, `CategoriesPage`, and `RecurrencesPage` have the same gaps, plus `RecurrenceForm`'s own overlay — which additionally has no backdrop-click close.

**This spec runs before spec 10.** Spec 10 deletes the three duplicate dialogs and migrates those pages onto the shared component; it needs the shared component to already be good, and to already have the `loading` prop the local copies rely on. Your job is the primitive and the two core inputs — **not** the migration.

## Scope

**Create:**
- `src/components/ui/Modal.tsx` — the accessible primitive
- `src/hooks/useFocusTrap.ts`
- `src/components/ui/__tests__/Modal.test.tsx`
- `src/components/core/__tests__/Input.test.tsx`

**Modify:**
- `src/components/core/Input.tsx`
- `src/components/core/Select.tsx`
- `src/components/ui/ConfirmDialog.tsx`
- `src/components/finance/RecurrenceForm.tsx`
- `src/components/finance/SpaceForm.tsx`
- `src/components/finance/CategoryForm.tsx`
- `src/locales/en/translation.json`
- `src/locales/ar/translation.json`

**Must NOT be touched:**
- `src/pages/SpacesPage.tsx`, `src/pages/CategoriesPage.tsx`, `src/pages/RecurrencesPage.tsx` — their local dialogs are **spec 10's** to delete. Leave them exactly as they are, duplicated and inaccessible, even though it is tempting.
- `src/pages/SubscriptionsPage.tsx` — it already consumes `ConfirmDialog` correctly; its call site must keep working unchanged
- Anything under `src/services/`, `functions/`, or `shared/`

**Out of scope:** the dialog de-duplication (spec 10), translating existing strings (spec 11 — but any *new* string you add needs keys in both locales), visual redesign of any modal.

## Existing code

### `src/components/core/Input.tsx` — complete
```tsx
import type { InputHTMLAttributes } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = ({ label, error, className = "", id, ...rest }: InputProps) => {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="label-text">
          {label}
        </label>
      )}
      <input id={id} className={`input-field ${className}`.trim()} {...rest} />
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
};

export default Input;
```

### `src/components/core/Select.tsx` — complete
```tsx
import type { SelectHTMLAttributes } from "react";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

const Select = ({ label, children, className = "", id, ...rest }: SelectProps) => {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="label-text">
          {label}
        </label>
      )}
      <select id={id} className={`select-field ${className}`.trim()} {...rest}>
        {children}
      </select>
    </div>
  );
};

export default Select;
```

### A representative call site — `src/pages/SubscriptionFormPage.tsx:155-176`
```tsx
<Input
  label={t("subscriptionForm.name")}
  name="name"
  value={form.name}
  onChange={handleChange}
  placeholder={t("subscriptionForm.namePlaceholder")}
  required
/>
<Input
  label={t("subscriptionForm.price")}
  name="price"
  type="number"
  step="0.01"
  min="0"
  value={form.price}
  onChange={handleChange}
  placeholder="199.00"
  required
/>
```
No `id`. `name` is present and unique within each form.

### `src/components/ui/ConfirmDialog.tsx` — complete
```tsx
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineExclamationTriangle } from "react-icons/hi2";
import { useTranslation } from "react-i18next";

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning";
}

const ConfirmDialog = ({
  isOpen, onClose, onConfirm, title, message, confirmText, cancelText,
  variant = "danger",
}: ConfirmDialogProps) => {
  const { t } = useTranslation();
  if (!isOpen) return null;

  const resolvedTitle = title ?? t("common.confirmDialog.title", "Are you sure?");
  const resolvedMessage = message ?? t("common.confirmDialog.message", "This action cannot be undone.");
  const resolvedConfirmText = confirmText ?? t("common.confirmDialog.confirm", "Delete");
  const resolvedCancelText = cancelText ?? t("common.confirmDialog.cancel", "Cancel");

  const variantStyles = {
    danger:  { icon: "bg-danger/10 text-danger",   button: "bg-danger hover:bg-red-600 focus:ring-danger/50" },
    warning: { icon: "bg-warning/10 text-warning", button: "bg-warning hover:bg-amber-600 focus:ring-warning/50" },
  };
  const styles = variantStyles[variant] || variantStyles.danger;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="relative w-full max-w-sm glass-card p-6 shadow-2xl"
          >
            <div className="flex flex-col items-center text-center">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${styles.icon}`}>
                <HiOutlineExclamationTriangle className="w-7 h-7" />
              </div>
              <h3 className="font-display text-lg font-semibold tracking-tight text-gray-900 dark:text-white mb-2">
                {resolvedTitle}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{resolvedMessage}</p>
              <div className="flex items-center gap-3 w-full">
                <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border …">
                  {resolvedCancelText}
                </button>
                <button
                  onClick={() => { onConfirm(); onClose(); }}
                  className={`flex-1 px-4 py-2.5 rounded-xl text-white font-medium text-sm … ${styles.button}`}
                >
                  {resolvedConfirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDialog;
```
Note `if (!isOpen) return null;` sits **above** the `<AnimatePresence>`, so the exit animation can never run — the component unmounts before `AnimatePresence` sees `isOpen` go false. Fix this while you are here.

### The `loading` prop the duplicates rely on — `src/pages/SpacesPage.tsx:18-27`
```tsx
const ConfirmDialog = ({ spaceName, onConfirm, onCancel, loading }: {
  spaceName: string; onConfirm: () => void; onCancel: () => void; loading: boolean;
}) => { /* ... */ };
```
Spec 10 will migrate these pages onto your shared component and needs an equivalent.

### `src/components/finance/RecurrenceForm.tsx:115-127` — the least accessible overlay
```tsx
<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
  <div className="bg-white dark:bg-surface-dark rounded-2xl border border-gray-200 dark:border-gray-800 w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
    <div className="flex items-center justify-between mb-5">
      <h2 className="font-display text-lg font-bold tracking-tight text-gray-900 dark:text-gray-100">
        {t("finance.recurrences.addRecurrence", "Add Recurrence")}
      </h2>
      <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 …">
        <HiOutlineXMark className="w-5 h-5" />
      </button>
    </div>
    <form onSubmit={handleSubmit} className="space-y-4">
```
No `role`, no Escape, no focus trap, no backdrop click.

### `src/components/finance/CategoryForm.tsx:1-25` — the form-modal shape shared with `SpaceForm`
```tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineXMark } from "react-icons/hi2";
import { useTranslation } from "react-i18next";
import Button from "@/components/core/Button";
import type { Category, CategoryInput } from "@/models";

interface CategoryFormProps {
  category?: Category | null;
  onSubmit: (data: CategoryInput) => Promise<void>;
  onClose: () => void;
  loading?: boolean;
}
```

### `src/i18n.js:38-44` — RTL is real here, so focus order and arrow keys matter
```js
i18n.on("languageChanged", (lng) => {
  const dir = lng === "ar" ? "rtl" : "ltr";
  document.documentElement.dir = dir;
  document.documentElement.lang = lng;
});
```

## Requirements

### Form labels (F42)

1. **`Input` derives an `id` when none is given.** Precedence: an explicit `id` prop wins; otherwise fall back to the `name` prop; otherwise generate one with React's `useId()`. The same resolved value goes to both `htmlFor` and `id`.

2. **`Select` does the same**, by the same precedence.

3. **`Input` wires its error message to the control** with `aria-describedby` pointing at the error paragraph's `id` (derive it from the resolved control id, e.g. `${id}-error`), and sets `aria-invalid="true"` when `error` is present. Neither attribute appears when there is no error.

4. **No call site changes.** All eleven existing usages must keep working untouched. Do not add `id` props to callers.

### Modal primitive (F35)

5. **Create `src/components/ui/Modal.tsx`** — a presentational primitive that owns the accessibility behaviour and nothing else. Props: `isOpen`, `onClose`, `children`, `labelledBy?: string`, `label?: string`, `initialFocusRef?: RefObject<HTMLElement>`, `closeOnBackdrop?: boolean` (default `true`), and `className?` for the panel. It must:
   - render the backdrop and a panel with `role="dialog"` and `aria-modal="true"`
   - carry an accessible name: `aria-labelledby={labelledBy}` when given, else `aria-label={label}`. Warn via `console.warn` in dev when neither is supplied.
   - close on **Escape**
   - close on backdrop click when `closeOnBackdrop`, without closing on a click that started inside the panel and released on the backdrop (check the event target is the backdrop itself, as the existing local dialogs do with `e.target === e.currentTarget`)
   - move focus into the panel on open — to `initialFocusRef` if given, else the first tabbable element, else the panel itself
   - **restore focus to the previously focused element on close**
   - trap Tab and Shift+Tab within the panel
   - set `aria-hidden` / `inert` on the app root while open, or otherwise prevent background content from receiving focus
   - lock body scroll while open and restore it on close, restoring the prior value rather than hardcoding `""`
   - keep the existing `framer-motion` enter/exit animation style and the `z-[100]` layering

6. **Create `src/hooks/useFocusTrap.ts`** holding the trap and focus-restore logic, so `Modal` stays readable. It takes the panel ref and an `active` flag.

7. **Nested modals are not supported and must fail loudly.** If a second `Modal` opens while one is already open, `console.warn` in dev. Do not build a modal stack.

### Migration of the three components you own

8. **`ConfirmDialog` is rebuilt on `Modal`**, keeping its exported `ConfirmDialogProps` **and its current call signature** so `SubscriptionsPage.tsx:431-440` keeps working with no edit. Additions:
   - a **new optional `loading?: boolean`** prop. When true, both buttons are disabled and the confirm button shows a busy state. Spec 10 depends on this existing.
   - the title element gets an `id` passed to `Modal` as `labelledBy`
   - the confirm button receives initial focus for `variant="warning"`; for `variant="danger"` the **cancel** button receives initial focus, so an accidental Enter does not delete
   - fix the `if (!isOpen) return null;` placement so `AnimatePresence` can run the exit animation
   - `onConfirm` no longer calls `onClose` automatically when `loading` is supported — see Requirement 11

9. **`RecurrenceForm`, `SpaceForm`, and `CategoryForm` render their overlay through `Modal`**, keeping their existing props, markup, and styling inside it. Their heading elements get ids used as `labelledBy`. `RecurrenceForm` gains Escape and backdrop-close behaviour it currently lacks.

10. **A form modal with unsaved input does not close on backdrop click.** For `RecurrenceForm`, `SpaceForm`, and `CategoryForm`, pass `closeOnBackdrop={false}` while a submit is in flight (`loading`). Escape and the explicit close button still work — a stuck modal is worse than a lost draft.

11. **`ConfirmDialog`'s confirm handler behaviour is explicit.** Today it calls `onConfirm()` then `onClose()` unconditionally, which is why the local copies added `loading`. Keep the auto-close **only when `loading` is not passed**, so existing callers are unaffected; when `loading` is passed, leave closing to the caller. Document this in a comment on the props interface.

12. **New user-visible strings use `t()` with an English default and keys in both locale files.** At minimum a busy-state label for the confirm button and an accessible close-button label (`aria-label`) for the form modals.

## Conventions to follow

- **Default export for components, named export for the props interface:**
  ```tsx
  export interface ConfirmDialogProps { /* ... */ }
  const ConfirmDialog = (props: ConfirmDialogProps) => { /* ... */ };
  export default ConfirmDialog;
  ```
- **Hooks live in `src/hooks/`** and are named exports (`src/hooks/useUserSettings.ts` from spec 03 is the precedent).
- **Tailwind classes carry light and dark variants:** `bg-white dark:bg-surface-dark`, `text-gray-900 dark:text-gray-100`.
- **RTL-aware icons** use `rtl:-scale-x-100` — see `TransactionDetailPage.tsx:58`.
- **Translation calls pass an English default:** `t("common.confirmDialog.cancel", "Cancel")`.
- **`framer-motion` overlays** use `initial`/`animate`/`exit` with the spring transition already in `ConfirmDialog`.
- **The project CSS classes `glass-card`, `input-field`, `select-field`, and `label-text` are global** — keep using them rather than inlining equivalents.

## Tests required

**`src/components/core/__tests__/Input.test.tsx`** — with `@testing-library/react` and `user-event` (both installed):
- given `label` and `name` but no `id`, the label is associated with the input — assert via `getByLabelText`
- clicking the label focuses the input
- an explicit `id` takes precedence over `name`
- with neither `id` nor `name`, a generated id still associates label and input
- with `error` set, the input has `aria-invalid="true"` and an `aria-describedby` resolving to the error text
- without `error`, neither attribute is present
- the equivalent association test for `Select`

**`src/components/ui/__tests__/Modal.test.tsx`**
- renders nothing when `isOpen` is false
- when open, the panel has `role="dialog"` and `aria-modal="true"`
- Escape calls `onClose`
- a click on the backdrop calls `onClose`; a click inside the panel does not
- `closeOnBackdrop={false}` suppresses the backdrop close but not Escape
- focus moves into the panel on open and **returns to the trigger element on close**
- Tab from the last tabbable element wraps to the first

## Definition of done

```
npm run lint
npm run test
npm run build
```

The orchestrator cannot run an automated accessibility audit (no axe dependency) or verify screen-reader output — it will say so in the review.

## Constraints

- **No new dependencies without asking first.** No `@headlessui/react`, no `react-modal`, no `focus-trap-react`, no `axe-core`. Write the trap.
- **No reformatting of untouched lines.**
- **No refactors beyond the listed files.** In particular do **not** touch `SpacesPage`, `CategoriesPage`, or `RecurrencesPage` — their duplicate dialogs are spec 10's work, and editing them here creates a conflict.
- **Do not change `ConfirmDialog`'s existing props or their semantics** beyond adding optional `loading`. `SubscriptionsPage` must not need an edit.
- Do not use the native `<dialog>` element — its `::backdrop` styling and `showModal()` lifecycle do not compose with `framer-motion`'s exit animations in this codebase.
- Do not add global keyboard listeners that survive unmount.

## Report back

1. The implementation.
2. Your approach — particularly the focus-trap mechanism, how you restore focus, and how you prevented background focus.
3. Anything skipped, blocked, or decided differently. **Specifically: (a) whether any of the eleven `Input`/`Select` call sites turned out to already pass an `id`, (b) how you handled the `onConfirm`/`onClose` compatibility split in Requirement 11, and (c) whether making the three form modals use `Modal` changed any existing visual behaviour.**
