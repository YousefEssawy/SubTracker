The app's single card container — used for every stat block, list panel, and dashboard tile.

```jsx
<Card>
  <p>Monthly burn rate</p>
  <p className="figure">E£ 4,230.00</p>
</Card>
```

Wraps `.glass-card`: white/dark surface, 16px radius, subtle border + soft shadow (no shadow in dark mode — borders carry the separation instead). This is intentionally the ONLY card style in SubTracker — don't invent card variants (outlined, elevated, etc).
