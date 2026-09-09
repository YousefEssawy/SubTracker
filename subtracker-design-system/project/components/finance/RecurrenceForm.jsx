import React, { useState } from "react";
import { Icon } from "../core/Icon.jsx";
import { Button } from "../core/Button.jsx";

/**
 * RecurrenceForm — modal for scheduling an automated recurring
 * income/expense (space, category, amount, pattern/interval, dates).
 * Ported from src/components/finance/RecurrenceForm.tsx.
 */
const inputCls = "input-field";

export function RecurrenceForm({ spaces = [], categories = [], onClose, onSubmit }) {
  const [type, setType] = useState("Expense");

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "rgba(0,0,0,0.5)" }}>
      <div className="glass-card" style={{ width: "100%", maxWidth: 420, maxHeight: "90vh", overflowY: "auto", padding: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "var(--text-h4)", fontWeight: 700, color: "var(--text-primary)" }}>Add Recurrence</h2>
          <button onClick={onClose} style={{ border: "none", background: "none", padding: 6, cursor: "pointer", color: "var(--text-tertiary)" }}><Icon name="x-mark" size={18} /></button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", borderRadius: "var(--radius-md)", overflow: "hidden", border: "1px solid var(--border-default)" }}>
            {["Income", "Expense"].map((t) => (
              <button key={t} onClick={() => setType(t)} style={{ flex: 1, padding: "0.5rem 0", fontSize: 14, fontWeight: 500, border: "none", cursor: "pointer", background: type === t ? (t === "Income" ? "var(--success-500)" : "var(--danger-500)") : "var(--surface-sunken)", color: type === t ? "#fff" : "var(--text-secondary)" }}>{t}</button>
            ))}
          </div>

          <div>
            <label className="label-text">Space</label>
            <select className={inputCls}>
              <option value="">Select…</option>
              {spaces.map((s) => <option key={s.id}>{s.icon} {s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label-text">Category</label>
            <select className={inputCls}>
              <option value="">Select…</option>
              {categories.map((c) => <option key={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label className="label-text">Amount</label>
              <input type="number" className={inputCls} placeholder="0.00" />
            </div>
            <div style={{ width: 100 }}>
              <label className="label-text">Currency</label>
              <select className={inputCls}><option>EGP</option><option>USD</option></select>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label className="label-text">Pattern</label>
              <select className={inputCls}><option>Monthly</option><option>Weekly</option><option>Yearly</option></select>
            </div>
            <div style={{ width: 100 }}>
              <label className="label-text">Every</label>
              <input type="number" className={inputCls} defaultValue={1} min={1} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label className="label-text">Start Date</label>
              <input type="date" className={inputCls} />
            </div>
            <div style={{ flex: 1 }}>
              <label className="label-text">End Date (optional)</label>
              <input type="date" className={inputCls} />
            </div>
          </div>
          <Button variant="primary" onClick={() => onSubmit?.()}>Create Recurrence</Button>
        </div>
      </div>
    </div>
  );
}
