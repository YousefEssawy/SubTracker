import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineXMark } from "react-icons/hi2";
import { useTranslation } from "react-i18next";
import type { Category, CategoryInput } from "@/models";

interface CategoryFormProps {
  category?: Category | null;
  onSubmit: (data: CategoryInput) => Promise<void>;
  onClose: () => void;
  loading?: boolean;
}

const CategoryForm = ({
  category = null,
  onSubmit,
  onClose,
  loading = false,
}: CategoryFormProps) => {
  const { t } = useTranslation();
  const isEditing = Boolean(category);
  const [name, setName] = useState(category?.name || "");
  const [type, setType] = useState<"Income" | "Expense">(
    category?.type || "Income",
  );
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(
        t("finance.categories.nameRequired", "Category name is required."),
      );
      return;
    }
    if (name.trim().length > 50) {
      setError(
        t("finance.categories.nameTooLong", "Name cannot exceed 50 characters."),
      );
      return;
    }
    setError("");
    await onSubmit({
      name: name.trim(),
      type,
      icon: category?.icon || "🏷️",
      color: category?.color || "#3b82f6",
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
        onClick={(e: React.MouseEvent<HTMLDivElement>) =>
          e.target === e.currentTarget && onClose()
        }
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
          className="bg-white dark:bg-surface-dark rounded-2xl border border-gray-200 dark:border-gray-800 w-full max-w-sm p-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-lg font-semibold tracking-tight text-gray-900 dark:text-gray-100">
              {isEditing
                ? t("finance.categories.editCategory", "Edit Category")
                : t("finance.categories.createCategory", "Create Category")}
            </h2>
            <button
              onClick={onClose}
              type="button"
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <HiOutlineXMark className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Type toggle — only on create */}
            {!isEditing && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("finance.categories.type", "Type")}
                </label>
                <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                  {(["Income", "Expense"] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setType(opt)}
                      className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                        type === opt
                          ? opt === "Income"
                            ? "bg-success text-white"
                            : "bg-danger text-white"
                          : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                    >
                      {opt === "Income"
                        ? t("finance.categories.income", "Income")
                        : t("finance.categories.expense", "Expense")}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Show type as read-only badge on edit */}
            {isEditing && category && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("finance.categories.type", "Type")}
                </label>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    category.type === "Income"
                      ? "bg-success/10 text-success"
                      : "bg-danger/10 text-danger"
                  }`}
                >
                  {category.type === "Income"
                    ? t("finance.categories.income", "Income")
                    : t("finance.categories.expense", "Expense")}
                </span>
                <p className="mt-1 text-xs text-gray-400">
                  {t(
                    "finance.categories.typeLocked",
                    "Category type cannot be changed after creation.",
                  )}
                </p>
              </div>
            )}

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {t("finance.categories.name", "Name")}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={
                  type === "Income"
                    ? t(
                        "finance.categories.namePlaceholderIncome",
                        "e.g. Salary, Freelance",
                      )
                    : t(
                        "finance.categories.namePlaceholderExpense",
                        "e.g. Rent, Groceries",
                      )
                }
                maxLength={50}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              />
              {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
              <p className="mt-1 text-xs text-gray-400">{name.length}/50</p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                {t("finance.categories.cancel", "Cancel")}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl btn-primary text-sm font-medium disabled:opacity-50"
              >
                {loading
                  ? t("finance.categories.saving", "Saving…")
                  : isEditing
                    ? t("finance.categories.saveChanges", "Save Changes")
                    : t("finance.categories.createCategory", "Create Category")}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CategoryForm;
