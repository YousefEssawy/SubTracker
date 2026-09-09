Pill-shaped button in three visual weights, for primary actions, secondary/cancel actions, and destructive actions.

```jsx
<Button variant="primary" onClick={handleSave}>Save Subscription</Button>
<Button variant="secondary" onClick={onClose}>Cancel</Button>
<Button variant="danger" onClick={handleDelete}>Delete</Button>
```

Variants: `primary` (gradient fill + glow shadow, for the main CTA per screen), `secondary` (neutral gray, for cancel/dismiss), `danger` (solid red, for destructive confirms). Sizes: `sm` / `md` / `lg`. Not built by the source as a component — it applies `.btn-primary` etc. directly to native `<button>` tags; this wraps that same CSS for reuse.
