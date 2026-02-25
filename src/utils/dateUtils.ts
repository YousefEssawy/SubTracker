import {
  addDays,
  addWeeks,
  addMonths,
  addYears,
  differenceInDays,
  format,
  isBefore,
  parseISO,
} from "date-fns";
import i18n from "@/i18n";
import type { BillingCycle } from "@/models/subscription";
import type { RecurrencePattern } from "@/models/recurrence";
import type { DateString } from "@/models/common";

/** A billing cycle constant entry used by forms */
export interface BillingCycleOption {
  id: BillingCycle;
  name: string;
  days: number | null;
}

export const BILLING_CYCLES: readonly BillingCycleOption[] = [
  { id: "weekly", name: "Weekly", days: 7 },
  { id: "monthly", name: "Monthly", days: 30 },
  { id: "yearly", name: "Yearly", days: 365 },
  { id: "custom", name: "Custom", days: null },
] as const;

/**
 * Returns the next renewal Date after `currentDate` for the given billing cycle.
 */
export const getNextRenewalDate = (
  currentDate: Date | DateString,
  billingCycle: BillingCycle,
  customDays: number | null = null,
): Date => {
  const date =
    typeof currentDate === "string" ? parseISO(currentDate) : currentDate;

  switch (billingCycle) {
    case "weekly":
      return addWeeks(date, 1);
    case "monthly":
      return addMonths(date, 1);
    case "yearly":
      return addYears(date, 1);
    case "custom":
      return addDays(date, customDays ?? 30);
    default:
      return addMonths(date, 1);
  }
};

/** Returns how many days until the given renewal date (negative if past-due). */
export const getDaysUntilRenewal = (renewalDate: Date | DateString): number => {
  const date =
    typeof renewalDate === "string" ? parseISO(renewalDate) : renewalDate;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return differenceInDays(date, today);
};

/** Returns true if the renewal is within `daysThreshold` days (default 3). */
export const isRenewingSoon = (
  renewalDate: Date | DateString,
  daysThreshold = 3,
): boolean => {
  const days = getDaysUntilRenewal(renewalDate);
  return days >= 0 && days <= daysThreshold;
};

/** Returns true if the renewal date is before today. */
export const isPastDue = (renewalDate: Date | DateString): boolean => {
  const date =
    typeof renewalDate === "string" ? parseISO(renewalDate) : renewalDate;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return isBefore(date, today);
};

/** Formats a date as a human-readable localised string (e.g. "Feb 25, 2026"). */
export const formatDate = (
  date: Date | DateString | null | undefined,
): string => {
  if (!date) return "";
  const d = typeof date === "string" ? parseISO(date) : date;
  const locale = (i18n.language as string) || "en-US";
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
};

/** Formats a date without the year (e.g. "Feb 25"). */
export const formatDateShort = (
  date: Date | DateString | null | undefined,
): string => {
  if (!date) return "";
  const d = typeof date === "string" ? parseISO(date) : date;
  const locale = (i18n.language as string) || "en-US";
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
  }).format(d);
};

/** Formats a date as a YYYY-MM-DD string suitable for `<input type="date">`. */
export const toDateInputValue = (
  date: Date | DateString | null | undefined,
): string => {
  if (!date) return "";
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "yyyy-MM-dd");
};

/**
 * Returns the monthly cost equivalent for a given price + billing cycle.
 * Used for cost comparison and stats cards.
 */
export const getMonthlyEquivalent = (
  price: number,
  billingCycle: BillingCycle,
  customCycleDays: number | null = null,
): number => {
  switch (billingCycle) {
    case "weekly":
      return price * (52 / 12);
    case "monthly":
      return price;
    case "yearly":
      return price / 12;
    case "custom":
      return customCycleDays ? (price / customCycleDays) * 30 : price;
    default:
      return price;
  }
};

/** Returns the yearly cost equivalent. */
export const getYearlyEquivalent = (
  price: number,
  billingCycle: BillingCycle,
  customCycleDays: number | null = null,
): number => getMonthlyEquivalent(price, billingCycle, customCycleDays) * 12;

// ── Recurrence helpers ─────────────────────────────────────────────────────

/**
 * Advances a date by the given recurrence pattern and interval.
 * Note: pattern strings here are capitalised ("Weekly") to match legacy recurrence data.
 */
export const calculateNextExecutionDate = (
  currentDate: Date | DateString,
  pattern: RecurrencePattern | string,
  interval = 1,
): Date => {
  const d =
    typeof currentDate === "string" ? parseISO(currentDate) : currentDate;
  const normalised = pattern.toLowerCase();
  switch (normalised) {
    case "weekly":
      return addDays(d, 7 * interval);
    case "monthly":
      return addMonths(d, interval);
    case "yearly":
      return addYears(d, interval);
    case "daily":
      return addDays(d, interval);
    default:
      return addMonths(d, interval);
  }
};

/** Counts how many recurrence occurrences have passed between startDate and now. */
export const countRetroactiveOccurrences = (
  startDate: Date | DateString,
  pattern: RecurrencePattern | string,
  interval = 1,
): number => {
  const start = typeof startDate === "string" ? parseISO(startDate) : startDate;
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  let count = 0;
  let cursor = start;
  while (isBefore(cursor, today) && count < 500) {
    count++;
    cursor = calculateNextExecutionDate(cursor, pattern, interval);
  }
  return count;
};

/** Generates an array of retroactive date strings (YYYY-MM-DD) from startDate to today. */
export const generateRetroactiveDates = (
  startDate: Date | DateString,
  pattern: RecurrencePattern | string,
  interval = 1,
  maxCount = 120,
): DateString[] => {
  const start = typeof startDate === "string" ? parseISO(startDate) : startDate;
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const dates: DateString[] = [];
  let cursor: Date = start;
  while (isBefore(cursor, today) && dates.length < maxCount) {
    dates.push(format(cursor, "yyyy-MM-dd"));
    cursor = calculateNextExecutionDate(cursor, pattern, interval);
  }
  return dates;
};
