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

export const BILLING_CYCLES = [
  { id: "weekly", name: "Weekly", days: 7 },
  { id: "monthly", name: "Monthly", days: 30 },
  { id: "quarterly", name: "Quarterly", days: 90 },
  { id: "yearly", name: "Yearly", days: 365 },
  { id: "custom", name: "Custom", days: null },
];

export const getNextRenewalDate = (
  currentDate,
  billingCycle,
  customDays = null,
) => {
  const date =
    typeof currentDate === "string" ? parseISO(currentDate) : currentDate;

  switch (billingCycle) {
    case "weekly":
      return addWeeks(date, 1);
    case "monthly":
      return addMonths(date, 1);
    case "quarterly":
      return addMonths(date, 3);
    case "yearly":
      return addYears(date, 1);
    case "custom":
      return addDays(date, customDays || 30);
    default:
      return addMonths(date, 1);
  }
};

export const getDaysUntilRenewal = (renewalDate) => {
  const date =
    typeof renewalDate === "string" ? parseISO(renewalDate) : renewalDate;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return differenceInDays(date, today);
};

export const isRenewingSoon = (renewalDate, daysThreshold = 3) => {
  const days = getDaysUntilRenewal(renewalDate);
  return days >= 0 && days <= daysThreshold;
};

export const isPastDue = (renewalDate) => {
  const date =
    typeof renewalDate === "string" ? parseISO(renewalDate) : renewalDate;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return isBefore(date, today);
};

export const formatDate = (date) => {
  if (!date) return "";
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "MMM dd, yyyy");
};

export const formatDateShort = (date) => {
  if (!date) return "";
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "MMM dd");
};

export const toDateInputValue = (date) => {
  if (!date) return "";
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "yyyy-MM-dd");
};

export const getMonthlyEquivalent = (
  price,
  billingCycle,
  customCycleDays = null,
) => {
  switch (billingCycle) {
    case "weekly":
      return price * (52 / 12);
    case "monthly":
      return price;
    case "quarterly":
      return price / 3;
    case "yearly":
      return price / 12;
    case "custom":
      return customCycleDays ? (price / customCycleDays) * 30 : price;
    default:
      return price;
  }
};

export const getYearlyEquivalent = (
  price,
  billingCycle,
  customCycleDays = null,
) => {
  return getMonthlyEquivalent(price, billingCycle, customCycleDays) * 12;
};

// ── Recurrence Helpers ──

/**
 * Advance a date by the given recurrence pattern and interval.
 * @param {string|Date} currentDate
 * @param {"Weekly"|"Monthly"|"Yearly"|"Custom"} pattern
 * @param {number} interval  e.g. 2 → "every 2 weeks"
 * @returns {Date}
 */
export const calculateNextExecutionDate = (
  currentDate,
  pattern,
  interval = 1,
) => {
  const d =
    typeof currentDate === "string" ? parseISO(currentDate) : currentDate;
  switch (pattern) {
    case "Weekly":
      return addDays(d, 7 * interval);
    case "Monthly":
      return addMonths(d, interval);
    case "Yearly":
      return addYears(d, interval);
    case "Custom":
      return addDays(d, interval);
    default:
      return addMonths(d, interval);
  }
};

/**
 * Count how many occurrences would have happened between startDate and today.
 */
export const countRetroactiveOccurrences = (
  startDate,
  pattern,
  interval = 1,
) => {
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

/**
 * Generate an array of retroactive dates from startDate up to today.
 */
export const generateRetroactiveDates = (
  startDate,
  pattern,
  interval = 1,
  maxCount = 120,
) => {
  const start = typeof startDate === "string" ? parseISO(startDate) : startDate;
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const dates = [];
  let cursor = start;
  while (isBefore(cursor, today) && dates.length < maxCount) {
    dates.push(format(cursor, "yyyy-MM-dd"));
    cursor = calculateNextExecutionDate(cursor, pattern, interval);
  }
  return dates;
};
