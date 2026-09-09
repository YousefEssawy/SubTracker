import React from "react";

const CYCLE_DAYS = { weekly: 7, monthly: 30, yearly: 365, custom: 30 };

/**
 * RenewalDial — the app's signature "how far through the billing cycle"
 * indicator. A ring fills as the next renewal approaches so the countdown
 * reads at a glance. Ported from src/components/ui/RenewalDial.tsx
 * (framer-motion transition swapped for a plain CSS transition).
 */
export function RenewalDial({
  icon,
  iconColor,
  daysUntil,
  billingCycle = "monthly",
  customCycleDays,
  size = 44,
}) {
  const cycleDays =
    billingCycle === "custom" ? customCycleDays || CYCLE_DAYS.custom : CYCLE_DAYS[billingCycle];

  const progress = Math.min(1, Math.max(0, (cycleDays - daysUntil) / cycleDays));
  const isPastDue = daysUntil < 0;
  const ringColor = isPastDue
    ? "var(--danger-500)"
    : daysUntil <= 3
      ? "var(--danger-500)"
      : daysUntil <= 7
        ? "var(--warning-500)"
        : "var(--brand-primary-500)";

  const stroke = 3;
  const radius = size / 2 - stroke;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - (isPastDue ? 1 : progress));

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={radius} strokeWidth={stroke} fill="none" stroke="var(--ink-200)" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          stroke={ringColor}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: "stroke-dashoffset 500ms var(--ease-standard)" }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: stroke + 3,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: Math.max(12, size * 0.36),
          backgroundColor: iconColor + "20",
        }}
      >
        {icon}
      </div>
    </div>
  );
}
