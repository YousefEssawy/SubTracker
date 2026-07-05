import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { HiOutlinePlus, HiOutlineBanknotes } from "react-icons/hi2";
import { useTransactions } from "@/contexts/TransactionContext";
import { useTranslation } from "react-i18next";
import TransactionListItem from "@/components/finance/TransactionListItem";
import FilterBar from "@/components/finance/FilterBar";
import Pagination from "@/components/ui/Pagination";
import BalanceCard from "@/components/finance/BalanceCard";

const EmptyNoData = ({ onAdd }: { onAdd: () => void }) => {
  const { t } = useTranslation();
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
        <HiOutlineBanknotes className="w-10 h-10 text-primary" />
      </div>
      <h3 className="font-display text-lg font-semibold tracking-tight text-gray-800 dark:text-gray-200 mb-2">
        {t("finance.transactions.noTransactions", "No transactions yet")}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mb-6">
        {t(
          "finance.transactions.noTransactionsDesc",
          "Record your first income or expense transaction to get started.",
        )}
      </p>
      <button onClick={onAdd} className="btn-primary flex items-center gap-2">
        <HiOutlinePlus className="w-4 h-4" />
        {t("finance.transactions.addTransaction", "Add Transaction")}
      </button>
    </motion.div>
  );
};

const EmptyFiltered = () => {
  const { t } = useTranslation();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <p className="text-sm text-gray-400">
        {t(
          "finance.transactions.noMatchingFilters",
          "No transactions match the current filters.",
        )}
      </p>
    </motion.div>
  );
};

const TransactionsPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { transactions, loading, filters, setFilters, balances, pagination } =
    useTransactions();
  const hasFilters = Object.values(filters).some((val) => val);

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {t("finance.transactions.title", "Transactions")}
          </h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            {t("finance.transactions.subtitle", "Track your income and expenses.")}
          </p>
        </div>
        <button
          onClick={() => navigate("/transactions/add")}
          className="btn-primary flex items-center gap-2 text-sm whitespace-nowrap self-start sm:self-auto"
        >
          <HiOutlinePlus className="w-4 h-4" />
          <span className="hidden sm:inline">
            {t("finance.transactions.addTransaction", "Add Transaction")}
          </span>
          <span className="sm:hidden">{t("finance.transactions.add", "Add")}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)] gap-4 lg:gap-6 items-start">
        <div className="space-y-4 xl:sticky xl:top-24">
          <BalanceCard variant="contextual" balances={balances} />
          <FilterBar filters={filters} setFilters={setFilters} />
        </div>

        <div className="glass-card p-2 sm:p-3 min-h-[18rem]">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : transactions.length === 0 ? (
            hasFilters ? (
              <EmptyFiltered />
            ) : (
              <EmptyNoData onAdd={() => navigate("/transactions/add")} />
            )
          ) : (
            <>
              <div className="space-y-0.5">
                <AnimatePresence mode="popLayout">
                  {transactions.map((tx) => (
                    <TransactionListItem key={tx.id} transaction={tx} />
                  ))}
                </AnimatePresence>
              </div>
              <Pagination {...pagination} />
            </>
          )}
        </div>
      </div>

      {!loading && transactions.length > 0 && (
        <div className="lg:hidden">
          <div className="h-2" />
        </div>
      )}
    </div>
  );
};

export default TransactionsPage;
