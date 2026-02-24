import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlinePlus,
  HiOutlineRectangleGroup,
} from "react-icons/hi2";
import toast from "react-hot-toast";
import { useSpaces } from "@/contexts/SpaceContext";
import SpaceForm from "@/components/finance/SpaceForm";

// ── Confirmation dialog ────────────────────────────────────────────────────────
const ConfirmDialog = ({ spaceName, onConfirm, onCancel, loading }) => (
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
        Delete Space?
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
        Are you sure you want to delete <strong>"{spaceName}"</strong>? This
        cannot be undone.
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

// ── Space card ─────────────────────────────────────────────────────────────────
const SpaceCard = ({ space, onEdit, onDelete }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.95 }}
    transition={{ type: "spring", stiffness: 300, damping: 28 }}
    className="bg-white dark:bg-surface-dark rounded-2xl border border-gray-200 dark:border-gray-800 p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow"
  >
    {/* Icon */}
    <div
      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
      style={{
        backgroundColor: space.color + "22",
        border: `1.5px solid ${space.color}`,
      }}
    >
      {space.icon}
    </div>

    {/* Name + color dot */}
    <div className="flex-1 min-w-0">
      <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
        {space.name}
      </p>
      <div className="flex items-center gap-1.5 mt-0.5">
        <div
          className="w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: space.color }}
        />
        <span className="text-xs text-gray-400">{space.color}</span>
      </div>
    </div>

    {/* Actions */}
    <div className="flex items-center gap-1">
      <button
        onClick={() => onEdit(space)}
        className="p-2 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors"
        aria-label={`Edit ${space.name}`}
      >
        <HiOutlinePencil className="w-4 h-4" />
      </button>
      <button
        onClick={() => onDelete(space)}
        className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        aria-label={`Delete ${space.name}`}
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
      <HiOutlineRectangleGroup className="w-10 h-10 text-primary" />
    </div>
    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
      No spaces yet
    </h3>
    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mb-6">
      Spaces help you organise your finances by context — work, home, travel,
      and more.
    </p>
    <button onClick={onAdd} className="btn-primary flex items-center gap-2">
      <HiOutlinePlus className="w-4 h-4" />
      Create your first space
    </button>
  </motion.div>
);

// ── Page ───────────────────────────────────────────────────────────────────────
const SpacesPage = () => {
  const { spaces, loading, addSpace, updateSpace, deleteSpace } = useSpaces();
  const [showForm, setShowForm] = useState(false);
  const [editingSpace, setEditingSpace] = useState(null);
  const [deletingSpace, setDeletingSpace] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleAdd = () => {
    setEditingSpace(null);
    setShowForm(true);
  };
  const handleEdit = (space) => {
    setEditingSpace(space);
    setShowForm(true);
  };
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingSpace(null);
  };

  const handleSubmit = async (data) => {
    setFormLoading(true);
    try {
      if (editingSpace) {
        await updateSpace(editingSpace.id, data);
        toast.success("Space updated!");
      } else {
        await addSpace(data);
        toast.success("Space created!");
      }
      handleCloseForm();
    } catch (err) {
      toast.error(err.message || "Failed to save space.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingSpace) return;
    setDeleteLoading(true);
    try {
      await deleteSpace(deletingSpace.id);
      toast.success(`"${deletingSpace.name}" deleted.`);
      setDeletingSpace(null);
    } catch (err) {
      toast.error(err.message || "Failed to delete space.");
      setDeletingSpace(null);
    } finally {
      setDeleteLoading(false);
    }
  };

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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Spaces
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {spaces.length} {spaces.length === 1 ? "space" : "spaces"}
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="btn-primary flex items-center gap-2"
        >
          <HiOutlinePlus className="w-4 h-4" />
          Add Space
        </button>
      </div>

      {/* List */}
      {spaces.length === 0 ? (
        <EmptyState onAdd={handleAdd} />
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {spaces.map((space) => (
              <SpaceCard
                key={space.id}
                space={space}
                onEdit={handleEdit}
                onDelete={setDeletingSpace}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* SpaceForm Modal */}
      <AnimatePresence>
        {showForm && (
          <SpaceForm
            space={editingSpace}
            onSubmit={handleSubmit}
            onClose={handleCloseForm}
            loading={formLoading}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deletingSpace && (
          <ConfirmDialog
            spaceName={deletingSpace.name}
            onConfirm={handleDeleteConfirm}
            onCancel={() => setDeletingSpace(null)}
            loading={deleteLoading}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default SpacesPage;
