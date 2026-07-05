import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { formatDate } from "@/utils/dateUtils";
import { formatCurrency } from "@/utils/currencies";
import { useSpaces } from "@/contexts/SpaceContext";
import { useCategories } from "@/contexts/CategoryContext";
import type { Transaction } from "@/models";

interface TransactionListItemProps {
  transaction: Transaction;
}

const TransactionListItem = ({ transaction }: TransactionListItemProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { getSpaceById } = useSpaces();
  const { getCategoryById } = useCategories();

  const space = getSpaceById(transaction.spaceId);
  const category = getCategoryById(transaction.categoryId);
  const isIncome = transaction.type === "Income";
  const badgeColor = category?.color || space?.color || "#6366F1";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      onClick={() => navigate(`/transactions/${transaction.id}`)}
      className="group flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors cursor-pointer"
    >
      {/* Category badge */}
      <span
        className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg text-white"
        style={{ backgroundColor: badgeColor }}
      >
        {category?.icon || space?.icon || "💼"}
      </span>

      <div className="min-w-0 flex-1">
        <p className="font-semibold text-gray-900 dark:text-white truncate">
          {category?.name || "Unknown Category"}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
          {space?.name || "Unknown Space"} ·{" "}
          {formatDate(transaction.transactionDate)}
        </p>
      </div>

      {/* Amount */}
      <div className="text-right flex-shrink-0">
        <p
          className={`figure font-semibold ${
            isIncome ? "text-success" : "text-danger"
          }`}
        >
          {isIncome ? "+" : "-"}
          {formatCurrency(transaction.amount, transaction.currency)}
        </p>
        <p className="text-xs font-medium text-gray-400 dark:text-gray-500">
          {isIncome
            ? t("finance.categories.income", "Income")
            : t("finance.categories.expense", "Expense")}
        </p>
      </div>
    </motion.div>
  );
};

export default TransactionListItem;
