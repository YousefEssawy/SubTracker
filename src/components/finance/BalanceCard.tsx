import { AnimatePresence, motion } from "framer-motion";
import { HiOutlineBanknotes } from "react-icons/hi2";
import { useTranslation } from "react-i18next";
import type { BalanceMap, CurrencyBalance } from "@/models";

const currencySymbolMap: Record<string, string> = {
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

const fmt = (value: number) => {
  try {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(value));
  } catch {
    return Math.abs(value).toFixed(2);
  }
};

interface CurrencyBlockProps {
  currency: string;
  data: CurrencyBalance;
  compact?: boolean;
}

const CurrencyBlock = ({ currency, data, compact }: CurrencyBlockProps) => {
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
          className={`figure text-sm font-bold ${isPositive ? "text-success" : "text-danger"}`}
        >
          {isPositive ? "+" : "-"}
          {symbol} {fmt(data.balance)}
        </span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <HiOutlineBanknotes className="w-4 h-4 text-gray-400" />
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {currency}
          </span>
        </div>
        <span
          className={`figure text-base font-bold ${isPositive ? "text-success" : "text-danger"}`}
        >
          {isPositive ? "+" : "-"}
          {symbol} {fmt(data.balance)}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-success/10 rounded-xl p-3">
          <p className="text-xs text-success font-medium mb-0.5">
            {t("finance.balance.income", "Income")}
          </p>
          <p className="figure text-sm font-semibold text-success">
            {symbol} {fmt(data.income)}
          </p>
        </div>
        <div className="bg-danger/10 rounded-xl p-3">
          <p className="text-xs text-danger font-medium mb-0.5">
            {t("finance.balance.expenses", "Expense")}
          </p>
          <p className="figure text-sm font-semibold text-danger">
            {symbol} {fmt(data.expense)}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

interface BalanceCardProps {
  variant?: "summary" | "contextual";
  balances?: BalanceMap;
}

const BalanceCard = ({
  variant = "summary",
  balances = {},
}: BalanceCardProps) => {
  const currencies = Object.keys(balances);
  const { t } = useTranslation();

  if (currencies.length === 0) {
    if (variant === "contextual") return null;
    return (
      <div className="glass-card p-5 mb-5 text-center">
        <p className="text-sm text-gray-400">
          {t("finance.balance.noData", "No financial data yet.")}
        </p>
      </div>
    );
  }

  if (variant === "contextual") {
    return (
      <div className="glass-card px-5 py-4 mb-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
          {t("finance.balance.title", "Balance")}
        </p>
        <AnimatePresence mode="wait">
          {(currencies as import("@/models/common").CurrencyCode[]).map(
            (cur) => (
              <CurrencyBlock
                key={cur}
                currency={cur}
                data={balances[cur]!}
                compact
              />
            ),
          )}
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
        {(currencies as import("@/models/common").CurrencyCode[]).map((cur) => (
          <CurrencyBlock
            key={cur}
            currency={cur}
            data={balances[cur]!}
            compact={false}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default BalanceCard;
