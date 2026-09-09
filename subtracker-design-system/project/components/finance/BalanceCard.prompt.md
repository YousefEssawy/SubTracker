Per-currency balance summary — income, expense, and net, one block per currency the user has transactions in.

```jsx
<BalanceCard variant="summary" balances={{ EGP: { balance: 2355, income: 4230, expense: 1875 } }} />
<BalanceCard variant="contextual" balances={balances} />
```

`summary` renders full glass cards in a grid (dashboard/transactions page). `contextual` renders a compact single-card list (sidebar rail). Multiple currencies render side by side — SubTracker is multi-currency by design (EGP/USD/EUR/GBP/SAR/AED).
