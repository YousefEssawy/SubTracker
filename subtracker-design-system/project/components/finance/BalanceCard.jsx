import React from "react";

const CURRENCY_SYMBOLS = {
  EGP: "E£", USD: "$", EUR: "€", GBP: "£", SAR: "﷼", AED: "د.إ",
};

const fmt = (value) =>
  new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.abs(value));

function CurrencyBlock({ currency, data, compact }) {
  const symbol = CURRENCY_SYMBOLS[currency] || currency;
  const isPositive = data.balance >= 0;
  const toneColor = isPositive ? "var(--success-500)" : "var(--danger-500)";

  if (compact) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid var(--border-subtle)" }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{currency}</span>
        <span className="figure" style={{ fontSize: 14, fontWeight: 700, color: toneColor }}>
          {isPositive ? "+" : "-"}{symbol} {fmt(data.balance)}
        </span>
      </div>
    );
  }

  return (
    <div className="glass-card" style={{ padding: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{currency}</span>
        <span className="figure" style={{ fontSize: 15, fontWeight: 700, color: toneColor }}>
          {isPositive ? "+" : "-"}{symbol} {fmt(data.balance)}
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={{ background: "var(--success-bg)", borderRadius: "var(--radius-md)", padding: 12 }}>
          <p style={{ fontSize: 11, color: "var(--success-600)", fontWeight: 500, margin: "0 0 2px" }}>Income</p>
          <p className="figure" style={{ fontSize: 14, fontWeight: 600, color: "var(--success-600)", margin: 0 }}>{symbol} {fmt(data.income)}</p>
        </div>
        <div style={{ background: "var(--danger-bg)", borderRadius: "var(--radius-md)", padding: 12 }}>
          <p style={{ fontSize: 11, color: "var(--danger-600)", fontWeight: 500, margin: "0 0 2px" }}>Expense</p>
          <p className="figure" style={{ fontSize: 14, fontWeight: 600, color: "var(--danger-600)", margin: 0 }}>{symbol} {fmt(data.expense)}</p>
        </div>
      </div>
    </div>
  );
}

/**
 * BalanceCard — per-currency income/expense/balance summary.
 * Ported from src/components/finance/BalanceCard.tsx.
 */
export function BalanceCard({ variant = "summary", balances = {} }) {
  const currencies = Object.keys(balances);

  if (currencies.length === 0) {
    if (variant === "contextual") return null;
    return (
      <div className="glass-card" style={{ padding: 20, textAlign: "center" }}>
        <p style={{ fontSize: 14, color: "var(--text-tertiary)", margin: 0 }}>No financial data yet.</p>
      </div>
    );
  }

  if (variant === "contextual") {
    return (
      <div className="glass-card" style={{ padding: "16px 20px" }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.04em", margin: "0 0 8px" }}>Balance</p>
        {currencies.map((cur) => (
          <CurrencyBlock key={cur} currency={cur} data={balances[cur]} compact />
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 16, gridTemplateColumns: currencies.length === 1 ? "1fr" : "repeat(auto-fit, minmax(220px, 1fr))" }}>
      {currencies.map((cur) => (
        <CurrencyBlock key={cur} currency={cur} data={balances[cur]} compact={false} />
      ))}
    </div>
  );
}
