import React from "react";
import { Icon } from "../core/Icon.jsx";

/**
 * Pagination — page-size selector + prev/next controls for table-like lists.
 * Ported from src/components/ui/Pagination.tsx (react-i18next defaults
 * hardcoded to English).
 */
export function Pagination({
  hasNext,
  hasPrev,
  goNext,
  goPrev,
  pageSize,
  setPageSize,
  pageSizeOptions = [10, 25, 50],
}) {
  const btnStyle = (disabled) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    padding: "0.375rem 0.75rem",
    borderRadius: "var(--radius-md)",
    fontSize: "var(--text-body-sm)",
    fontWeight: 500,
    border: "1px solid var(--border-default)",
    background: "transparent",
    color: "var(--text-secondary)",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.4 : 1,
  });

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 0.25rem", borderTop: "1px solid var(--border-subtle)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: "var(--text-caption)", color: "var(--text-secondary)" }}>Rows:</span>
        <select
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
          style={{ fontSize: "var(--text-caption)", padding: "0.3rem 0.5rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-default)", background: "var(--surface-card)", color: "var(--text-secondary)" }}
        >
          {pageSizeOptions.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button onClick={goPrev} disabled={!hasPrev} style={btnStyle(!hasPrev)}>
          <Icon name="arrow-left" size={14} /> Prev
        </button>
        <button onClick={goNext} disabled={!hasNext} style={btnStyle(!hasNext)}>
          Next <Icon name="arrow-right" size={14} />
        </button>
      </div>
    </div>
  );
}
