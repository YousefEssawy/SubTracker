import React, { useState } from "react";
import { Icon } from "../core/Icon.jsx";
import { Button } from "../core/Button.jsx";

/**
 * CategoryForm — modal for creating/editing an Income or Expense category.
 * Ported from src/components/finance/CategoryForm.tsx.
 */
export function CategoryForm({ category = null, onSubmit, onClose }) {
  const isEditing = Boolean(category);
  const [name, setName] = useState(category?.name || "");
  const [type, setType] = useState(category?.type || "Income");

  return (
    <div onClick={(e) => e.target === e.currentTarget && onClose()} style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.5)", padding: 16 }}>
      <div className="glass-card" style={{ width: "100%", maxWidth: 380, padding: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "var(--text-h4)", fontWeight: 600, color: "var(--text-primary)" }}>
            {isEditing ? "Edit Category" : "Create Category"}
          </h2>
          <button onClick={onClose} style={{ border: "none", background: "none", padding: 8, cursor: "pointer", color: "var(--text-tertiary)" }}><Icon name="x-mark" size={18} /></button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {!isEditing ? (
            <div>
              <label className="label-text">Type</label>
              <div style={{ display: "flex", borderRadius: "var(--radius-md)", overflow: "hidden", border: "1px solid var(--border-default)" }}>
                {["Income", "Expense"].map((opt) => (
                  <button key={opt} onClick={() => setType(opt)} style={{ flex: 1, padding: "0.6rem 0", fontSize: 14, fontWeight: 500, border: "none", cursor: "pointer", background: type === opt ? (opt === "Income" ? "var(--success-500)" : "var(--danger-500)") : "var(--surface-sunken)", color: type === opt ? "#fff" : "var(--text-secondary)" }}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <label className="label-text">Type</label>
              <span style={{ display: "inline-block", padding: "0.25rem 0.75rem", borderRadius: "var(--radius-pill)", fontSize: 13, fontWeight: 500, background: category.type === "Income" ? "var(--success-bg)" : "var(--danger-bg)", color: category.type === "Income" ? "var(--success-600)" : "var(--danger-600)" }}>
                {category.type}
              </span>
              <p style={{ marginTop: 4, fontSize: 11, color: "var(--text-tertiary)" }}>Category type cannot be changed after creation.</p>
            </div>
          )}

          <div>
            <label className="label-text">Name</label>
            <input className="input-field" value={name} onChange={(e) => setName(e.target.value)} maxLength={50} placeholder={type === "Income" ? "e.g. Salary, Freelance" : "e.g. Rent, Groceries"} />
            <p style={{ marginTop: 4, fontSize: 11, color: "var(--text-tertiary)" }}>{name.length}/50</p>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button variant="primary" onClick={() => onSubmit?.({ name, type })}>{isEditing ? "Save Changes" : "Create Category"}</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
