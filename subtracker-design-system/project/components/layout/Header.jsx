import React from "react";
import { Icon } from "../core/Icon.jsx";

/**
 * Header — sticky top bar: menu toggle, logo + current page title,
 * language toggle, theme toggle, notifications, profile menu.
 * Ported from src/components/layout/Header.tsx.
 */
export function Header({ pageTitle, theme = "light", onMenuToggle, onToggleTheme, hasNotifications = true, logoSrc }) {
  return (
    <header style={{ position: "sticky", top: 0, zIndex: 40, height: 64, flexShrink: 0, background: "var(--surface-card)", borderBottom: "1px solid var(--border-default)" }}>
      <div style={{ height: "100%", padding: "0 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
          <button onClick={onMenuToggle} style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "var(--radius-md)", border: "none", background: "none", cursor: "pointer" }}>
            <Icon name="bars-3" size={20} />
          </button>
          <img src={logoSrc || (theme === "light" ? "../../assets/logo/light-mode.png" : "../../assets/logo/dark-mode.png")} alt="SubTracker" style={{ height: 32 }} />
          {pageTitle && (
            <>
              <span style={{ width: 1, height: 24, background: "var(--border-default)" }} />
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15, color: "var(--text-primary)" }}>{pageTitle}</span>
            </>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button style={{ padding: "0 12px", height: 36, borderRadius: "var(--radius-pill)", border: "none", background: "none", cursor: "pointer", fontSize: 14, fontWeight: 500, color: "var(--text-secondary)" }}>عربي</button>
          <button onClick={onToggleTheme} style={{ width: 36, height: 36, borderRadius: "50%", border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name={theme === "light" ? "moon" : "sun"} size={20} />
          </button>
          <div style={{ position: "relative" }}>
            <button style={{ width: 36, height: 36, borderRadius: "50%", border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="bell" size={20} />
            </button>
            {hasNotifications && <span style={{ position: "absolute", top: 6, right: 6, width: 8, height: 8, borderRadius: "50%", background: "var(--danger-500)" }} />}
          </div>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--gradient-primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14, fontWeight: 700 }}>Y</div>
        </div>
      </div>
    </header>
  );
}
