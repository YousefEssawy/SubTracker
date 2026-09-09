// SettingsScreen — ported from src/pages/SettingsPage.tsx.
function SettingsScreen({ theme, onToggleTheme }) {
  const { Icon, Button, Select } = window.SubTrackerDesignSystem_ae138e;
  const [saved, setSaved] = React.useState(false);

  const sectionLabel = { fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-tertiary)" };

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700, color: "var(--text-primary)" }}>Settings</h1>
        <Button variant="primary" size="sm" onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 1600); }}>
          {saved ? "Saved!" : "Save Preferences"}
        </Button>
      </div>

      <div className="glass-card" style={{ padding: 24 }}>
        <p style={sectionLabel}>Profile</p>
        <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 64, height: 64, borderRadius: "var(--radius-lg)", background: "var(--gradient-primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 24, fontWeight: 700 }}>Y</div>
          <div>
            <p style={{ margin: 0, fontWeight: 600, color: "var(--text-primary)" }}>Yousef Essawy</p>
            <p style={{ margin: 0, fontSize: 13, color: "var(--text-tertiary)" }}>yousef@example.com</p>
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: 24 }}>
        <p style={sectionLabel}>Appearance</p>
        <div style={{ marginTop: 16, display: "flex", width: "100%", borderRadius: "var(--radius-pill)", background: "var(--ink-100)", padding: 4 }}>
          {["light", "dark"].map((t) => (
            <button
              key={t}
              onClick={() => t !== theme && onToggleTheme()}
              style={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "0.6rem 0",
                borderRadius: "var(--radius-pill)", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500,
                background: theme === t ? "var(--surface-card)" : "transparent",
                color: theme === t ? "var(--brand-primary-500)" : "var(--text-secondary)",
                boxShadow: theme === t ? "var(--shadow-card)" : "none",
              }}
            >
              <Icon name={t === "light" ? "sun" : "moon"} size={18} />
              {t === "light" ? "Light" : "Dark"}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
        <p style={sectionLabel}>Preferences</p>
        <Select label="Display Currency" defaultValue="EGP">
          <option value="EGP">E£ EGP - Egyptian Pound</option>
          <option value="USD">$ USD - US Dollar</option>
          <option value="EUR">€ EUR - Euro</option>
        </Select>
        <Select label="Reminder Days Before Renewal" defaultValue="3">
          <option value="1">1 day before</option>
          <option value="3">3 days before</option>
          <option value="7">7 days before</option>
        </Select>
      </div>
    </div>
  );
}
window.SettingsScreen = SettingsScreen;
