import type { ReactNode } from "react";
import { HiOutlineXMark } from "react-icons/hi2";

export interface BadgeProps {
  tone?: "primary" | "success" | "warning" | "danger" | "neutral";
  children?: ReactNode;
  onRemove?: () => void;
  className?: string;
}

const toneClasses: Record<NonNullable<BadgeProps["tone"]>, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-danger/10 text-danger",
  neutral: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400",
};

const Badge = ({ tone = "primary", children, onRemove, className = "" }: BadgeProps) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${toneClasses[tone]} ${className}`.trim()}
    >
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove"
          className="inline-flex opacity-70 hover:opacity-100 transition-opacity"
        >
          <HiOutlineXMark className="w-3 h-3" />
        </button>
      )}
    </span>
  );
};

export default Badge;
