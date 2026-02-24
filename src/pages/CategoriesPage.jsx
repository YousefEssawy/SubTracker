import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlinePlus,
  HiOutlineTag,
} from "react-icons/hi2";
import toast from "react-hot-toast";
import { useCategories } from "@/contexts/CategoryContext";
import CategoryForm from "@/components/finance/CategoryForm";

// ── Type badge ─────────────────────────────────────────────────────────────────
const TypeBadge = ({ type }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
      type === "Income"
        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
    }`}
  >
    {type}
  </span>
);

// ── Confirmation dialog ────────────────────────────────────────────────────────
const ConfirmDialog = ({ name, onConfirm, onCancel, loading }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
    onClick={(e) => e.target === e.currentTarget && onCancel()}
  >
    <motion.div
      initial={{ scale: 0.92, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.92, opacity: 0 }}
      className="bg-white dark:bg-surface-dark rounded-2xl shadow-2xl p-6 max-w-sm w-full"
    >
      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
        Delete Category?
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
        Are you sure you want to delete <strong>"{name}"</strong>? This cannot
        be undone.
      </p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 text-sm font-medium rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 py-2.5 text-sm font-medium rounded-xl bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-50"
        >
          {loading ? "Deleting…" : "Delete"}
        </button>
      </div>
    </motion.div>
  </motion.div>
);

// ── Category row ───────────────────────────────────────────────────────────────
const CategoryRow = ({ category, onEdit, onDelete }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.95 }}
    transition={{ type: "spring", stiffness: 300, damping: 28 }}
    className="bg-white dark:bg-surface-dark rounded-2xl border border-gray-200 dark:border-gray-800 px-5 py-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow"
  >
    <div className="flex-1 min-w-0">
      <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
        {category.name}
      </p>
    </div>
    <TypeBadge type={category.type} />
    <div className="flex items-center gap-1">
      <button
        onClick={() => onEdit(category)}
        className="p-2 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors"
        aria-label={`Edit ${category.name}`}
      >
        <HiOutlinePencil className="w-4 h-4" />
      </button>
      <button
        onClick={() => onDelete(category)}
        className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        aria-label={`Delete ${category.name}`}
      >
        <HiOutlineTrash className="w-4 h-4" />
      </button>
    </div>
  </motion.div>
);

// ── Empty state ────────────────────────────────────────────────────────────────
const EmptyState = ({ onAdd }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-24 text-center"
  >
    <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
      <HiOutlineTag className="w-10 h-10 text-primary" />
    </div>
    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
      No categories yet
    </h3>
    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mb-6">
      Create Income and Expense categories to classify your transactions.
    </p>
    <button onClick={onAdd} className="btn-primary flex items-center gap-2">
      <HiOutlinePlus className="w-4 h-4" /> Create your first category
    </button>
  </motion.div>
);

// ── Page ───────────────────────────────────────────────────────────────────────
const CategoriesPage = () => {
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
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [filterType, setFilterType] = useState("All");
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleAdd = () => {
    setEditingCategory(null);
    setShowForm(true);
  };
  const handleEdit = (cat) => {
    setEditingCategory(cat);
    setShowForm(true);
  };
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCategory(null);
  };

  const handleSubmit = async (data) => {
    setFormLoading(true);
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, { name: data.name });
        toast.success("Category updated!");
      } else {
        await addCategory(data);
        toast.success("Category created!");
      }
      handleCloseForm();
    } catch (err) {
      toast.error(err.message || "Failed to save category.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCategory) return;
    setDeleteLoading(true);
    try {
      await deleteCategory(deletingCategory.id);
      toast.success(`"${deletingCategory.name}" deleted.`);
      setDeletingCategory(null);
    } catch (err) {
      toast.error(err.message || "Failed to delete category.");
      setDeletingCategory(null);
    } finally {
      setDeleteLoading(false);
    }
  };

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
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Categories
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {incomeCategories.length} income · {expenseCategories.length}{" "}
            expense
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="btn-primary flex items-center gap-2"
        >
          <HiOutlinePlus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {/* Type filter tabs */}
      {categories.length > 0 && (
        <div className="flex gap-2 mb-5">
          {["All", "Income", "Expense"].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filterType === t
                  ? t === "Income"
                    ? "bg-emerald-500 text-white"
                    : t === "Expense"
                      ? "bg-red-500 text-white"
                      : "bg-primary text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {/* List */}
      {categories.length === 0 ? (
        <EmptyState onAdd={handleAdd} />
      ) : displayedCategories.length === 0 ? (
        <p className="text-center text-sm text-gray-400 py-16">
          No {filterType.toLowerCase()} categories yet.
        </p>
      ) : (
        <div className="space-y-3">
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
            category={editingCategory}
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
