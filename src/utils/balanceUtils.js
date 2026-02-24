/**
 * Computes per-currency balances from a flat array of transactions.
 *
 * @param {Array} transactions - array of transaction objects
 * @returns {Object} Map keyed by currency code:
 *   { [currency]: { income: number, expense: number, balance: number } }
 *
 * IMPORTANT: currencies are NEVER summed together.
 */
export const computeBalances = (transactions = []) => {
  const result = {};

  for (const tx of transactions) {
    const { currency, type, amount } = tx;
    if (!currency || !type || amount == null) continue;

    if (!result[currency]) {
      result[currency] = { income: 0, expense: 0, balance: 0 };
    }

    const rounded = Math.round(amount * 100) / 100;

    if (type === "Income") {
      result[currency].income =
        Math.round((result[currency].income + rounded) * 100) / 100;
    } else if (type === "Expense") {
      result[currency].expense =
        Math.round((result[currency].expense + rounded) * 100) / 100;
    }
  }

  // Compute net balance for each currency
  for (const currency of Object.keys(result)) {
    result[currency].balance =
      Math.round((result[currency].income - result[currency].expense) * 100) /
      100;
  }

  return result;
};

/**
 * Filters a transaction array by optional filter criteria.
 *
 * @param {Array} transactions
 * @param {Object} filters
 *   - spaceId?: string
 *   - currency?: string
 *   - type?: "Income" | "Expense"
 *   - dateRange?: { start: string, end: string } — YYYY-MM-DD strings
 *   - tag?: string
 * @returns {Array} filtered transactions
 */
export const filterTransactions = (transactions = [], filters = {}) => {
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
