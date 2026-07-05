import { describe, it, expect } from "vitest";
import { format } from "date-fns";
import { getNextRenewalDate, isPastDue, isRenewingSoon } from "./dateUtils";

const ymd = (d: Date) => format(d, "yyyy-MM-dd");

describe("getNextRenewalDate", () => {
  it("advances weekly by 7 days", () => {
    const next = getNextRenewalDate("2026-01-01", "weekly");
    expect(ymd(next)).toBe("2026-01-08");
  });

  it("advances monthly by 1 month", () => {
    const next = getNextRenewalDate("2026-01-15", "monthly");
    expect(ymd(next)).toBe("2026-02-15");
  });

  it("advances yearly by 1 year", () => {
    const next = getNextRenewalDate("2026-03-01", "yearly");
    expect(ymd(next)).toBe("2027-03-01");
  });

  it("advances custom by the given number of days", () => {
    const next = getNextRenewalDate("2026-01-01", "custom", 10);
    expect(ymd(next)).toBe("2026-01-11");
  });
});

describe("isPastDue", () => {
  it("returns true for a date before today", () => {
    expect(isPastDue("2000-01-01")).toBe(true);
  });

  it("returns false for a date far in the future", () => {
    expect(isPastDue("2999-01-01")).toBe(false);
  });
});

describe("isRenewingSoon", () => {
  it("returns false for a date already past due", () => {
    expect(isRenewingSoon("2000-01-01")).toBe(false);
  });

  it("returns false for a date far beyond the threshold", () => {
    expect(isRenewingSoon("2999-01-01", 3)).toBe(false);
  });
});
