/**
 * Shared document builder module imported by both the client writer and the emulator test.
 * Located in functions/shared/ because it must stay dependency-free so it can load in a Node
 * test without a DOM, avoiding any browser-coupled dependencies (e.g. i18n, localStorage).
 */

import { advanceDate } from "./recurrenceDates.js";

/**
 * Builds the canonical document shape for a Recurrence.
 * Returns every field except createdAt, which remains the caller's responsibility.
 */
function buildRecurrenceDocument(data) {
  const pattern =
    typeof data.pattern === "string" ? data.pattern.toLowerCase() : data.pattern;
  const nextDate = advanceDate(data.startDate, pattern, data.interval ?? 1);

  return {
    type: data.type,
    spaceId: data.spaceId,
    categoryId: data.categoryId,
    amount: Math.round(data.amount * 100) / 100,
    currency: data.currency,
    pattern: data.pattern,
    interval: data.interval ?? 1,
    startDate: data.startDate,
    endDate: data.endDate ?? null,
    nextDate,
    status: data.status ?? "active",
  };
}

export { buildRecurrenceDocument };
