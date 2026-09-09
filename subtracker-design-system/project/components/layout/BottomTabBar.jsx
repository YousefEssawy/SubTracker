import React from "react";
import { Icon } from "../core/Icon.jsx";

const TABS = [
  { path: "/dashboard", label: "Dashboard", icon: "home" },
  { path: "/subscriptions", label: "Subscriptions", icon: "credit-card" },
  { path: "/transactions", label: "Transactions", icon: "banknotes" },
  { path: "/spaces", label: "Spaces", icon: "rectangle-group" },
  { path: "/settings", label: "Settings", icon: "cog-6-tooth" },
];

/**
 * BottomTabBar — floating glass tab bar for mobile navigation.
 * Ported from src/components/layout/BottomTabBar.tsx.
 */
export function BottomTabBar({ activePath = "/dashboard" }) {
  return (
    <nav
      style={{
        position: "fixed", insetInline: 12, bottom: 12, zIndex: 40,
        borderRadius: "var(--radius-pill)", border: "1px solid var(--glass-border)",
        background: "var(--glass-fill)", backdropFilter: "blur(var(--glass-blur))",
        boxShadow: "var(--shadow-glass)", padding: 6,
      }}
    >
      <div style={{ display: "flex", gap: 4 }}>
        {TABS.map((tab) => {
          const active = tab.path === activePath;
          return (
            <a
              key={tab.path}
              href="#"
              onClick={(e) => e.preventDefault()}
              style={{
                flex: 1, minWidth: 0, display: "flex", flexDirection: "column", alignItems: "center",
                gap: 2, borderRadius: "var(--radius-pill)", padding: "8px 6px", textDecoration: "none",
                fontSize: 10, fontWeight: 600,
                color: active ? "var(--brand-primary-600)" : "var(--text-secondary)",
                background: active ? "var(--brand-primary-050)" : "transparent",
              }}
            >
              <Icon name={tab.icon} size={20} />
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%" }}>{tab.label}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
