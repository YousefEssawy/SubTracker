import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineXMark } from "react-icons/hi2";
import {
  SPACE_COLORS,
  SPACE_ICONS,
  DEFAULT_SPACE_COLOR,
  DEFAULT_SPACE_ICON,
} from "@/utils/spaceDefaults";
import type { Space, SpaceInput } from "@/models";

interface SpaceFormProps {
  space?: Space | null;
  onSubmit: (data: SpaceInput) => Promise<void>;
  onClose: () => void;
  loading?: boolean;
}

const SpaceForm = ({
  space = null,
  onSubmit,
  onClose,
  loading = false,
}: SpaceFormProps) => {
  const isEditing = Boolean(space);
  const [name, setName] = useState(space?.name || "");
  const [color, setColor] = useState(space?.color || DEFAULT_SPACE_COLOR);
  const [icon, setIcon] = useState(space?.icon || DEFAULT_SPACE_ICON);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Space name is required.");
      return;
    }
    if (name.trim().length > 50) {
      setError("Name cannot exceed 50 characters.");
      return;
    }
    setError("");
    await onSubmit({ name: name.trim(), color, icon });
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
          className="bg-white dark:bg-surface-dark rounded-2xl shadow-2xl w-full max-w-md p-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {isEditing ? "Edit Space" : "Create Space"}
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
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Personal, Freelance, Household"
                maxLength={50}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              />
              {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
              <p className="mt-1 text-xs text-gray-400">{name.length}/50</p>
            </div>

            {/* Icon picker */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Icon
              </label>
              <div className="grid grid-cols-10 gap-1.5">
                {SPACE_ICONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setIcon(emoji)}
                    className={`text-xl p-1.5 rounded-lg transition-all ${
                      icon === emoji
                        ? "bg-primary/20 ring-2 ring-primary"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Color picker */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Color
              </label>
              <div className="grid grid-cols-6 gap-2">
                {SPACE_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    style={{ backgroundColor: c }}
                    className={`h-8 w-full rounded-lg transition-all ${
                      color === c
                        ? "ring-2 ring-offset-2 ring-gray-400 scale-110"
                        : "hover:scale-105"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{
                  backgroundColor: color + "33",
                  borderColor: color,
                  borderWidth: 1,
                }}
              >
                {icon}
              </div>
              <span className="font-medium text-gray-800 dark:text-gray-200 text-sm truncate">
                {name || "Space Name Preview"}
              </span>
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: color }}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl btn-primary text-sm font-medium disabled:opacity-50"
              >
                {loading
                  ? "Saving…"
                  : isEditing
                    ? "Save Changes"
                    : "Create Space"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SpaceForm;
