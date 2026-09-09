/**
 * Shared date calculation module imported by both the Cloud Function and the frontend.
 * Located in functions/ because firebase.json packages only the functions directory.
 * Must stay dependency-free because it runs in both a browser bundle and a Node function.
 */

/**
 * Add `months` calendar months to `d`, clamping to the last valid day of the
 * target month instead of overflowing into the following month (e.g. Jan 31
 * + 1 month -> Feb 28/29, not Mar 3).
 */
function addMonthsClamped(d, months) {
  const day = d.getUTCDate();
  const targetMonthIndex = d.getUTCMonth() + months;
  const result = new Date(Date.UTC(d.getUTCFullYear(), targetMonthIndex, 1));
  const daysInTargetMonth = new Date(
    Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0),
  ).getUTCDate();
  result.setUTCDate(Math.min(day, daysInTargetMonth));
  return result;
}

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Calculate the next execution date given a pattern + interval.
 */
function advanceDate(dateStr, pattern, interval) {
  if (typeof dateStr !== "string" || !DATE_REGEX.test(dateStr)) {
    throw new Error(`Invalid date format: ${dateStr}. Expected YYYY-MM-DD.`);
  }
  const d = new Date(dateStr + "T00:00:00Z");
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== dateStr) {
    throw new Error(`Invalid date format: ${dateStr}. Expected YYYY-MM-DD.`);
  }

  if (!Number.isInteger(interval) || interval < 1) {
    throw new Error(`Interval must be an integer >= 1, received: ${interval}`);
  }

  switch (pattern) {
    case "daily":
      d.setUTCDate(d.getUTCDate() + interval);
      return d.toISOString().slice(0, 10);
    case "weekly":
      d.setUTCDate(d.getUTCDate() + 7 * interval);
      return d.toISOString().slice(0, 10);
    case "monthly":
      return addMonthsClamped(d, interval).toISOString().slice(0, 10);
    case "yearly":
      // Clamp Feb 29 anchors to Feb 28 on non-leap target years instead of
      // overflowing to Mar 1.
      return addMonthsClamped(d, interval * 12).toISOString().slice(0, 10);
    default:
      throw new Error(`Unknown recurrence pattern: ${pattern}`);
  }
}

export { addMonthsClamped, advanceDate };
