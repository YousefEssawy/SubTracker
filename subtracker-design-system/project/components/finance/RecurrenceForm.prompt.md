Modal for scheduling an automated recurring transaction (rent, salary, subscriptions billed outside the Subscriptions module) — space, category, amount, pattern + interval, start/end date.

```jsx
<RecurrenceForm spaces={spaces} categories={categories} onSubmit={handleCreate} onClose={close} />
```

Pattern is daily/weekly/monthly/yearly with a numeric "every N" interval (e.g. every 2 weeks). Category options are filtered by the selected Income/Expense type in production — this port shows the full list for simplicity.
