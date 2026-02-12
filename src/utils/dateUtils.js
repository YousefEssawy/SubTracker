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
