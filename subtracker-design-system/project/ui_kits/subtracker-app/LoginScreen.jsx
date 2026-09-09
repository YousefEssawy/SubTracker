// LoginScreen — ported from src/pages/LoginPage.tsx, wrapped in AuthShell.
function LoginScreen({ onLogin }) {
  const { AuthShell, Icon, Button } = window.SubTrackerDesignSystem_ae138e;
  const [showPwd, setShowPwd] = React.useState(false);

  return (
    <AuthShell variant="login" title="Welcome back" subtitle="Log in to see where your money is going.">
      <form onSubmit={(e) => { e.preventDefault(); onLogin(); }} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label className="label-text">Email</label>
          <div style={{ position: "relative" }}>
            <Icon name="envelope" size={18} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", opacity: 0.4 }} />
            <input type="email" className="input-field" placeholder="you@example.com" style={{ paddingLeft: 38 }} required />
          </div>
        </div>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <label className="label-text" style={{ margin: 0 }}>Password</label>
            <a href="#" onClick={(e) => e.preventDefault()} style={{ fontSize: 12, color: "var(--brand-primary-500)", fontWeight: 500 }}>Forgot password?</a>
          </div>
          <div style={{ position: "relative" }}>
            <Icon name="lock-closed" size={18} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", opacity: 0.4 }} />
            <input type={showPwd ? "text" : "password"} className="input-field" placeholder="••••••••" style={{ paddingLeft: 38, paddingRight: 38 }} required />
            <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", border: "none", background: "none", cursor: "pointer", color: "var(--text-tertiary)" }}>
              <Icon name={showPwd ? "eye-slash" : "eye"} size={18} />
            </button>
          </div>
        </div>
        <Button type="submit" variant="primary" size="lg">Log in</Button>
      </form>
      <button style={{ marginTop: 12, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "0.75rem", background: "var(--surface-card)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-pill)", fontWeight: 500, fontSize: 14, color: "var(--text-secondary)", cursor: "pointer" }}>
        Continue with Google
      </button>
      <p style={{ marginTop: 24, textAlign: "center", fontSize: 13, color: "var(--text-secondary)" }}>
        New here? <a href="#" onClick={(e) => e.preventDefault()} style={{ color: "var(--brand-primary-500)", fontWeight: 500 }}>Create an account</a>
      </p>
    </AuthShell>
  );
}
window.LoginScreen = LoginScreen;
