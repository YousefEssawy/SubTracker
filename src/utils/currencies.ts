import i18n from "@/i18n";
import type { CurrencyCode } from "@/models/common";

/** A supported currency definition */
export interface CurrencyDefinition {
  code: CurrencyCode;
  name: string;
  symbol: string;
}

/** Static exchange rates relative to USD */
export type ExchangeRateMap = Record<CurrencyCode, number>;

export const CURRENCIES: readonly CurrencyDefinition[] = [
  { code: "EGP", name: "Egyptian Pound", symbol: "E£" },
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "SAR", name: "Saudi Riyal", symbol: "﷼" },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ" },
] as const;

export const DEFAULT_CURRENCY: CurrencyCode = "EGP";

export const EXCHANGE_RATES: ExchangeRateMap = {
  USD: 1,
  EGP: 50.5,
  EUR: 0.92,
  GBP: 0.79,
  SAR: 3.75,
  AED: 3.67,
};

/**
 * Converts an amount from one currency to another using static exchange rates.
 */
export const convertCurrency = (
  amount: number,
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode,
): number => {
  if (fromCurrency === toCurrency) return amount;
  const amountInUSD = amount / EXCHANGE_RATES[fromCurrency];
  return amountInUSD * EXCHANGE_RATES[toCurrency];
};

/**
 * Formats an amount as a localised currency string.
 */
export const formatCurrency = (
  amount: number,
  currencyCode: CurrencyCode = "EGP",
): string => {
  const locale = (i18n.language as string) || "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode,
  }).format(amount);
};
