import { AnimatePresence } from "framer-motion";
import { HiOutlineBanknotes } from "react-icons/hi2";
import { useTranslation } from "react-i18next";

const currencySymbolMap = {
  EGP: "E£",
  USD: "$",
  EUR: "€",
  GBP: "£",
  SAR: "﷼",
  AED: "د.إ",
  QAR: "﷼",
  KWD: "د.ك",
  BHD: "BD",
  OMR: "﷼",
  JOD: "JD",
  LBP: "ل.ل",
  TRY: "₺",
  CNY: "¥",
  JPY: "¥",
  INR: "₹",
  CAD: "CA$",
  AUD: "A$",
};

const fmt = (value) => {
  try {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(value));
  } catch {
    return Math.abs(value).toFixed(2);
  }
};

const CurrencyBlock = ({ currency, data, compact }) => {
  const symbol = currencySymbolMap[currency] || currency;
  const isPositive = data.balance >= 0;
  const { t } = useTranslation();

  if (compact) {
    return (
      <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          {currency}
        </span>
        <span
          className={`text-sm font-bold ${isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}
        >
          {isPositive ? "+" : "-"}
          {symbol} {fmt(data.balance, currency)}
        </span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-surface-dark rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <HiOutlineBanknotes className="w-4 h-4 text-gray-400" />
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {currency}
          </span>
        </div>
        <span
          className={`text-base font-bold ${isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}
        >
          {isPositive ? "+" : "-"}
          {symbol} {fmt(data.balance, currency)}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3">
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-0.5">
            {t("finance.balance.income", "Income")}
          </p>
          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
            {symbol} {fmt(data.income, currency)}
          </p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-3">
          <p className="text-xs text-red-500 dark:text-red-400 font-medium mb-0.5">
            {t("finance.balance.expenses", "Expense")}
          </p>
          <p className="text-sm font-semibold text-red-600 dark:text-red-300">
            {symbol} {fmt(data.expense, currency)}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

/**
 * BalanceCard — displays computed balances grouped by currency.
 *
 * @param {{ variant: "summary" | "contextual", balances: object }} props
 *   - summary:    full card for dashboard
 *   - contextual: compact inline header for TransactionsPage
 */
const BalanceCard = ({ variant = "summary", balances = {} }) => {
  const currencies = Object.keys(balances);
  const { t } = useTranslation();

  if (currencies.length === 0) {
    if (variant === "contextual") return null;
    return (
      <div className="bg-white dark:bg-surface-dark rounded-2xl border border-gray-200 dark:border-gray-800 p-5 mb-5 text-center">
        <p className="text-sm text-gray-400">
          {t("finance.balance.noData", "No financial data yet.")}
        </p>
      </div>
    );
  }

  if (variant === "contextual") {
    return (
      <div className="bg-white dark:bg-surface-dark rounded-2xl border border-gray-200 dark:border-gray-800 px-5 py-4 mb-4 shadow-sm">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
          {t("finance.balance.title", "Balance")}
        </p>
        <AnimatePresence mode="wait">
          {currencies.map((cur) => (
            <CurrencyBlock
              key={cur}
              currency={cur}
              data={balances[cur]}
              compact
            />
          ))}
        </AnimatePresence>
      </div>
    );
  }

  // summary variant — grid of full cards
  return (
    <div
      className={`grid gap-4 mb-6 ${currencies.length === 1 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"}`}
    >
      <AnimatePresence>
        {currencies.map((cur) => (
          <CurrencyBlock
            key={cur}
            currency={cur}
            data={balances[cur]}
            compact={false}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default BalanceCard;
