Top-level authenticated app shell — composes Header + Sidebar + a scrolling content region. Page content is passed as `children`.

```jsx
<Layout pageTitle="Dashboard" activePath="/dashboard">
  <DashboardScreen />
</Layout>
```

The only scrolling region is the content area — Header and Sidebar stay fixed. `BottomTabBar` is the mobile nav counterpart, shown separately below `1024px` rather than inside this component in the source (kept out of this composed shell to avoid double nav in the card preview).
