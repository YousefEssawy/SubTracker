import React from "react";
import { Icon } from "../core/Icon.jsx";

/**
 * TransactionListItem — single row in a transaction list: category badge,
 * category/space/date, amount. Ported from
 * src/components/finance/TransactionListItem.tsx.
 */
export function TransactionListItem({ transaction, category, space, onClick }) {
  const isIncome = transaction.type === "Income";
  const badgeColor = category?.color || space?.color || "#6366F1";

  return (
    <div
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 16, padding: "12px 16px",
        borderRadius: "var(--radius-lg)", cursor: "pointer",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-sunken)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <span
        style={{
          flexShrink: 0, width: 40, height: 40, borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, color: "#fff", backgroundColor: badgeColor,
        }}
      >
        {category?.icon || space?.icon || "💼"}
      </span>
      <div style={{ minWidth: 0, flex: 1 }}>
        <p style={{ margin: 0, fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {category?.name || "Unknown Category"}
        </p>
        <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {space?.name || "Unknown Space"} · {transaction.transactionDate}
        </p>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <p className="figure" style={{ margin: 0, fontWeight: 600, color: isIncome ? "var(--success-500)" : "var(--danger-500)" }}>
          {isIncome ? "+" : "-"}{transaction.currency} {transaction.amount.toFixed(2)}
        </p>
        <p style={{ margin: "2px 0 0", fontSize: 11, fontWeight: 500, color: "var(--text-tertiary)" }}>
          {isIncome ? "Income" : "Expense"}
        </p>
      </div>
    </div>
  );
}
