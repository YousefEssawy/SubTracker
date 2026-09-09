import React, { useState } from "react";
import { Icon } from "../core/Icon.jsx";

/**
 * FilterBar — transaction list filter toolbar: type toggle, "more filters"
 * expansion (space/currency/tag/date-range), active-filter chips.
 * Ported from src/components/finance/FilterBar.tsx (simplified: static
 * demo data instead of SpaceContext/ViewportContext).
 */
function TypeButton({ label, active, onClick, color }) {
  return (
    <button
      onClick={onClick}
      style={{
        borderRadius: "var(--radius-pill)", padding: "0.375rem 0.9rem", fontSize: 14, fontWeight: 500,
        border: "none", cursor: "pointer", transition: "background var(--duration-base) var(--ease-standard)",
        background: active ? color : "var(--ink-100)", color: active ? "#fff" : "var(--text-secondary)",
      }}
    >
      {label}
    </button>
  );
}

export function FilterBar({ spaces = [], filters, setFilters }) {
  const [showMore, setShowMore] = useState(false);
  const hasActive = filters.spaceId || filters.type || filters.tag;

  const update = (key, value) => setFilters({ ...filters, [key]: value });
  const clearAll = () => setFilters({});

  return (
    <div className="glass-card" style={{ padding: 16 }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
        <Icon name="funnel" size={16} style={{ opacity: 0.5 }} />
        <div style={{ display: "flex", gap: 6 }}>
          <TypeButton label="All" active={!filters.type} onClick={() => update("type", undefined)} color="var(--brand-primary-500)" />
          <TypeButton label="Income" active={filters.type === "Income"} onClick={() => update("type", "Income")} color="var(--success-500)" />
          <TypeButton label="Expense" active={filters.type === "Expense"} onClick={() => update("type", "Expense")} color="var(--danger-500)" />
        </div>
        <button onClick={() => setShowMore(!showMore)} style={{ marginLeft: "auto", border: "none", background: "none", color: "var(--brand-primary-500)", fontSize: 12, cursor: "pointer" }}>
          {showMore ? "Less ▲" : "More ▼"}
        </button>
        {hasActive && (
          <button onClick={clearAll} style={{ display: "flex", alignItems: "center", gap: 4, border: "none", background: "none", color: "var(--text-tertiary)", fontSize: 12, cursor: "pointer" }}>
            <Icon name="x-mark" size={13} /> Clear
          </button>
        )}
      </div>

      {showMore && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border-subtle)" }}>
          <div>
            <label style={{ fontSize: 11, color: "var(--text-tertiary)", display: "block", marginBottom: 4 }}>Space</label>
            <select className="select-field" style={{ fontSize: 13, padding: "0.4rem 0.75rem" }}>
              <option>All Spaces</option>
              {spaces.map((s) => <option key={s.id}>{s.icon} {s.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, color: "var(--text-tertiary)", display: "block", marginBottom: 4 }}>Tag</label>
            <input className="input-field" style={{ fontSize: 13, padding: "0.4rem 0.75rem" }} placeholder="Filter by tag…" />
          </div>
        </div>
      )}

      {hasActive && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border-subtle)" }}>
          {filters.type && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "0.25rem 0.65rem", borderRadius: "var(--radius-pill)", fontSize: 12, fontWeight: 500, background: "var(--brand-primary-050)", color: "var(--brand-primary-600)" }}>
              {filters.type}
              <button onClick={() => update("type", undefined)} style={{ border: "none", background: "none", padding: 0, display: "flex", color: "inherit" }}><Icon name="x-mark" size={12} /></button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
