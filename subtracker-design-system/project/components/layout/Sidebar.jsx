import React from "react";
import { Icon } from "../core/Icon.jsx";

const NAV_SECTIONS = [
  { key: "overview", label: "Overview", items: [{ path: "/dashboard", label: "Dashboard", icon: "home" }] },
  { key: "money", label: "Money", items: [
    { path: "/transactions", label: "Transactions", icon: "banknotes" },
    { path: "/subscriptions", label: "Subscriptions", icon: "credit-card" },
    { path: "/recurrences", label: "Recurrences", icon: "arrow-path" },
  ]},
  { key: "organize", label: "Organize", items: [
    { path: "/categories", label: "Categories", icon: "tag" },
    { path: "/spaces", label: "Spaces", icon: "rectangle-group" },
  ]},
  { key: "activity", label: "Activity", items: [{ path: "/history", label: "History", icon: "clock" }] },
  { key: "account", label: "Account", items: [
    { path: "/settings", label: "Settings", icon: "cog-6-tooth" },
    { path: "/how-to", label: "How to Use", icon: "book-open" },
    { path: "/about", label: "About", icon: "information-circle" },
  ]},
];

/**
 * Sidebar — desktop nav rail (collapsible) with sectioned links + Add
 * Subscription CTA. Ported from src/components/layout/Sidebar.tsx
 * (react-router Link swapped for <a>, framer-motion drawer omitted —
 * this shows the desktop rail only).
 */
export function Sidebar({ activePath = "/dashboard", collapsed = false }) {
  return (
    <aside
      style={{
        display: "flex", flexDirection: "column", height: "100%", flexShrink: 0,
        width: collapsed ? 72 : 248, background: "var(--surface-card)",
        borderInlineEnd: "1px solid var(--border-default)", overflow: "hidden",
        transition: "width var(--duration-base) var(--ease-standard)",
      }}
    >
      <nav style={{ flex: 1, padding: "16px 12px", overflowY: "auto" }}>
        {NAV_SECTIONS.map((section) => (
          <div key={section.key} style={{ marginBottom: 8 }}>
            {!collapsed && (
              <p style={{ padding: "12px 16px 4px", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.16em", color: "var(--text-tertiary)", margin: 0 }}>
                {section.label}
              </p>
            )}
            {section.items.map((item) => {
              const active = item.path === activePath;
              return (
                <a
                  key={item.path}
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  style={{
                    display: "flex", alignItems: "center", gap: 12, borderRadius: "var(--radius-pill)",
                    padding: collapsed ? "0.6rem" : "0.6rem 1rem", justifyContent: collapsed ? "center" : "flex-start",
                    fontSize: 14, fontWeight: active ? 600 : 500, textDecoration: "none",
                    color: active ? "var(--brand-primary-600)" : "var(--text-secondary)",
                    background: active ? "var(--brand-primary-050)" : "transparent",
                  }}
                >
                  <Icon name={item.icon} size={20} />
                  {!collapsed && <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.label}</span>}
                </a>
              );
            })}
          </div>
        ))}
      </nav>
      <div style={{ borderTop: "1px solid var(--border-subtle)", padding: collapsed ? 12 : 16, display: "flex", justifyContent: collapsed ? "center" : "stretch" }}>
        <button
          className={collapsed ? "" : "btn-primary"}
          style={collapsed
            ? { width: 44, height: 44, borderRadius: "50%", border: "none", cursor: "pointer", background: "var(--gradient-primary)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "var(--shadow-glow-primary)" }
            : { width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
        >
          <Icon name="plus-circle" size={20} style={{ filter: "invert(1) brightness(2)" }} />
          {!collapsed && "Add Subscription"}
        </button>
      </div>
    </aside>
  );
}
