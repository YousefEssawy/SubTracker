import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useSubscriptions } from "@/contexts/SubscriptionContext";
import { formatCurrency } from "@/utils/currencies";
import { formatDate } from "@/utils/dateUtils";
import { HiOutlineMagnifyingGlass } from "react-icons/hi2";
import { useTranslation } from "react-i18next";

const HistoryPage = () => {
  const { payments, loading } = useSubscriptions();
  const { t } = useTranslation();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return payments.filter((p) =>
      p.subscriptionName?.toLowerCase().includes(search.toLowerCase()),
    );
  }, [payments, search]);

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
      className="space-y-6 pb-20 lg:pb-6"
    >
      <h1 className="page-title">{t("history.title")}</h1>

      {/* Search */}
      <div className="glass-card p-4">
        <div className="relative">
          <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={t("history.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9 text-sm"
          />
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-4xl mb-3">📄</p>
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
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">
                    {t("history.subscription")}
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">
                    {t("history.date")}
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">
                    {t("history.amount")}
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3 hidden sm:table-cell">
                    {t("history.paymentMethod")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filtered.map((payment) => (
                  <tr
                    key={payment.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <span className="font-medium text-sm text-gray-900 dark:text-white">
                        {payment.subscriptionName}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-sm text-gray-500">
                        {formatDate(payment.paidDate)}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-sm font-semibold">
                        {formatCurrency(payment.amount, payment.currency)}
                      </span>
                    </td>
                    <td className="px-5 py-3 hidden sm:table-cell">
                      <span className="text-sm text-gray-500">
                        {payment.paymentMethod || "—"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default HistoryPage;
