# SubTracker — Motion Spec

Dev handoff for the redesign. Pencil mockups are static; this document specifies every
animated interaction so it can be implemented with `framer-motion` (already a dependency).

All durations/easings reference tokens already defined in [`tokens.css`](./tokens.css) —
never hardcode a new duration or curve outside this set.

```css
--duration-fast: 140ms;   /* micro-interactions: hover, toggle, tap */
--duration-base: 220ms;   /* default: most enter/exit transitions */
--duration-slow: 380ms;   /* modals, sheets, page transitions */
--ease-standard: cubic-bezier(0.34, 1.56, 0.64, 1);  /* gentle bounce — playful movement */
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);            /* plain deceleration — simple appear/dismiss */
```

Always wrap motion in a check for `prefers-reduced-motion: reduce` — when set, cut every
duration to `1ms` and skip transforms (opacity-only), never fully disable (state changes
must still be perceivable).

---

## 1. Dashboard hero numbers (count-up)

Applies to: `StatBlock` values (burn rate, next renewal, income, expense) and the big
number inside `RenewalDial`.

- On mount / on data change: animate the numeric value from `0` (or previous value) to
  the target over **`--duration-slow` (380ms)**, `--ease-out`.
- Use a `useMotionValue` + `useTransform` (framer-motion) driving `Math.round()`,
  formatted with the existing locale/currency formatter — never animate the raw string.
- Currency symbol and `%`/`days` suffixes do **not** animate — only the digits.
- Stagger the 4 `StatBlock`s by **60ms** each (`delay: i * 0.06`) so they don't all
  land at once.

## 2. Renewal Dial fill

Applies to: `RenewalDial` component (dashboard hero + subscription rows).

- The progress arc (`sweepAngle`) animates from `0` to its target sweep over
  **`--duration-slow` (380ms)**, `--ease-out`, on mount and whenever the underlying
  day-count changes.
- Color transition (success → warning → danger as renewal approaches) cross-fades over
  **`--duration-base` (220ms)** — never an instant color snap.
- The center number count-up (see §1) runs **concurrently**, not sequentially.

## 3. List stagger (subscriptions, transactions, categories, history)

Applies to: any vertical list of rows (`SubscriptionRow`, `TransactionRow`, category
rows, history rows).

- On initial mount or filter/sort change: each row fades + slides in
  (`opacity 0→1`, `y: 8px→0`), **`--duration-base` (220ms)**, `--ease-out`.
- Stagger children by **30ms** each, capped at a **10-row** stagger window — rows beyond
  the 10th all animate with the same max delay (don't make long lists take seconds to
  finish appearing).
- Row removal (delete a transaction/subscription): fade + collapse height over
  **`--duration-base` (220ms)**, `--ease-standard`, so the list reflows smoothly rather
  than jump-cutting.

## 4. Sheets & modals (mobile sheets, `ConfirmDialog`, forms-as-modal on web)

- Backdrop: fade `opacity 0→0.4`, **`--duration-base` (220ms)**, linear.
- Sheet (mobile, bottom-anchored): slide `y: 100%→0` + fade, **`--duration-slow` (380ms)**,
  `--ease-standard` (the slight overshoot reads as "settling into place").
- Modal (web, centered): scale `0.96→1` + fade, **`--duration-base` (220ms)**, `--ease-out`
  — no bounce on desktop modals, they should feel precise, not playful.
- Exit is always faster than enter: use `--duration-fast` (140ms) `--ease-out` for both
  sheet and modal dismissal.

## 5. Sidebar collapse (`AppSidebar`, web)

- Width transitions `260px ↔ 72px` over **`--duration-base` (220ms)**, `--ease-standard`.
- Nav item labels fade out **before** the width finishes collapsing (labels: 100ms fade,
  width: 220ms) — prevents text from visibly wrapping/clipping mid-transition.
- Icons never move position during the transition — only the label + section-header
  text fade and the container width changes.
- Active-item pill background follows the selected item with a shared-layout transition
  (`layoutId` in framer-motion) over **`--duration-base` (220ms)**, `--ease-standard`,
  rather than cross-fading in place — this is the one place a slight bounce reads as
  polish, not distraction.

## 6. Mobile tab bar

- Active tab icon/label color crossfade: **`--duration-fast` (140ms)**, linear.
- Active tab pill background: shared-layout transition (`layoutId`) sliding between
  tabs, **`--duration-base` (220ms)**, `--ease-standard`.
- Tap feedback: icon scales `1→0.9→1` over **`--duration-fast` (140ms)** on press.

## 7. FAB (floating add button)

- Entrance (on screens that have one): scale `0.8→1` + fade, **`--duration-base` (220ms)**,
  `--ease-standard`, delayed until the list stagger (§3) has mostly finished
  (`delay: 0.3s`) so it doesn't compete for attention.
- Press: scale to `0.94`, **`--duration-fast` (140ms)**.
- Expanding to a sheet/form: the FAB can morph into the sheet's top edge via a shared
  `layoutId` for a seamless origin — optional polish, not required for v1.

## 8. Toggles & switches (Settings)

- Track color crossfade + knob position: both animate together over
  **`--duration-fast` (140ms)**, `--ease-out`. Knob position uses `x` transform, not
  layout reflow, to stay performant.

## 9. Theme switch (light ↔ dark)

- Cross-fade all `background`/`fill`/`color` tokens over **`--duration-base` (220ms)**,
  linear — this is a global re-theme, not a playful moment, so no bounce.
- Do not animate `box-shadow` during the switch (shadows recalculating mid-transition
  looks noisy) — swap them at the midpoint (110ms) instead of interpolating.

## 10. Page-level transitions (route change)

- Outgoing page: fade `opacity 1→0`, **`--duration-fast` (140ms)**.
- Incoming page: fade + slight rise (`y: 6px→0`), **`--duration-base` (220ms)**,
  `--ease-out`, starting after the outgoing fade completes (sequential, not
  cross-dissolve — avoids a muddy double-exposure moment on data-dense screens).

---

## Reduced motion

Wrap every animation above in:

```js
const prefersReducedMotion = useReducedMotion(); // framer-motion hook
const duration = prefersReducedMotion ? 0.001 : baseDuration;
```

Under reduced motion: keep opacity fades (state changes must still be visible) but drop
every transform (slide/scale/bounce) and every count-up (numbers should just appear at
their final value).
