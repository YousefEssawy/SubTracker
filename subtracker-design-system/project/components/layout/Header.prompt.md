Sticky top bar — menu toggle (collapses Sidebar on desktop, opens drawer on mobile), logo that swaps light/dark variant with theme, current page title, language toggle (AR/EN), theme toggle, notification bell, profile avatar.

```jsx
<Header pageTitle="Dashboard" theme="light" onMenuToggle={toggleSidebar} onToggleTheme={toggleTheme} />
```

Swap the `theme` prop to `"dark"` to see the dark-mode logo variant swap (the app ships separate light/dark logo PNGs rather than recoloring one asset).
