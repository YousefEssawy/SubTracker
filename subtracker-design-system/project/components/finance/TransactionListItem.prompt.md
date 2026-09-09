Single row for a transaction list — colored category badge, category + space + date, right-aligned signed amount.

```jsx
<TransactionListItem
  transaction={{ type: "Expense", amount: 120, currency: "EGP", transactionDate: "Jul 3" }}
  category={{ name: "Groceries", icon: "🛒", color: "#F59E0B" }}
  space={{ name: "Household", icon: "🏠", color: "#6366F1" }}
  onClick={() => navigate(`/transactions/${id}`)}
/>
```

Income renders green with a `+`, expense renders red with a `-`. Rows are meant to stack directly inside a `glass-card` list container (see FilterBar / History UI kit screens).
