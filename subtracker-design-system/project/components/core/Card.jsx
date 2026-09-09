import React from "react";

/**
 * Card — thin wrapper around .glass-card, the app's single card surface.
 * Intentional addition: applied directly as a className throughout the
 * codebase rather than through a component.
 */
export function Card({ children, style, className = "", padding = "20px" }) {
  return (
    <div className={`glass-card ${className}`} style={{ padding, ...style }}>
      {children}
    </div>
  );
}
