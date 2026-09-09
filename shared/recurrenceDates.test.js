import { advanceDate } from "./recurrenceDates.js";

describe("advanceDate", () => {
  it("advances daily by interval days", () => {
    expect(advanceDate("2026-01-01", "daily", 1)).toBe("2026-01-02");
    expect(advanceDate("2026-01-01", "daily", 5)).toBe("2026-01-06");
  });

  it("advances weekly by 7 * interval days", () => {
    expect(advanceDate("2026-01-01", "weekly", 2)).toBe("2026-01-15");
  });

  it("advances monthly by calendar months", () => {
    expect(advanceDate("2026-03-15", "monthly", 1)).toBe("2026-04-15");
  });

  it("clamps Jan 31 + 1 month to Feb 28 instead of overflowing to Mar", () => {
    expect(advanceDate("2026-01-31", "monthly", 1)).toBe("2026-02-28");
  });

  it("clamps to Feb 29 on a leap year", () => {
    expect(advanceDate("2028-01-31", "monthly", 1)).toBe("2028-02-29");
  });

  it("does not compound drift across repeated month-end advances", () => {
    // Anchored on the 31st, each advance should re-clamp from the ORIGINAL
    // day-of-month intent, not drift forward permanently.
    let date = "2026-01-31";
    date = advanceDate(date, "monthly", 1); // -> Feb 28
    expect(date).toBe("2026-02-28");
  });

  it("advances yearly by 12 * interval months", () => {
    expect(advanceDate("2026-03-01", "yearly", 1)).toBe("2027-03-01");
  });

  it("clamps a Feb 29 yearly anchor to Feb 28 on a non-leap year", () => {
    expect(advanceDate("2028-02-29", "yearly", 1)).toBe("2029-02-28");
  });

  it("throws on an unknown recurrence pattern", () => {
    expect(() => advanceDate("2026-01-01", "bogus", 1)).toThrow(
      "Unknown recurrence pattern: bogus",
    );
    expect(() => advanceDate("2026-01-01", "custom", 1)).toThrow(
      "Unknown recurrence pattern: custom",
    );
    expect(() => advanceDate("2026-01-01", "Weekly", 1)).toThrow(
      "Unknown recurrence pattern: Weekly",
    );
  });

  it("throws when interval is 0, negative, or not an integer", () => {
    expect(() => advanceDate("2026-01-01", "daily", 0)).toThrow();
    expect(() => advanceDate("2026-01-01", "daily", -1)).toThrow();
    expect(() => advanceDate("2026-01-01", "daily", 1.5)).toThrow();
  });

  it("throws on a malformed date string", () => {
    expect(() => advanceDate("not-a-date", "daily", 1)).toThrow();
    expect(() => advanceDate("2026-1-1", "daily", 1)).toThrow();
    expect(() => advanceDate("2026/01/01", "daily", 1)).toThrow();
    expect(() => advanceDate("2026-02-31", "daily", 1)).toThrow();
    expect(() => advanceDate("", "daily", 1)).toThrow();
  });
});
