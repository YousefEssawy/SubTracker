import React from "react";

/**
 * Select — thin wrapper around .select-field / .label-text.
 * Intentional addition (see Button.jsx note).
 */
export function Select({ label, children, className = "", ...rest }) {
  return (
    <div style={{ width: "100%" }}>
      {label && <label className="label-text">{label}</label>}
      <select className={`select-field ${className}`} {...rest}>
        {children}
      </select>
    </div>
  );
}
