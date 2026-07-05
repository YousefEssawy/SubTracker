import { describe, it, expect } from "vitest";
import { computeBalances, filterTransactions } from "./balanceUtils";
import type { Transaction } from "@/models/transaction";

const tx = (overrides: Partial<Transaction>): Transaction =>
  ({
    id: "t1",
    spaceId: "space1",
    categoryId: "cat1",
    type: "Expense",
    amount: 100,
    currency: "EGP",
    transactionDate: "2026-01-01",
    notes: null,
    tags: [],
    attachmentUrl: null,
    attachmentMeta: null,
    recurrenceId: null,
    createdAt: null,
    updatedAt: null,
    ...overrides,
  }) as Transaction;

describe("computeBalances", () => {
  it("returns an empty map for no transactions", () => {
    expect(computeBalances([])).toEqual({});
  });

  it("sums income and expense per currency independently", () => {
    const result = computeBalances([
      tx({ type: "Income", amount: 500, currency: "EGP" }),
      tx({ type: "Expense", amount: 200, currency: "EGP" }),
      tx({ type: "Income", amount: 50, currency: "USD" }),
    ]);

    expect(result.EGP).toEqual({ income: 500, expense: 200, balance: 300 });
    expect(result.USD).toEqual({ income: 50, expense: 0, balance: 50 });
  });

  it("never mixes currencies together", () => {
    const result = computeBalances([
      tx({ type: "Income", amount: 100, currency: "EGP" }),
      tx({ type: "Income", amount: 100, currency: "USD" }),
    ]);
    expect(Object.keys(result).sort()).toEqual(["EGP", "USD"]);
  });

  it("skips transactions missing currency, type, or amount", () => {
    const result = computeBalances([
      tx({ currency: undefined as unknown as "EGP" }),
      tx({ amount: null as unknown as number }),
    ]);
    expect(result).toEqual({});
  });

  it("rounds to 2 decimal places, avoiding float drift", () => {
    const result = computeBalances([
      tx({ type: "Income", amount: 0.1, currency: "EGP" }),
      tx({ type: "Income", amount: 0.2, currency: "EGP" }),
    ]);
    expect(result.EGP!.income).toBe(0.3);
  });
});

describe("filterTransactions", () => {
  const transactions = [
    tx({ id: "1", spaceId: "a", currency: "EGP", type: "Income", transactionDate: "2026-01-05" }),
    tx({ id: "2", spaceId: "b", currency: "USD", type: "Expense", transactionDate: "2026-02-10" }),
  ];

  it("filters by spaceId", () => {
    expect(filterTransactions(transactions, { spaceId: "a" }).map((t) => t.id)).toEqual(["1"]);
  });

  it("filters by currency", () => {
    expect(filterTransactions(transactions, { currency: "USD" }).map((t) => t.id)).toEqual(["2"]);
  });

  it("filters by date range", () => {
    expect(
      filterTransactions(transactions, {
        dateRange: { start: "2026-02-01", end: "2026-02-28" },
      }).map((t) => t.id),
    ).toEqual(["2"]);
  });

  it("returns all transactions when no filters given", () => {
    expect(filterTransactions(transactions)).toHaveLength(2);
  });
});
