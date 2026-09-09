import React from "react";

/**
 * Badge — small pill label. Intentional addition: the app inlines this
 * pattern ad-hoc (category filter chips, active filter chips, status
 * badges in SubscriptionsPage/CategoryForm) with slightly different
 * markup each time; this wraps the shared visual language.
 */
export function Badge({ tone = "primary", children, onRemove }) {
  const toneStyles = {
    primary: { background: "var(--brand-primary-050)", color: "var(--brand-primary-600)" },
    success: { background: "var(--success-bg)", color: "var(--success-600)" },
    warning: { background: "var(--warning-bg)", color: "var(--warning-600)" },
    danger: { background: "var(--danger-bg)", color: "var(--danger-600)" },
    neutral: { background: "var(--ink-100)", color: "var(--ink-700)" },
  };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.375rem",
        padding: "0.25rem 0.65rem",
        borderRadius: "var(--radius-pill)",
        fontSize: "var(--text-caption)",
        fontWeight: 600,
        fontFamily: "var(--font-latin)",
        ...toneStyles[tone],
      }}
    >
      {children}
      {onRemove && (
        <button
          onClick={onRemove}
          aria-label="Remove"
          style={{
            border: "none",
            background: "none",
            cursor: "pointer",
            padding: 0,
            display: "inline-flex",
            opacity: 0.7,
            color: "inherit",
            font: "inherit",
          }}
        >
          ✕
        </button>
      )}
    </span>
  );
}
