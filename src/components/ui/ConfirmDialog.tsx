import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineExclamationTriangle } from "react-icons/hi2";
import { useTranslation } from "react-i18next";

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning";
}

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  variant = "danger", // "danger" | "warning"
}: ConfirmDialogProps) => {
  const { t } = useTranslation();
  if (!isOpen) return null;

  const resolvedTitle = title ?? t("common.confirmDialog.title", "Are you sure?");
  const resolvedMessage =
    message ?? t("common.confirmDialog.message", "This action cannot be undone.");
  const resolvedConfirmText =
    confirmText ?? t("common.confirmDialog.confirm", "Delete");
  const resolvedCancelText =
    cancelText ?? t("common.confirmDialog.cancel", "Cancel");

  const variantStyles = {
    danger: {
      icon: "bg-danger/10 text-danger",
      button: "bg-danger hover:bg-red-600 focus:ring-danger/50",
    },
    warning: {
      icon: "bg-warning/10 text-warning",
      button: "bg-warning hover:bg-amber-600 focus:ring-warning/50",
    },
  };

  const styles = variantStyles[variant] || variantStyles.danger;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="relative w-full max-w-sm glass-card p-6 shadow-2xl"
          >
            <div className="flex flex-col items-center text-center">
              {/* Icon */}
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${styles.icon}`}
              >
                <HiOutlineExclamationTriangle className="w-7 h-7" />
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {resolvedTitle}
              </h3>

              {/* Message */}
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                {resolvedMessage}
              </p>

              {/* Actions */}
              <div className="flex items-center gap-3 w-full">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 active:scale-[0.98]"
                >
                  {resolvedCancelText}
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className={`flex-1 px-4 py-2.5 rounded-xl text-white font-medium text-sm transition-all duration-200 active:scale-[0.98] focus:ring-2 ${styles.button}`}
                >
                  {resolvedConfirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDialog;
