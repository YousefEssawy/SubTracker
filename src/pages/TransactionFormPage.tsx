import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { HiOutlineArrowLeft } from "react-icons/hi2";
import toast from "react-hot-toast";
import { useTransactions } from "@/contexts/TransactionContext";
import { useSpaces } from "@/contexts/SpaceContext";
import { useCategories } from "@/contexts/CategoryContext";
import { getTransaction } from "@/services/transactionService";
import { uploadAttachment } from "@/services/storageService";
import { useAuth } from "@/contexts/AuthContext";
import { getErrorMessage } from "@/utils/errors";
import { CURRENCIES } from "@/utils/currencies";
import { toDateInputValue } from "@/utils/dateUtils";
import TagInput from "@/components/finance/TagInput";
import FileUpload from "@/components/finance/FileUpload";
import { useTranslation } from "react-i18next";
import type { AttachmentMeta, TransactionInput, CurrencyCode } from "@/models";

interface ValidationErrors {
  spaceId?: string;
  categoryId?: string;
  amount?: string;
  transactionDate?: string;
  currency?: string;
}

const TransactionFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  const { addTransaction, updateTransaction } = useTransactions();
  const { spaces } = useSpaces();
  const { incomeCategories, expenseCategories } = useCategories();
  const { t } = useTranslation();

  const isEditMode = Boolean(id) && location.pathname.includes("/edit");

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditMode);
  const [errors, setErrors] = useState<ValidationErrors>({});

  // Core fields
  const [type, setType] = useState<"Income" | "Expense">("Expense");
  const [spaceId, setSpaceId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("EGP");
  const [transactionDate, setTransactionDate] = useState(
    toDateInputValue(new Date()),
  );

  // Enrichment fields
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [existingAttachmentMeta, setExistingAttachmentMeta] =
    useState<AttachmentMeta | null>(null);
  const [_existingAttachmentUrl, setExistingAttachmentUrl] = useState<
    string | null
  >(null);

  const availableCategories =
    type === "Income" ? incomeCategories : expenseCategories;

  // Load existing transaction on edit
  useEffect(() => {
    if (!isEditMode || !id || !user) return;
    setFetchLoading(true);
    getTransaction(user.uid, id)
      .then((tx) => {
        if (!tx) {
          navigate("/transactions");
          return;
        }
        setType(tx.type);
        setSpaceId(tx.spaceId);
        setCategoryId(tx.categoryId);
        setAmount(String(tx.amount));
        setCurrency(tx.currency);
        setTransactionDate(tx.transactionDate);
        setNotes(tx.notes || "");
        setTags(tx.tags || []);
        if (tx.attachmentUrl) {
          setExistingAttachmentUrl(tx.attachmentUrl);
          setExistingAttachmentMeta(tx.attachmentMeta || null);
        }
      })
      .catch(() => {
        toast.error(
          t("finance.transactions.loadError", "Failed to load transaction."),
        );
        navigate("/transactions");
      })
      .finally(() => setFetchLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEditMode, user]);

  const handleTypeChange = (newType: "Income" | "Expense") => {
    setType(newType);
    setCategoryId("");
  };

  const validate = (): ValidationErrors => {
    const e: ValidationErrors = {};
    if (!spaceId) e.spaceId = "Space is required.";
    if (!categoryId) e.categoryId = "Category is required.";
    const num = parseFloat(amount);
    if (!amount || isNaN(num) || num <= 0)
      e.amount = "Amount must be greater than 0.";
    else if (num > 999_999_999.99)
      e.amount = "Amount cannot exceed 999,999,999.99.";
    if (!transactionDate) e.transactionDate = "Date is required.";
    if (!currency) e.currency = "Currency is required.";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const data: TransactionInput = {
        type,
        spaceId,
        categoryId,
        amount: parseFloat(amount),
        currency: currency as CurrencyCode,
        transactionDate,
        notes: notes.trim() || null,
        tags,
        attachmentUrl: _existingAttachmentUrl,
        attachmentMeta: existingAttachmentMeta,
        recurrenceId: null,
      };

      let txId: string | undefined = id;

      if (isEditMode && txId) {
        // Handle attachment on edit
        if (attachmentFile) {
          const { url, meta } = await uploadAttachment(
            user.uid,
            txId,
            attachmentFile,
          );
          data.attachmentUrl = url;
          data.attachmentMeta = meta;
        }
        await updateTransaction(txId, data);
        toast.success(
          t("finance.transactions.updated", "Transaction updated!"),
        );
      } else {
        // Create first, then upload if file selected
        const result = await addTransaction(data);
        txId = result?.id;
        if (attachmentFile && txId) {
          try {
            const { url, meta } = await uploadAttachment(
              user.uid,
              txId,
              attachmentFile,
            );
            await updateTransaction(txId, {
              attachmentUrl: url,
              attachmentMeta: meta,
            });
          } catch {
            toast.error(
              t(
                "finance.transactions.attachmentError",
                "Transaction saved but attachment upload failed. You can attach it later.",
              ),
            );
          }
        }
        toast.success(t("finance.transactions.added", "Transaction added!"));
      }
      navigate("/transactions");
    } catch (err) {
      toast.error(
        getErrorMessage(err) ||
          t("finance.transactions.saveError", "Failed to save transaction."),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAttachment = () => {
    setAttachmentFile(null);
    setExistingAttachmentMeta(null);
    setExistingAttachmentUrl(null);
  };

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-2">
      {/* Back */}
      <button
        onClick={() => navigate("/transactions")}
        className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-primary transition-colors mb-6"
      >
        <HiOutlineArrowLeft className="w-4 h-4 rtl:-scale-x-100" />
        {t("finance.transactions.backToList", "Back to Transactions")}
      </button>

      <h1 className="page-title mb-7">
        {isEditMode
          ? t("finance.transactions.editTransaction", "Edit Transaction")
          : type === "Income"
            ? t("finance.transactions.addIncome", "Add Income")
            : t("finance.transactions.addExpense", "Add Expense")}
      </h1>

      <form onSubmit={handleSubmit} className="glass-card rounded-3xl p-5 sm:p-7 space-y-5">
        {/* Type toggle */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t("finance.transactions.type", "Type")}
          </label>
          <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
            {(["Income", "Expense"] as const).map((txType) => (
              <button
                key={txType}
                type="button"
                onClick={() => handleTypeChange(txType)}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                  type === txType
                    ? txType === "Income"
                      ? "bg-emerald-500 text-white"
                      : "bg-red-500 text-white"
                    : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                }`}
              >
                {txType === "Income"
                  ? t("finance.categories.income", "Income")
                  : t("finance.categories.expense", "Expense")}
              </button>
            ))}
          </div>
        </div>

        {/* Space */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {t("finance.transactions.space", "Space")}
          </label>
          <select
            value={spaceId}
            onChange={(e) => setSpaceId(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
          >
            <option value="">
              {t("finance.transactions.selectSpace", "Select a space…")}
            </option>
            {spaces.map((s) => (
              <option key={s.id} value={s.id}>
                {s.icon} {s.name}
              </option>
            ))}
          </select>
          {errors.spaceId && (
            <p className="mt-1 text-xs text-red-500">{errors.spaceId}</p>
          )}
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {t("finance.transactions.category", "Category")}
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
          >
            <option value="">
              {t("finance.transactions.selectCategory", "Select a category…")}
            </option>
            {availableCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p className="mt-1 text-xs text-red-500">{errors.categoryId}</p>
          )}
          {availableCategories.length === 0 && (
            <p className="mt-1 text-xs text-amber-500">
              {t(
                "finance.transactions.noCategoryYet",
                "No {{type}} categories yet. Create one in Categories first.",
                { type: type.toLowerCase() },
              )}
            </p>
          )}
        </div>

        {/* Amount + Currency */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              {t("finance.transactions.amount", "Amount")}
            </label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
            />
            {errors.amount && (
              <p className="mt-1 text-xs text-red-500">{errors.amount}</p>
            )}
          </div>
          <div className="w-full sm:w-28">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              {t("finance.transactions.currency", "Currency")}
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {t("finance.transactions.date", "Date")}
          </label>
          <input
            type="date"
            value={transactionDate}
            onChange={(e) => setTransactionDate(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
          />
          {errors.transactionDate && (
            <p className="mt-1 text-xs text-red-500">
              {errors.transactionDate}
            </p>
          )}
        </div>

        {/* ── Enrichment Section ── */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            {t("finance.transactions.optionalDetails", "Optional Details")}
          </p>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              {t("finance.transactions.notes", "Notes")}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder={t(
                "finance.transactions.notesPlaceholder",
                "Add any notes about this transaction…",
              )}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm resize-none"
            />
            <p className="mt-1 text-xs text-gray-400 text-right">
              {notes.length}/500
            </p>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              {t("finance.transactions.tags", "Tags")}
            </label>
            <TagInput tags={tags} onChange={setTags} />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              {t("finance.transactions.attachment", "Attachment")}
            </label>
            <FileUpload
              file={attachmentFile}
              existingMeta={existingAttachmentMeta}
              onFileSelect={setAttachmentFile}
              onRemove={handleRemoveAttachment}
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl btn-primary font-medium disabled:opacity-50 mt-2"
        >
          {loading
            ? t("finance.transactions.saving", "Saving…")
            : isEditMode
              ? t("finance.transactions.saveChanges", "Save Changes")
              : type === "Income"
                ? t("finance.transactions.addIncome", "Add Income")
                : t("finance.transactions.addExpense", "Add Expense")}
        </button>
      </form>
    </div>
  );
};

export default TransactionFormPage;
