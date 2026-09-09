import React from "react";
import { Header } from "./Header.jsx";
import { Sidebar } from "./Sidebar.jsx";
import { BottomTabBar } from "./BottomTabBar.jsx";

/**
 * Layout — the authenticated app shell: Header on top, Sidebar + content
 * row below, BottomTabBar overlaid for mobile. Ported from
 * src/components/layout/Layout.tsx.
 */
export function Layout({ pageTitle, activePath, logoSrc, children }) {
  return (
    <div style={{ height: "100%", minHeight: 480, display: "flex", flexDirection: "column", background: "var(--bg-page)", overflow: "hidden", borderRadius: "var(--radius-lg)" }}>
      <Header pageTitle={pageTitle} logoSrc={logoSrc} />
      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        <Sidebar activePath={activePath} />
        <main style={{ flex: 1, minWidth: 0, overflowY: "auto" }}>
          <div style={{ maxWidth: "120rem", margin: "0 auto", padding: "24px 20px" }}>{children}</div>
        </main>
      </div>
    </div>
  );
}
