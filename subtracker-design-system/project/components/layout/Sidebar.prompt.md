Desktop nav rail — sectioned links (Overview / Money / Organize / Activity / Account) with a full-width gradient "Add Subscription" CTA pinned at the bottom.

```jsx
<Sidebar activePath="/dashboard" collapsed={false} />
```

Collapses to a 72px icon rail (`collapsed`) — labels and section headers fade out first, then width animates, so text never visibly wraps mid-transition (see motion-spec.md §5). On mobile the source renders this as a slide-out drawer instead (see BottomTabBar for the mobile nav pattern).
