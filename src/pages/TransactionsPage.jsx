import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { HiOutlinePlus, HiOutlineBanknotes } from "react-icons/hi2";
import { useTransactions } from "@/contexts/TransactionContext";
import TransactionListItem from "@/components/finance/TransactionListItem";
import FilterBar from "@/components/finance/FilterBar";
import Pagination from "@/components/ui/Pagination";
import BalanceCard from "@/components/finance/BalanceCard";

const EmptyNoData = ({ onAdd }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-20 text-center"
  >
    <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
      <HiOutlineBanknotes className="w-10 h-10 text-primary" />
    </div>
    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
      No transactions yet
    </h3>
    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mb-6">
      Record your first income or expense transaction to get started.
    </p>
    <button onClick={onAdd} className="btn-primary flex items-center gap-2">
      <HiOutlinePlus className="w-4 h-4" /> Add Transaction
    </button>
  </motion.div>
);

const EmptyFiltered = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex flex-col items-center justify-center py-16 text-center"
  >
    <p className="text-sm text-gray-400">
      No transactions match the current filters.
    </p>
  </motion.div>
);

const TransactionsPage = () => {
  const navigate = useNavigate();
  const { transactions, loading, filters, setFilters, balances, pagination } =
    useTransactions();
  const hasFilters = Object.keys(filters).some((k) => filters[k]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Transactions
        </h1>
        <button
          onClick={() => navigate("/transactions/add")}
          className="btn-primary flex items-center gap-2"
        >
          <HiOutlinePlus className="w-4 h-4" /> Add
        </button>
      </div>

      {/* Balance header (contextual) */}
      <BalanceCard variant="contextual" balances={balances} />

      {/* Filters */}
      <FilterBar filters={filters} setFilters={setFilters} />

      {/* Loading */}
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
          <div className="space-y-3">
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
  );
};

export default TransactionsPage;
