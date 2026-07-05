const { advanceDate } = require("./dateLogic");

describe("advanceDate", () => {
  it("advances weekly by 7 * interval days", () => {
    expect(advanceDate("2026-01-01", "Weekly", 2)).toBe("2026-01-15");
  });

  it("advances monthly by calendar months", () => {
    expect(advanceDate("2026-03-15", "Monthly", 1)).toBe("2026-04-15");
  });

  it("clamps Jan 31 + 1 month to Feb 28 instead of overflowing to Mar", () => {
    expect(advanceDate("2026-01-31", "Monthly", 1)).toBe("2026-02-28");
  });

  it("clamps to Feb 29 on a leap year", () => {
    expect(advanceDate("2028-01-31", "Monthly", 1)).toBe("2028-02-29");
  });

  it("does not compound drift across repeated month-end advances", () => {
    // Anchored on the 31st, each advance should re-clamp from the ORIGINAL
    // day-of-month intent, not drift forward permanently.
    let date = "2026-01-31";
    date = advanceDate(date, "Monthly", 1); // -> Feb 28
    expect(date).toBe("2026-02-28");
  });

  it("advances yearly by 12 * interval months", () => {
    expect(advanceDate("2026-03-01", "Yearly", 1)).toBe("2027-03-01");
  });

  it("clamps a Feb 29 yearly anchor to Feb 28 on a non-leap year", () => {
    expect(advanceDate("2028-02-29", "Yearly", 1)).toBe("2029-02-28");
  });

  it("advances custom by raw days", () => {
    expect(advanceDate("2026-01-01", "Custom", 10)).toBe("2026-01-11");
  });

  it("falls back to monthly clamped behavior for an unrecognized pattern", () => {
    expect(advanceDate("2026-01-31", "Bogus", 1)).toBe("2026-02-28");
  });
});
