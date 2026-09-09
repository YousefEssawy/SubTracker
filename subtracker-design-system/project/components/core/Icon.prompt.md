Renders one Heroicons v2 outline glyph by name, linked live from a CDN (no local SVG assets bundled).

```jsx
<Icon name="bell" size={20} />
<Icon name="arrow-trending-up" size={16} className="text-success" />
```

The full glyph name list matches https://heroicons.com (outline set) — use kebab-case, e.g. `arrow-path`, `credit-card`, `exclamation-triangle`. Every component below (ConfirmDialog, Pagination, Sidebar, etc.) uses this for its icons, exactly mirroring the app's `react-icons/hi2` usage.
