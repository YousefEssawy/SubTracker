Centered modal confirming a destructive or risky action (delete subscription, delete space/category, etc).

```jsx
<ConfirmDialog
  isOpen={!!deleteTarget}
  onClose={() => setDeleteTarget(null)}
  onConfirm={handleDelete}
  title="Delete Subscription"
  message="Are you sure you want to delete this subscription? This action cannot be undone."
  variant="danger"
/>
```

`variant="danger"` (red icon/confirm button) for destructive actions, `variant="warning"` (amber) for reversible-but-risky ones. Backdrop is a blurred black scrim; clicking it or Cancel dismisses without confirming.
