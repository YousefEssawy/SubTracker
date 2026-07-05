import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useSubscriptions } from "@/contexts/SubscriptionContext";
import { formatCurrency } from "@/utils/currencies";
import { formatDate } from "@/utils/dateUtils";
import {
  HiOutlineMagnifyingGlass,
  HiOutlineCreditCard,
} from "react-icons/hi2";
import { useTranslation } from "react-i18next";
import type { Payment } from "@/models";

const HistoryPage = () => {
  const { payments, loading } = useSubscriptions();
  const { t } = useTranslation();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return payments.filter((p) =>
      p.subscriptionName?.toLowerCase().includes(search.toLowerCase()),
    );
  }, [payments, search]);

  // Group filtered payments by paid date, newest first.
  const groups = useMemo(() => {
    const map = new Map<string, Payment[]>();
    [...filtered]
      .sort((a, b) => b.paidDate.localeCompare(a.paidDate))
      .forEach((p) => {
        const key = p.paidDate;
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(p);
      });
    return Array.from(map.entries());
  }, [filtered]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5 pb-20 lg:pb-6"
    >
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {t("history.title")}
          </h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            {t("history.autoLogNote")}
          </p>
        </div>
        <div className="relative flex-1 sm:flex-initial">
          <HiOutlineMagnifyingGlass className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={t("history.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-56 ps-9 pe-3 py-2 rounded-full text-sm bg-gray-100 dark:bg-gray-800 border border-transparent focus:border-primary/40 focus:bg-white dark:focus:bg-gray-900 outline-none transition-colors placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Timeline */}
      {filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
            <HiOutlineCreditCard className="w-7 h-7 text-primary" />
          </div>
          <p className="text-gray-500 dark:text-gray-400">
            {payments.length === 0
              ? t("history.noHistoryYet")
              : t("history.noMatchingSearch")}
          </p>
          <p className="text-xs text-gray-400 mt-2">
            {t("history.autoLogNote")}
          </p>
        </div>
      ) : (
        <div className="glass-card p-2 sm:p-3 space-y-4">
          {groups.map(([date, items]) => (
            <div key={date}>
              <div className="flex items-center gap-2 px-4 mb-1">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <p className="text-sm font-bold text-gray-900 dark:text-white font-mono">
                  {formatDate(date)}
                </p>
                <span className="text-xs font-medium text-gray-400">
                  {items.length}
                </span>
              </div>
              {items.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
                >
                  <span className="flex-shrink-0 w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <HiOutlineCreditCard className="w-4 h-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white truncate">
                      {payment.subscriptionName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {payment.paymentMethod || "—"}
                    </p>
                  </div>
                  <span className="figure font-semibold text-gray-900 dark:text-white flex-shrink-0">
                    {formatCurrency(payment.amount, payment.currency)}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default HistoryPage;
