import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlinePlus,
  HiOutlineTag,
} from "react-icons/hi2";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useCategories } from "@/contexts/CategoryContext";
import CategoryForm from "@/components/finance/CategoryForm";
import { getErrorMessage } from "@/utils/errors";
import type { Category, CategoryInput } from "@/models";

// ── Type badge ─────────────────────────────────────────────────────────────────
const TypeBadge = ({ type }: { type: "Income" | "Expense" }) => {
  const { t } = useTranslation();
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        type === "Income"
          ? "bg-success/10 text-success"
          : "bg-danger/10 text-danger"
      }`}
    >
      {type === "Income"
        ? t("finance.categories.income", "Income")
        : t("finance.categories.expense", "Expense")}
    </span>
  );
};

// ── Confirmation dialog ────────────────────────────────────────────────────────
interface ConfirmDialogProps {
  name: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}

const ConfirmDialog = ({
  name,
  onConfirm,
  onCancel,
  loading,
}: ConfirmDialogProps) => {
  const { t } = useTranslation();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={(e: React.MouseEvent<HTMLDivElement>) =>
        e.target === e.currentTarget && onCancel()
      }
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        className="bg-white dark:bg-surface-dark rounded-2xl border border-gray-200 dark:border-gray-800 p-6 max-w-sm w-full"
      >
        <h3 className="font-display text-base font-semibold tracking-tight text-gray-900 dark:text-gray-100 mb-2">
          {t("finance.categories.deleteTitle", "Delete Category?")}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
          {t(
            "finance.categories.deleteMessage",
            'Are you sure you want to delete "{{name}}"? This cannot be undone.',
            { name },
          )}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 text-sm font-medium rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            {t("finance.categories.cancel", "Cancel")}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 text-sm font-medium rounded-xl bg-danger hover:brightness-95 text-white transition-all disabled:opacity-50"
          >
            {loading
              ? t("finance.categories.deleting", "Deleting…")
              : t("finance.categories.delete", "Delete")}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ── Category row ───────────────────────────────────────────────────────────────
interface CategoryRowProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

const CategoryRow = ({ category, onEdit, onDelete }: CategoryRowProps) => {
  const { t } = useTranslation();
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      className="group flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
    >
      <span
        className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-base text-white"
        style={{ backgroundColor: category.color }}
      >
        {category.icon || category.name.charAt(0).toUpperCase()}
      </span>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 dark:text-white truncate">
          {category.name}
        </p>
      </div>
      <TypeBadge type={category.type} />
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(category)}
          className="p-2 rounded-lg text-gray-500 hover:text-primary hover:bg-primary/10 transition-colors"
          aria-label={t("finance.categories.editCategory", "Edit Category")}
        >
          <HiOutlinePencil className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(category)}
          className="p-2 rounded-lg text-gray-500 hover:text-danger hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          aria-label={t("finance.categories.deleteTitle", "Delete Category")}
        >
          <HiOutlineTrash className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

// ── Empty state ────────────────────────────────────────────────────────────────
const EmptyState = ({ onAdd }: { onAdd: () => void }) => {
  const { t } = useTranslation();
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
        <HiOutlineTag className="w-10 h-10 text-primary" />
      </div>
      <h3 className="font-display text-lg font-semibold tracking-tight text-gray-800 dark:text-gray-200 mb-2">
        {t("finance.categories.noCategories", "No categories yet")}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mb-6">
        {t(
          "finance.categories.noCategoriesDesc",
          "Create Income and Expense categories to classify your transactions.",
        )}
      </p>
      <button onClick={onAdd} className="btn-primary flex items-center gap-2">
        <HiOutlinePlus className="w-4 h-4" />
        {t("finance.categories.createFirst", "Create your first category")}
      </button>
    </motion.div>
  );
};

// ── Page ───────────────────────────────────────────────────────────────────────
const CategoriesPage = () => {
  const { t } = useTranslation();
  const {
    categories,
    loading,
    incomeCategories,
    expenseCategories,
    addCategory,
    updateCategory,
    deleteCategory,
  } = useCategories();
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(
    null,
  );
  const [filterType, setFilterType] = useState<"All" | "Income" | "Expense">(
    "All",
  );
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleAdd = () => {
    setEditingCategory(null);
    setShowForm(true);
  };
  const handleEdit = (cat: Category) => {
    setEditingCategory(cat);
    setShowForm(true);
  };
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCategory(null);
  };

  const handleSubmit = async (data: CategoryInput) => {
    setFormLoading(true);
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, { name: data.name });
        toast.success(
          t("finance.categories.editCategory", "Category updated!"),
        );
      } else {
        await addCategory(data);
        toast.success(t("finance.categories.addCategory", "Category created!"));
      }
      handleCloseForm();
    } catch (err) {
      toast.error(
        getErrorMessage(err) ||
          t("finance.categories.deleteBlocked", "Failed to save category."),
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCategory) return;
    setDeleteLoading(true);
    try {
      await deleteCategory(deletingCategory.id);
      toast.success(
        `"${deletingCategory.name}" ${t("finance.categories.delete", "deleted")}.`,
      );
      setDeletingCategory(null);
    } catch (err) {
      toast.error(
        getErrorMessage(err) ||
          t("finance.categories.deleteBlocked", "Failed to delete category."),
      );
      setDeletingCategory(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  const tabs: { key: "All" | "Income" | "Expense"; label: string }[] = [
    { key: "All", label: t("finance.categories.all", "All") },
    { key: "Income", label: t("finance.categories.income", "Income") },
    { key: "Expense", label: t("finance.categories.expense", "Expense") },
  ];

  const displayedCategories =
    filterType === "Income"
      ? incomeCategories
      : filterType === "Expense"
        ? expenseCategories
        : categories;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pb-20 lg:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">
            {t("finance.categories.title", "Categories")}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {incomeCategories.length} {t("finance.categories.income", "income")}{" "}
            · {expenseCategories.length}{" "}
            {t("finance.categories.expense", "expense")}
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="btn-primary flex items-center gap-2"
        >
          <HiOutlinePlus className="w-4 h-4" />
          {t("finance.categories.addCategory", "Add Category")}
        </button>
      </div>

      {/* Type filter tabs */}
      {categories.length > 0 && (
        <div className="flex gap-2 mb-5">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilterType(key)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filterType === key
                  ? "bg-primary text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* List */}
      {categories.length === 0 ? (
        <EmptyState onAdd={handleAdd} />
      ) : displayedCategories.length === 0 ? (
        <p className="text-center text-sm text-gray-400 py-16">
          {t(
            "finance.categories.noCategoryTypeYet",
            "No {{type}} categories yet.",
            {
              type: filterType.toLowerCase(),
            },
          )}
        </p>
      ) : (
        <div className="glass-card p-2 sm:p-3 space-y-1">
          <AnimatePresence mode="popLayout">
            {displayedCategories.map((cat) => (
              <CategoryRow
                key={cat.id}
                category={cat}
                onEdit={handleEdit}
                onDelete={setDeletingCategory}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* CategoryForm Modal */}
      <AnimatePresence>
        {showForm && (
          <CategoryForm
            category={editingCategory || undefined}
            onSubmit={handleSubmit}
            onClose={handleCloseForm}
            loading={formLoading}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deletingCategory && (
          <ConfirmDialog
            name={deletingCategory.name}
            onConfirm={handleDeleteConfirm}
            onCancel={() => setDeletingCategory(null)}
            loading={deleteLoading}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CategoriesPage;
