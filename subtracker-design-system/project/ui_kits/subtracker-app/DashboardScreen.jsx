// DashboardScreen — ported from src/pages/DashboardPage.tsx (recharts BarChart
// replaced with plain CSS bars; count-up animation omitted for a static demo).
function DashboardScreen() {
  const { RenewalDial } = window.SubTrackerDesignSystem_ae138e;
  const { CATEGORIES, SUBSCRIPTIONS, TREND, MONTH_LABELS } = window.SubTrackerDemoData;

  const active = SUBSCRIPTIONS.filter((s) => s.status === "active");
  const monthlyTotal = active.reduce((sum, s) => sum + s.price, 0);
  const nextRenewal = [...active].filter((s) => s.daysUntil >= 0).sort((a, b) => a.daysUntil - b.daysUntil)[0];
  const upcoming = [...active].filter((s) => s.daysUntil >= 0).sort((a, b) => a.daysUntil - b.daysUntil).slice(0, 5);
  const income = 8500;
  const expense = monthlyTotal;
  const flowMax = Math.max(income, expense, 1);

  const byCategory = {};
  active.forEach((s) => {
    const cat = CATEGORIES[s.category];
    byCategory[cat.name] = byCategory[cat.name] || { value: 0, color: cat.color };
    byCategory[cat.name].value += s.price;
  });
  const catRows = Object.entries(byCategory).sort((a, b) => b[1].value - a[1].value);
  const catMax = catRows[0]?.[1].value || 1;
  const trendMax = Math.max(...TREND);

  const statCard = (label, value, delta, tone) => (
    <div className="glass-card" style={{ padding: 20 }}>
      <p style={{ margin: 0, fontSize: 12, color: "var(--text-secondary)", fontWeight: 500 }}>{label}</p>
      <div className="figure" style={{ marginTop: 8, fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, color: "var(--text-primary)" }}>{value}</div>
      {delta && <p style={{ marginTop: 8, fontSize: 12, fontWeight: 600, color: tone === "warn" ? "var(--warning-500)" : tone === "danger" ? "var(--danger-500)" : tone === "success" ? "var(--success-500)" : "var(--text-tertiary)" }}>{delta}</p>}
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700, color: "var(--text-primary)" }}>Good morning, Yousef</h1>
        <p style={{ margin: "4px 0 0", fontSize: 14, color: "var(--text-secondary)" }}>Here's what's happening with your money.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
        {statCard("Monthly burn rate", `E£ ${monthlyTotal.toFixed(2)}`, `E£ ${(monthlyTotal * 12).toFixed(2)} / year`, "muted")}
        {statCard("Next renewal", nextRenewal ? `${nextRenewal.daysUntil} days` : "—", nextRenewal ? `${nextRenewal.name} · E£ ${nextRenewal.price}` : "", nextRenewal && nextRenewal.daysUntil <= 3 ? "warn" : "muted")}
        {statCard("Income", `E£ ${income.toFixed(2)}`, "Total logged income", "success")}
        {statCard("Expense", `E£ ${expense.toFixed(2)}`, "Total logged expense", "danger")}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 24, minWidth: 0 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div className="glass-card" style={{ padding: 20, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
              <h3 style={{ alignSelf: "flex-start", margin: "0 0 12px", fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>Next renewal</h3>
              {nextRenewal && (
                <>
                  <RenewalDial icon={CATEGORIES[nextRenewal.category].icon} iconColor={CATEGORIES[nextRenewal.category].color} daysUntil={nextRenewal.daysUntil} billingCycle="monthly" size={110} />
                  <p style={{ margin: "12px 0 0", fontWeight: 600, color: "var(--text-primary)" }}>{nextRenewal.name}</p>
                  <p className="figure" style={{ margin: 0, fontSize: 12, color: "var(--text-tertiary)" }}>in {nextRenewal.daysUntil} days</p>
                </>
              )}
            </div>
            <div className="glass-card" style={{ padding: 20 }}>
              <h3 style={{ margin: "0 0 16px", fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>Income vs expense</h3>
              {[["Income", income, "var(--success-500)"], ["Expense", expense, "var(--danger-500)"]].map(([label, val, color]) => (
                <div key={label} style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                    <span style={{ color: "var(--text-secondary)" }}>{label}</span>
                    <span className="figure" style={{ fontWeight: 600, color: "var(--text-primary)" }}>E£ {val.toFixed(2)}</span>
                  </div>
                  <div style={{ height: 10, borderRadius: 5, background: "var(--ink-100)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(val / flowMax) * 100}%`, background: color, borderRadius: 5 }} />
                  </div>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 12, borderTop: "1px solid var(--border-subtle)" }}>
                <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Net</span>
                <span className="figure" style={{ fontWeight: 700, color: income - expense >= 0 ? "var(--success-500)" : "var(--danger-500)" }}>
                  {income - expense >= 0 ? "+" : "-"}E£ {Math.abs(income - expense).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: 20 }}>
            <h3 style={{ margin: "0 0 16px", fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>Spending trend</h3>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 140 }}>
              {TREND.map((v, i) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <div style={{ width: "100%", height: `${(v / trendMax) * 110}px`, borderRadius: "4px 4px 0 0", background: i === TREND.length - 1 ? "var(--warning-500)" : "var(--brand-primary-500)" }} />
                  <span style={{ fontSize: 9, color: "var(--text-tertiary)" }}>{MONTH_LABELS[i]}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card" style={{ padding: 20 }}>
            <h3 style={{ margin: "0 0 16px", fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>Spending by category</h3>
            {catRows.map(([name, d]) => (
              <div key={name} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                  <span style={{ color: "var(--text-secondary)" }}>{name}</span>
                  <span className="figure" style={{ color: "var(--text-primary)" }}>E£ {d.value.toFixed(0)}</span>
                </div>
                <div style={{ height: 8, borderRadius: 4, background: "var(--ink-100)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(d.value / catMax) * 100}%`, background: d.color, borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>Upcoming renewals</h3>
            <span style={{ fontSize: 12, color: "var(--brand-primary-500)", cursor: "pointer" }}>View all</span>
          </div>
          {upcoming.map((sub) => {
            const cat = CATEGORIES[sub.category];
            return (
              <div key={sub.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0" }}>
                <span style={{ width: 36, height: 36, borderRadius: "50%", background: cat.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                  {sub.name.charAt(0)}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sub.name}</p>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <p className="figure" style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>E£ {sub.price}</p>
                  <p style={{ margin: 0, fontSize: 11, fontWeight: 500, color: sub.daysUntil <= 3 ? "var(--danger-500)" : "var(--warning-500)" }}>{sub.daysUntil} days</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
window.DashboardScreen = DashboardScreen;
