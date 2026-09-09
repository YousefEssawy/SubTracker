// TransactionsScreen — combines src/pages/TransactionsPage.tsx +
// HistoryPage.tsx patterns: balance summary, filter bar, transaction list.
function TransactionsScreen() {
  const { BalanceCard, FilterBar, TransactionListItem, Icon, Button } = window.SubTrackerDesignSystem_ae138e;
  const { CATEGORIES, SPACES, TRANSACTIONS } = window.SubTrackerDemoData;
  const [filters, setFilters] = React.useState({});

  const filtered = TRANSACTIONS.filter((t) => !filters.type || t.type === filters.type);
  const balances = { EGP: { balance: 8500 - 1250, income: 8500, expense: 1250 } };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700, color: "var(--text-primary)" }}>Transactions</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-secondary)" }}>Track your income and expenses.</p>
        </div>
        <Button variant="primary" size="sm">+ Add</Button>
      </div>

      <BalanceCard variant="summary" balances={balances} />
      <FilterBar spaces={SPACES} filters={filters} setFilters={setFilters} />

      <div className="glass-card" style={{ padding: 8 }}>
        {filtered.map((t) => {
          const cat = t.category ? CATEGORIES[t.category] : { name: t.label, icon: t.icon, color: t.color };
          const space = SPACES.find((s) => s.id === t.space);
          return (
            <TransactionListItem
              key={t.id}
              transaction={{ type: t.type, amount: t.amount, currency: t.currency, transactionDate: t.date }}
              category={cat}
              space={space}
            />
          );
        })}
        {filtered.length === 0 && <p style={{ textAlign: "center", padding: 32, color: "var(--text-tertiary)", fontSize: 13 }}>No transactions match the current filters.</p>}
      </div>
    </div>
  );
}
window.TransactionsScreen = TransactionsScreen;
