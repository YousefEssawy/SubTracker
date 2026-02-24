import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { HiOutlineArrowLeft, HiOutlinePencil } from "react-icons/hi2";
import { useAuth } from "@/contexts/AuthContext";
import { getTransaction } from "@/services/transactionService";
import { useSpaces } from "@/contexts/SpaceContext";
import { useCategories } from "@/contexts/CategoryContext";
import { formatDate } from "@/utils/dateUtils";

const TransactionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getSpaceById } = useSpaces();
  const { getCategoryById } = useCategories();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !user) return;
    getTransaction(user.uid, id)
      .then((tx) => {
        setTransaction(tx);
      })
      .catch(() => navigate("/transactions"))
      .finally(() => setLoading(false));
  }, [id, user, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!transaction) return null;

  const space = getSpaceById(transaction.spaceId);
  const category = getCategoryById(transaction.categoryId);
  const isIncome = transaction.type === "Income";
  const amountStr = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(transaction.amount);

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate("/transactions")}
          className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-primary transition-colors"
        >
          <HiOutlineArrowLeft className="w-4 h-4" /> Back
        </button>
        <button
          onClick={() => navigate(`/transactions/${id}/edit`)}
          className="flex items-center gap-2 text-sm font-medium text-primary hover:opacity-80 transition-opacity"
        >
          <HiOutlinePencil className="w-4 h-4" /> Edit
        </button>
      </div>

      <div className="bg-white dark:bg-surface-dark rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm space-y-5">
        {/* Amount hero */}
        <div className="text-center pb-5 border-b border-gray-100 dark:border-gray-800">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            {transaction.type}
          </p>
          <p
            className={`text-4xl font-bold ${isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}
          >
            {isIncome ? "+" : "-"}
            {amountStr}
          </p>
          <p className="text-base text-gray-500 dark:text-gray-400 mt-1">
            {transaction.currency}
          </p>
          {transaction.recurrenceId && (
            <span className="mt-2 inline-block px-2.5 py-0.5 rounded-full text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium">
              Auto-generated
            </span>
          )}
        </div>

        {/* Details */}
        <div className="space-y-3">
          {[
            { label: "Date", value: formatDate(transaction.transactionDate) },
            {
              label: "Space",
              value: space ? `${space.icon} ${space.name}` : "—",
            },
            { label: "Category", value: category?.name || "—" },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="flex justify-between items-center text-sm"
            >
              <span className="text-gray-400">{label}</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">
                {value}
              </span>
            </div>
          ))}
        </div>

        {/* Tags */}
        {transaction.tags?.length > 0 && (
          <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
            <p className="text-xs text-gray-400 mb-2">Tags</p>
            <div className="flex flex-wrap gap-2">
              {transaction.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-0.5 rounded-full text-xs bg-primary/10 text-primary font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {transaction.notes && (
          <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
            <p className="text-xs text-gray-400 mb-1">Notes</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {transaction.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionDetailPage;
