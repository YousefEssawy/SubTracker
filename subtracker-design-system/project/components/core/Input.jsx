import React from "react";

/**
 * Input — thin wrapper around .input-field / .label-text.
 * Intentional addition (see Button.jsx note).
 */
export function Input({ label, error, className = "", style, ...rest }) {
  return (
    <div style={{ width: "100%" }}>
      {label && <label className="label-text">{label}</label>}
      <input className={`input-field ${className}`} style={style} {...rest} />
      {error && (
        <p style={{ marginTop: "0.25rem", fontSize: "var(--text-caption)", color: "var(--danger-500)" }}>
          {error}
        </p>
      )}
    </div>
  );
}
