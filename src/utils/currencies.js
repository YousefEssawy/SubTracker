export const CURRENCIES = [
  { code: "EGP", name: "Egyptian Pound", symbol: "E£" },
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "SAR", name: "Saudi Riyal", symbol: "﷼" },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ" },
];

export const DEFAULT_CURRENCY = "EGP";

// Static exchange rates (relative to USD)
export const EXCHANGE_RATES = {
  USD: 1,
  EGP: 50.5,
  EUR: 0.92,
  GBP: 0.79,
  SAR: 3.75,
  AED: 3.67,
};

export const convertCurrency = (amount, fromCurrency, toCurrency) => {
  if (fromCurrency === toCurrency) return amount;
  const amountInUSD = amount / EXCHANGE_RATES[fromCurrency];
  return amountInUSD * EXCHANGE_RATES[toCurrency];
};

export const formatCurrency = (amount, currencyCode = "EGP") => {
  const currency = CURRENCIES.find((c) => c.code === currencyCode);
  const symbol = currency ? currency.symbol : currencyCode;
  return `${symbol} ${amount.toFixed(2)}`;
};
