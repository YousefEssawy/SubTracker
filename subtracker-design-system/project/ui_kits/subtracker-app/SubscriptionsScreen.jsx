// SubscriptionsScreen — ported from src/pages/SubscriptionsPage.tsx
// (grouped by urgency: overdue / due soon / this month / later / paused).
function SubscriptionsScreen() {
  const { Icon, Button } = window.SubTrackerDesignSystem_ae138e;
  const { CATEGORIES, SUBSCRIPTIONS } = window.SubTrackerDemoData;

  const withCat = SUBSCRIPTIONS.map((s) => ({ ...s, cat: CATEGORIES[s.category] }));
  const active = withCat.filter((s) => s.status === "active").sort((a, b) => a.daysUntil - b.daysUntil);
  const groups = [
    { label: "Overdue", color: "#EF4444", items: active.filter((s) => s.daysUntil < 0) },
    { label: "Due soon", color: "#F59E0B", items: active.filter((s) => s.daysUntil >= 0 && s.daysUntil <= 7) },
    { label: "This month", color: "#6366F1", items: active.filter((s) => s.daysUntil > 7 && s.daysUntil <= 30) },
    { label: "Paused", color: "#94A3B8", items: withCat.filter((s) => s.status === "paused") },
  ];
  const total = active.reduce((s, sub) => s + sub.price, 0);

  const Row = ({ sub }) => (
    <div
      style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 16px", borderRadius: "var(--radius-lg)", opacity: sub.status !== "active" ? 0.6 : 1 }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-sunken)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <span style={{ width: 40, height: 40, borderRadius: "50%", background: sub.cat.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, flexShrink: 0 }}>
        {sub.name.charAt(0)}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sub.name}</p>
        <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--text-secondary)" }}>Monthly · {sub.cat.name}</p>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <p className="figure" style={{ margin: 0, fontWeight: 600, color: "var(--text-primary)" }}>E£ {sub.price}</p>
        <p style={{ margin: 0, fontSize: 11, fontWeight: 500, color: sub.daysUntil < 0 ? "var(--danger-500)" : sub.daysUntil <= 7 ? "var(--warning-500)" : "var(--text-tertiary)" }}>
          {sub.status !== "active" ? "Paused" : sub.daysUntil < 0 ? `Overdue by ${Math.abs(sub.daysUntil)}d` : `in ${sub.daysUntil}d`}
        </p>
      </div>
      <div style={{ display: "flex", gap: 2 }}>
        <button style={{ border: "none", background: "none", padding: 6, borderRadius: "var(--radius-sm)", cursor: "pointer", color: "var(--text-tertiary)" }}><Icon name={sub.status === "active" ? "pause" : "play"} size={16} /></button>
        <button style={{ border: "none", background: "none", padding: 6, borderRadius: "var(--radius-sm)", cursor: "pointer", color: "var(--text-tertiary)" }}><Icon name="pencil-square" size={16} /></button>
        <button style={{ border: "none", background: "none", padding: 6, borderRadius: "var(--radius-sm)", cursor: "pointer", color: "var(--text-tertiary)" }}><Icon name="trash" size={16} /></button>
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700, color: "var(--text-primary)" }}>Subscriptions</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-secondary)" }}>
            {active.length} active · <span className="figure">E£ {total.toFixed(2)}</span> / mo
          </p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ position: "relative" }}>
            <Icon name="magnifying-glass" size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", opacity: 0.4 }} />
            <input className="input-field" placeholder="Search subscriptions…" style={{ paddingLeft: 34, width: 200, fontSize: 13 }} />
          </div>
          <Button variant="primary" size="sm">+ Add New</Button>
        </div>
      </div>

      <div className="glass-card" style={{ padding: 10 }}>
        {groups.filter((g) => g.items.length > 0).map((g) => (
          <div key={g.label} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 16px" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: g.color }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{g.label}</span>
              <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>{g.items.length}</span>
            </div>
            {g.items.map((sub) => <Row key={sub.id} sub={sub} />)}
          </div>
        ))}
      </div>
    </div>
  );
}
window.SubscriptionsScreen = SubscriptionsScreen;
