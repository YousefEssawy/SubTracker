Small rounded pill for tags, active-filter chips, and status labels ("Income", "#groceries", "3 active").

```jsx
<Badge tone="primary">#groceries</Badge>
<Badge tone="success">Income</Badge>
<Badge tone="danger" onRemove={() => remove(tag)}>#streaming</Badge>
```

Tones map to the semantic palette (primary/success/warning/danger/neutral) at 10% background + 600-weight text, matching TagInput/FilterBar/CategoryForm chip styling. Pass `onRemove` to render a trailing ✕.
