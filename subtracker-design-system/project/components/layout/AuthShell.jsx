import React from "react";
import { Icon } from "../core/Icon.jsx";

/**
 * AuthShell — split login/signup shell: gradient brand panel (desktop)
 * + form panel. Ported from src/components/layout/AuthShell.tsx.
 */
export function AuthShell({ variant = "login", title, subtitle, children }) {
  const bullets = ["See your true monthly burn rate", "Never miss a renewal again", "Income vs expense at a glance"];

  return (
    <div style={{ minHeight: 560, display: "flex", background: "var(--bg-page)", borderRadius: "var(--radius-xl)", overflow: "hidden" }}>
      <div style={{ display: "none" }} className="auth-brand-panel" />
      <div
        style={{
          width: "44%", maxWidth: 380, background: "var(--gradient-primary)", position: "relative",
          display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 40, overflow: "hidden",
        }}
      >
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 36, height: 36, borderRadius: "var(--radius-md)", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontFamily: "var(--font-display)" }}>S</span>
          <span style={{ color: "#fff", fontWeight: 700, fontFamily: "var(--font-display)", fontSize: 18 }}>SubTracker</span>
        </div>

        <div style={{ position: "relative" }}>
          <h2 style={{ color: "#fff", fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, lineHeight: 1.25, margin: "0 0 12px" }}>
            {variant === "login"
              ? "Calm, clear control over every dollar that leaves your account."
              : "Start tracking in minutes. Feel in control by tonight."}
          </h2>
          {variant === "login" ? (
            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 14, lineHeight: 1.6, margin: 0 }}>
              Join thousands tracking subscriptions and expenses without the spreadsheet stress.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
              {bullets.map((b) => (
                <div key={b} style={{ display: "flex", alignItems: "center", gap: 10, color: "rgba(255,255,255,0.9)", fontSize: 13 }}>
                  <Icon name="check-circle" size={18} style={{ filter: "invert(1) brightness(2)" }} />
                  {b}
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ position: "relative" }}>
          {variant === "login" ? (
            <div style={{ display: "flex", gap: 32 }}>
              <div>
                <p className="figure" style={{ color: "#fff", fontSize: 22, fontWeight: 700, margin: 0 }}>$248</p>
                <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, margin: 0 }}>avg monthly spend</p>
              </div>
              <div>
                <p className="figure" style={{ color: "#fff", fontSize: 22, fontWeight: 700, margin: 0 }}>6 days</p>
                <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, margin: 0 }}>to next renewal</p>
              </div>
            </div>
          ) : (
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, margin: 0 }}>No credit card required.</p>
          )}
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
        <div style={{ width: "100%", maxWidth: 360 }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>{title}</h1>
          <p style={{ marginTop: 6, color: "var(--text-secondary)", fontSize: 14 }}>{subtitle}</p>
          <div style={{ marginTop: 28 }}>{children}</div>
        </div>
      </div>
    </div>
  );
}
