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

/**
 * Calculate the next execution date given a pattern + interval.
 */
function advanceDate(dateStr, pattern, interval) {
  const d = new Date(dateStr + "T00:00:00Z");
  switch (pattern) {
    case "Weekly":
      d.setUTCDate(d.getUTCDate() + 7 * interval);
      return d.toISOString().slice(0, 10);
    case "Monthly":
      return addMonthsClamped(d, interval).toISOString().slice(0, 10);
    case "Yearly":
      // Clamp Feb 29 anchors to Feb 28 on non-leap target years instead of
      // overflowing to Mar 1.
      return addMonthsClamped(d, interval * 12).toISOString().slice(0, 10);
    case "Custom":
      d.setUTCDate(d.getUTCDate() + interval);
      return d.toISOString().slice(0, 10);
    default:
      return addMonthsClamped(d, interval).toISOString().slice(0, 10);
  }
}

module.exports = { addMonthsClamped, advanceDate };
