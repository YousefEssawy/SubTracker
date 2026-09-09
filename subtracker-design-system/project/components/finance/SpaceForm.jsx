import React, { useState } from "react";
import { Icon } from "../core/Icon.jsx";
import { Button } from "../core/Button.jsx";

/**
 * SpaceForm — modal for creating/editing a "Space" (icon + color + name).
 * Ported from src/components/finance/SpaceForm.tsx.
 */
const SPACE_ICONS = ["💼", "🏠", "✈️", "🎓", "🛒", "🚗", "❤️", "🎮", "🍔", "💰"];
const SPACE_COLORS = ["#6366F1", "#EC4899", "#10B981", "#F59E0B", "#EF4444", "#06B6D4"];

export function SpaceForm({ space = null, onSubmit, onClose }) {
  const isEditing = Boolean(space);
  const [name, setName] = useState(space?.name || "");
  const [color, setColor] = useState(space?.color || SPACE_COLORS[0]);
  const [icon, setIcon] = useState(space?.icon || SPACE_ICONS[0]);

  return (
    <div onClick={(e) => e.target === e.currentTarget && onClose()} style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.5)", padding: 16 }}>
      <div className="glass-card" style={{ width: "100%", maxWidth: 420, padding: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "var(--text-h4)", fontWeight: 600, color: "var(--text-primary)" }}>
            {isEditing ? "Edit Space" : "Create Space"}
          </h2>
          <button onClick={onClose} style={{ border: "none", background: "none", padding: 8, cursor: "pointer", color: "var(--text-tertiary)" }}><Icon name="x-mark" size={18} /></button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <label className="label-text">Name</label>
            <input className="input-field" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Personal, Freelance, Household" maxLength={50} />
          </div>
          <div>
            <label className="label-text">Icon</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 6 }}>
              {SPACE_ICONS.map((e) => (
                <button key={e} onClick={() => setIcon(e)} style={{ fontSize: 18, padding: 6, borderRadius: "var(--radius-md)", border: "none", cursor: "pointer", background: icon === e ? "var(--brand-primary-100)" : "transparent", boxShadow: icon === e ? "0 0 0 2px var(--brand-primary-500)" : "none" }}>{e}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="label-text">Color</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8 }}>
              {SPACE_COLORS.map((c) => (
                <button key={c} onClick={() => setColor(c)} style={{ height: 32, borderRadius: "var(--radius-md)", border: "none", cursor: "pointer", background: c, boxShadow: color === c ? "0 0 0 2px #fff, 0 0 0 4px var(--ink-400)" : "none" }} />
              ))}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, borderRadius: "var(--radius-md)", background: "var(--surface-sunken)" }}>
            <div style={{ width: 40, height: 40, borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, background: color + "33" }}>{icon}</div>
            <span style={{ fontWeight: 500, fontSize: 14, color: "var(--text-primary)" }}>{name || "Space Name Preview"}</span>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: color, marginLeft: "auto" }} />
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button variant="primary" onClick={() => onSubmit?.({ name, color, icon })}>{isEditing ? "Save Changes" : "Create Space"}</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
