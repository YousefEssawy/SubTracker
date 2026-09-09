import React from "react";
import { Icon } from "../core/Icon.jsx";
import { Button } from "../core/Button.jsx";

/**
 * ConfirmDialog — modal confirmation for destructive/warning actions.
 * Ported from src/components/ui/ConfirmDialog.tsx (framer-motion swapped
 * for CSS transitions, react-i18next defaults hardcoded to English).
 */
export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Delete",
  cancelText = "Cancel",
  variant = "danger",
}) {
  if (!isOpen) return null;
  const tone = variant === "warning" ? "var(--warning-500)" : "var(--danger-500)";
  const toneBg = variant === "warning" ? "var(--warning-bg)" : "var(--danger-bg)";

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div
        onClick={onClose}
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
      />
      <div className="glass-card" style={{ position: "relative", width: "100%", maxWidth: 380, padding: 24, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, background: toneBg }}>
            <Icon name="exclamation-triangle" size={28} style={{ filter: variant === "warning" ? "none" : "none" }} />
          </div>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-h3)", fontWeight: 600, color: "var(--text-primary)", margin: "0 0 8px" }}>
            {title}
          </h3>
          <p style={{ fontSize: "var(--text-body-sm)", color: "var(--text-secondary)", margin: "0 0 24px" }}>{message}</p>
          <div style={{ display: "flex", gap: 12, width: "100%", justifyContent: "center" }}>
            <Button variant="secondary" onClick={onClose} className="" >{cancelText}</Button>
            <Button variant={variant === "warning" ? "primary" : "danger"} onClick={() => { onConfirm(); onClose(); }}>{confirmText}</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
