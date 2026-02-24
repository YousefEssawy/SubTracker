import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlinePlus,
  HiOutlineArrowPath,
  HiOutlineTrash,
  HiOutlinePause,
  HiOutlinePlay,
} from "react-icons/hi2";
import toast from "react-hot-toast";
import { useRecurrences } from "@/contexts/RecurrenceContext";
import { useSpaces } from "@/contexts/SpaceContext";
import { useCategories } from "@/contexts/CategoryContext";
import { formatDate } from "@/utils/dateUtils";
import { formatCurrency } from "@/utils/currencies";
import RecurrenceForm from "@/components/finance/RecurrenceForm";

const patternLabel = (pattern, interval) => {
  const prefix = interval > 1 ? `Every ${interval} ` : "Every ";
  const unit = {
    Weekly: interval > 1 ? "weeks" : "week",
    Monthly: interval > 1 ? "months" : "month",
    Yearly: interval > 1 ? "years" : "year",
    Custom: interval > 1 ? "days" : "day",
  };
  return prefix + (unit[pattern] || "month");
};

const RecurrenceCard = ({
  recurrence,
  space,
  category,
  onPause,
  onReactivate,
  onDelete,
}) => {
  const isIncome = recurrence.type === "Income";
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white dark:bg-surface-dark rounded-2xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {space && (
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
              style={{ backgroundColor: space.color + "20" }}
            >
              {space.icon}
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isIncome ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400" : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"}`}
              >
                {recurrence.type}
              </span>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${recurrence.isActive ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"}`}
              >
                {recurrence.isActive ? "Active" : "Paused"}
              </span>
            </div>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
              {category?.name || "—"}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {patternLabel(recurrence.pattern, recurrence.interval)}
            </p>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p
            className={`text-sm font-bold ${isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}
          >
            {formatCurrency(recurrence.amount, recurrence.currency)}
          </p>
          {recurrence.nextExecutionDate && (
            <p className="text-xs text-gray-400 mt-0.5">
              Next: {formatDate(recurrence.nextExecutionDate)}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
        {recurrence.isActive ? (
          <button
            onClick={onPause}
            className="flex items-center gap-1.5 text-xs text-yellow-600 hover:text-yellow-700 transition-colors"
          >
            <HiOutlinePause className="w-3.5 h-3.5" /> Pause
          </button>
        ) : (
          <button
            onClick={onReactivate}
            className="flex items-center gap-1.5 text-xs text-green-600 hover:text-green-700 transition-colors"
          >
            <HiOutlinePlay className="w-3.5 h-3.5" /> Reactivate
          </button>
        )}
        <button
          onClick={onDelete}
          className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 transition-colors ml-auto"
        >
          <HiOutlineTrash className="w-3.5 h-3.5" /> Delete
        </button>
      </div>
    </motion.div>
  );
};

const RecurrencesPage = () => {
  const {
    activeRecurrences,
    pausedRecurrences,
    loading,
    pauseRecurrence,
    reactivateRecurrence,
    deleteRecurrence,
  } = useRecurrences();
  const { getSpaceById } = useSpaces();
  const { getCategoryById } = useCategories();
  const [showForm, setShowForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const handlePause = async (id) => {
    try {
      await pauseRecurrence(id);
      toast.success("Recurrence paused.");
    } catch {
      toast.error("Failed to pause.");
    }
  };

  const handleReactivate = async (rec) => {
    try {
      await reactivateRecurrence(rec.id, rec.pattern, rec.interval);
      toast.success("Recurrence reactivated!");
    } catch {
      toast.error("Failed to reactivate.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteRecurrence(id);
      toast.success("Recurrence deleted. Existing transactions preserved.");
      setConfirmDelete(null);
    } catch {
      toast.error("Failed to delete.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const isEmpty =
    activeRecurrences.length === 0 && pausedRecurrences.length === 0;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Recurrences
        </h1>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <HiOutlinePlus className="w-4 h-4" /> Add
        </button>
      </div>

      {isEmpty ? (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
            <HiOutlineArrowPath className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
            No recurrences yet
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mb-6">
            Set up recurring transactions to automate your income and expense
            tracking.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center gap-2"
          >
            <HiOutlinePlus className="w-4 h-4" /> Create Recurrence
          </button>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {/* Active */}
          {activeRecurrences.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                Active ({activeRecurrences.length})
              </h2>
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {activeRecurrences.map((rec) => (
                    <RecurrenceCard
                      key={rec.id}
                      recurrence={rec}
                      space={getSpaceById(rec.spaceId)}
                      category={getCategoryById(rec.categoryId)}
                      onPause={() => handlePause(rec.id)}
                      onReactivate={() => handleReactivate(rec)}
                      onDelete={() => setConfirmDelete(rec.id)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Paused */}
          {pausedRecurrences.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                Paused ({pausedRecurrences.length})
              </h2>
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {pausedRecurrences.map((rec) => (
                    <RecurrenceCard
                      key={rec.id}
                      recurrence={rec}
                      space={getSpaceById(rec.spaceId)}
                      category={getCategoryById(rec.categoryId)}
                      onPause={() => handlePause(rec.id)}
                      onReactivate={() => handleReactivate(rec)}
                      onDelete={() => setConfirmDelete(rec.id)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Confirmation dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Delete Recurrence?
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
              Existing generated transactions will be preserved.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="flex-1 py-2 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showForm && <RecurrenceForm onClose={() => setShowForm(false)} />}
    </div>
  );
};

export default RecurrencesPage;
