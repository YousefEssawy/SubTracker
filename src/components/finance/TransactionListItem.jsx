import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { formatDate } from "@/utils/dateUtils";
import { formatCurrency } from "@/utils/currencies";
import { useSpaces } from "@/contexts/SpaceContext";
import { useCategories } from "@/contexts/CategoryContext";

const TransactionListItem = ({ transaction }) => {
  const navigate = useNavigate();
  const { getSpaceById } = useSpaces();
  const { getCategoryById } = useCategories();

  const space = getSpaceById(transaction.spaceId);
  const category = getCategoryById(transaction.categoryId);
  const isIncome = transaction.type === "Income";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      onClick={() => navigate(`/transactions/${transaction.id}`)}
      className="bg-white dark:bg-surface-dark rounded-2xl border border-gray-200 dark:border-gray-800 p-4 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-4 shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-pointer"
    >
      <div className="flex items-center gap-4 w-full sm:w-auto flex-1 min-w-0">
        {/* Space icon */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
          style={
            space
              ? {
                  backgroundColor: space.color + "22",
                  border: `1.5px solid ${space.color}`,
                }
              : { backgroundColor: "#6366F122", border: "1.5px solid #6366F1" }
          }
        >
          {space?.icon || "💼"}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {category?.name || "Unknown Category"}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-gray-400 truncate">
              {space?.name || "Unknown Space"}
            </span>
            <span className="text-gray-300 dark:text-gray-600">·</span>
            <span className="text-xs text-gray-400">
              {formatDate(transaction.transactionDate)}
            </span>
          </div>
        </div>
      </div>

      {/* Amount + type badge */}
      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto sm:text-right mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-0 border-gray-100 dark:border-gray-800 flex-shrink-0">
        <p
          className={`text-sm font-semibold ${
            isIncome
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-red-500 dark:text-red-400"
          }`}
        >
          {isIncome ? "+" : "-"}
          {formatCurrency(transaction.amount, transaction.currency)}
        </p>
        <span
          className={`inline-block mt-0.5 text-xs px-2 py-0.5 rounded-full font-medium ${
            isIncome
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          }`}
        >
          {transaction.type}
        </span>
      </div>
    </motion.div>
  );
};

export default TransactionListItem;
