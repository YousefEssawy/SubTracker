import type { BillingCycle } from "@/models";

const CYCLE_DAYS: Record<BillingCycle, number> = {
  weekly: 7,
  monthly: 30,
  yearly: 365,
  custom: 30,
};

interface RenewalDialProps {
  /** Emoji or short glyph rendered at the dial's center. */
  icon: string;
  /** Category color used to tint the center fill. */
  iconColor: string;
  /** Days remaining until renewal (negative if past-due). */
  daysUntil: number;
  billingCycle: BillingCycle;
  customCycleDays?: number | null;
  size?: number;
  className?: string;
}

/**
 * Renewal Dial — the app's signature "how far through the billing cycle"
 * indicator. Replaces a plain square category icon with a ring that fills
 * as the next renewal approaches, so the countdown reads at a glance
 * without a separate progress bar or badge.
 */
const RenewalDial = ({
  icon,
  iconColor,
  daysUntil,
  billingCycle,
  customCycleDays,
  size = 44,
  className = "",
}: RenewalDialProps) => {
  const cycleDays =
    billingCycle === "custom"
      ? customCycleDays || CYCLE_DAYS.custom
      : CYCLE_DAYS[billingCycle];

  const progress = Math.min(
    1,
    Math.max(0, (cycleDays - daysUntil) / cycleDays),
  );

  const isPastDue = daysUntil < 0;
  const ringColorClass = isPastDue
    ? "stroke-danger"
    : daysUntil <= 3
      ? "stroke-danger"
      : daysUntil <= 7
        ? "stroke-warning"
        : "stroke-primary";

  const stroke = 3;
  const radius = size / 2 - stroke;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - (isPastDue ? 1 : progress));

  return (
    <div
      className={`relative flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label={
        isPastDue
          ? "Renewal overdue"
          : `${daysUntil} day${daysUntil === 1 ? "" : "s"} until renewal`
      }
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="absolute inset-0 -rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          className="fill-none stroke-gray-200 dark:stroke-gray-700"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className={`fill-none transition-[stroke-dashoffset] duration-500 ease-standard ${ringColorClass}`}
        />
      </svg>
      <div
        className="absolute rounded-full flex items-center justify-center text-lg"
        style={{
          inset: stroke + 3,
          backgroundColor: iconColor + "20",
        }}
      >
        {icon}
      </div>
    </div>
  );
};

export default RenewalDial;
