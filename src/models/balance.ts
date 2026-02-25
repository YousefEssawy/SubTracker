import type { CurrencyCode } from "./common";

/** Per-currency aggregated financial summary */
export interface CurrencyBalance {
  income: number;
  expense: number;
  balance: number;
}

/**
 * Map of currency code to its balance summary.
 * Keys are CurrencyCode values; currencies are never summed across.
 */
export type BalanceMap = Partial<Record<CurrencyCode, CurrencyBalance>>;
