import type { Transaction } from "@/models/transaction";
import type { CurrencyBalance, BalanceMap } from "@/models/balance";
import type { CurrencyCode } from "@/models/common";

/**
 * Optional filters for transaction queries.
 */
export interface TransactionFilters {
  spaceId?: string;
  currency?: CurrencyCode;
  type?: "Income" | "Expense";
  dateRange?: { start?: string; end?: string };
  tag?: string;
  pageSize?: number;
  startAfterDoc?: unknown;
}

/**
 * Computes per-currency balances from a flat array of transactions.
 * Currencies are NEVER summed together.
 *
 * @returns BalanceMap keyed by currency code — only currencies present in the input appear in the result.
 */
export const computeBalances = (
  transactions: Transaction[] = [],
): BalanceMap => {
  const result: Partial<Record<CurrencyCode, CurrencyBalance>> = {};

  for (const tx of transactions) {
    const { currency, type, amount } = tx;
    if (!currency || !type || amount == null) continue;

    if (!result[currency]) {
      result[currency] = { income: 0, expense: 0, balance: 0 };
    }

    // Non-null assertion safe: we just initialised it above
    const entry = result[currency]!;
    const rounded = Math.round(amount * 100) / 100;

    if (type === "Income") {
      entry.income = Math.round((entry.income + rounded) * 100) / 100;
    } else if (type === "Expense") {
      entry.expense = Math.round((entry.expense + rounded) * 100) / 100;
    }
  }

  for (const currency of Object.keys(result) as CurrencyCode[]) {
    const entry = result[currency]!;
    entry.balance = Math.round((entry.income - entry.expense) * 100) / 100;
  }

  return result;
};

/**
 * Filters a transaction array by optional filter criteria.
 */
export const filterTransactions = (
  transactions: Transaction[] = [],
  filters: TransactionFilters = {},
): Transaction[] => {
  const { spaceId, currency, type, dateRange, tag } = filters;

  return transactions.filter((tx) => {
    if (spaceId && tx.spaceId !== spaceId) return false;
    if (currency && tx.currency !== currency) return false;
    if (type && tx.type !== type) return false;

    if (dateRange?.start && tx.transactionDate < dateRange.start) return false;
    if (dateRange?.end && tx.transactionDate > dateRange.end) return false;

    if (
      tag &&
      (!Array.isArray(tx.tags) || !tx.tags.includes(tag.toLowerCase().trim()))
    ) {
      return false;
    }

    return true;
  });
};
