Floating glass pill tab bar, fixed to the bottom of the viewport — the mobile equivalent of the Sidebar (hidden ≥1024px, `lg:hidden` in the source).

```jsx
<BottomTabBar activePath="/subscriptions" />
```

Active tab background is a shared-layout pill in production (framer-motion `layoutId`, sliding between tabs rather than cross-fading) — see motion-spec.md §6.
