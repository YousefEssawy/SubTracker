import React from "react";

/**
 * Icon — thin <img> wrapper around Heroicons v2 (outline), the exact icon
 * set the source app uses via `react-icons/hi2`. Source icons aren't
 * bundled as local SVG/font assets in the repo (react-icons resolves them
 * from its own package at build time), so per iconography guidance we link
 * the equivalent set from a CDN (jsDelivr mirrors the heroicons npm
 * package) rather than hand-drawing replacements.
 * Intentional addition — the source has no Icon component of its own.
 */
export function Icon({ name, size = 20, className = "", style, strokeWidth = 1.8 }) {
  return (
    <img
      src={`https://cdn.jsdelivr.net/npm/heroicons@2.1.5/24/outline/${name}.svg`}
      width={size}
      height={size}
      alt=""
      aria-hidden="true"
      className={className}
      style={{ display: "inline-block", ...style }}
    />
  );
}
