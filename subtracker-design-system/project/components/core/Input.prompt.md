Labeled text input matching every form field in the app (subscription name, amount, tag entry, etc).

```jsx
<Input label="Subscription Name *" placeholder="e.g. Netflix, ChatGPT Plus" />
<Input label="Price *" type="number" error="Amount must be greater than 0." />
```

Built on the `.input-field` / `.label-text` classes shared by every form in the codebase (subscription, transaction, category, space, recurrence forms). Focus state is a 3px primary-tinted ring; error renders a small red caption below.
