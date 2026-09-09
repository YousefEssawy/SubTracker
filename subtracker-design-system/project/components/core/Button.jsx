import React from "react";

/**
 * Button — thin wrapper around the app's existing .btn-primary / .btn-secondary /
 * .btn-danger utility classes (src/styles/globals.scss @layer components).
 * Intentional addition: the source styles these looks via CSS classes applied
 * directly to native <button> elements, with no dedicated React component.
 */
export function Button({
  variant = "primary",
  size = "md",
  disabled = false,
  type = "button",
  onClick,
  children,
  className = "",
}) {
  const base =
    variant === "primary" ? "btn-primary" : variant === "danger" ? "btn-danger" : "btn-secondary";
  const sizeStyle =
    size === "sm"
      ? { padding: "0.4rem 1.1rem", fontSize: "var(--text-body-sm)" }
      : size === "lg"
        ? { padding: "0.85rem 2rem", fontSize: "var(--text-body)" }
        : undefined;

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem",
        fontFamily: "var(--font-latin)",
        ...sizeStyle,
      }}
    >
      {children}
    </button>
  );
}
