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
import { CURRENCIES } from "@/utils/currencies";
import { toDateInputValue } from "@/utils/dateUtils";
import TagInput from "@/components/finance/TagInput";
import FileUpload from "@/components/finance/FileUpload";

const TransactionFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  const { addTransaction, updateTransaction } = useTransactions();
  const { spaces } = useSpaces();
  const { incomeCategories, expenseCategories } = useCategories();

  const isEditMode = Boolean(id) && location.pathname.includes("/edit");

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditMode);
  const [errors, setErrors] = useState({});

  // Core fields
  const [type, setType] = useState("Expense");
  const [spaceId, setSpaceId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("EGP");
  const [transactionDate, setTransactionDate] = useState(
    toDateInputValue(new Date()),
  );

  // Enrichment fields
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState([]);
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [existingAttachmentMeta, setExistingAttachmentMeta] = useState(null);
  const [_existingAttachmentUrl, setExistingAttachmentUrl] = useState(null);

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
        toast.error("Failed to load transaction.");
        navigate("/transactions");
      })
      .finally(() => setFetchLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEditMode, user]);

  const handleTypeChange = (newType) => {
    setType(newType);
    setCategoryId("");
  };

  const validate = () => {
    const e = {};
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const data = {
        type,
        spaceId,
        categoryId,
        amount: parseFloat(amount),
        currency,
        transactionDate,
        notes: notes.trim() || null,
        tags,
      };

      let txId = id;

      if (isEditMode) {
        // Handle attachment on edit
        if (attachmentFile) {
          const { url, meta } = await uploadAttachment(
            user.uid,
            id,
            attachmentFile,
          );
          data.attachmentUrl = url;
          data.attachmentMeta = meta;
        }
        await updateTransaction(id, data);
        toast.success("Transaction updated!");
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
              "Transaction saved but attachment upload failed. You can attach it later.",
            );
          }
        }
        toast.success("Transaction added!");
      }
      navigate("/transactions");
    } catch (err) {
      toast.error(err.message || "Failed to save transaction.");
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
    <div className="max-w-lg mx-auto px-4 py-8">
      {/* Back */}
      <button
        onClick={() => navigate("/transactions")}
        className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-primary transition-colors mb-6"
      >
        <HiOutlineArrowLeft className="w-4 h-4" />
        Back to Transactions
      </button>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-7">
        {isEditMode ? "Edit Transaction" : "Add Transaction"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Type toggle */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Type
          </label>
          <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
            {["Income", "Expense"].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => handleTypeChange(t)}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                  type === t
                    ? t === "Income"
                      ? "bg-emerald-500 text-white"
                      : "bg-red-500 text-white"
                    : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Space */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Space
          </label>
          <select
            value={spaceId}
            onChange={(e) => setSpaceId(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
          >
            <option value="">Select a space…</option>
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
            Category
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
          >
            <option value="">Select a category…</option>
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
              No {type.toLowerCase()} categories yet. Create one in Categories
              first.
            </p>
          )}
        </div>

        {/* Amount + Currency */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Amount
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
          <div className="w-28">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Currency
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
            Date
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
            Optional Details
          </p>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Add any notes about this transaction…"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm resize-none"
            />
            <p className="mt-1 text-xs text-gray-400 text-right">
              {notes.length}/500
            </p>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Tags
            </label>
            <TagInput tags={tags} onChange={setTags} />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Attachment
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
            ? "Saving…"
            : isEditMode
              ? "Save Changes"
              : "Add Transaction"}
        </button>
      </form>
    </div>
  );
};

export default TransactionFormPage;
