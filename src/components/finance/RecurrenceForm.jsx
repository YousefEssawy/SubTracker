import { useState } from "react";
import toast from "react-hot-toast";
import { useSpaces } from "@/contexts/SpaceContext";
import { useCategories } from "@/contexts/CategoryContext";
import { useRecurrences } from "@/contexts/RecurrenceContext";
import { CURRENCIES } from "@/utils/currencies";
import { toDateInputValue } from "@/utils/dateUtils";
import { HiOutlineXMark } from "react-icons/hi2";

const PATTERNS = ["Weekly", "Monthly", "Yearly", "Custom"];

const RecurrenceForm = ({ onClose }) => {
  const { spaces } = useSpaces();
  const { incomeCategories, expenseCategories } = useCategories();
  const { addRecurrence } = useRecurrences();

  const [type, setType] = useState("Expense");
  const [spaceId, setSpaceId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("EGP");
  const [pattern, setPattern] = useState("Monthly");
  const [interval, setInterval] = useState("1");
  const [startDate, setStartDate] = useState(toDateInputValue(new Date()));
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const availableCategories =
    type === "Income" ? incomeCategories : expenseCategories;

  const handleTypeChange = (t) => {
    setType(t);
    setCategoryId("");
  };

  const validate = () => {
    const e = {};
    if (!spaceId) e.spaceId = "Space is required.";
    if (!categoryId) e.categoryId = "Category is required.";
    const num = parseFloat(amount);
    if (!amount || isNaN(num) || num <= 0) e.amount = "Amount must be > 0.";
    if (!startDate) e.startDate = "Start date is required.";
    const intv = parseInt(interval, 10);
    if (!interval || isNaN(intv) || intv < 1)
      e.interval = "Interval must be ≥ 1.";
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await addRecurrence({
        type,
        spaceId,
        categoryId,
        amount: parseFloat(amount),
        currency,
        pattern,
        interval: parseInt(interval, 10),
        startDate,
        endDate: endDate || null,
      });
      toast.success("Recurrence created!");
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to create recurrence.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            Add Recurrence
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <HiOutlineXMark className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type */}
          <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
            {["Income", "Expense"].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => handleTypeChange(t)}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${type === t ? (t === "Income" ? "bg-emerald-500 text-white" : "bg-red-500 text-white") : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400"}`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Space */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Space
            </label>
            <select
              value={spaceId}
              onChange={(e) => setSpaceId(e.target.value)}
              className={inputCls}
            >
              <option value="">Select…</option>
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
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={inputCls}
            >
              <option value="">Select…</option>
              {availableCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="mt-1 text-xs text-red-500">{errors.categoryId}</p>
            )}
          </div>

          {/* Amount + Currency */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Amount
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className={inputCls}
              />
              {errors.amount && (
                <p className="mt-1 text-xs text-red-500">{errors.amount}</p>
              )}
            </div>
            <div className="w-24">
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className={inputCls}
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pattern + Interval */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Pattern
              </label>
              <select
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                className={inputCls}
              >
                {PATTERNS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-24">
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Every
              </label>
              <input
                type="number"
                min="1"
                value={interval}
                onChange={(e) => setInterval(e.target.value)}
                className={inputCls}
              />
              {errors.interval && (
                <p className="mt-1 text-xs text-red-500">{errors.interval}</p>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={inputCls}
              />
              {errors.startDate && (
                <p className="mt-1 text-xs text-red-500">{errors.startDate}</p>
              )}
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                End Date <span className="text-gray-400">(optional)</span>
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl btn-primary font-medium disabled:opacity-50 mt-2"
          >
            {loading ? "Creating…" : "Create Recurrence"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RecurrenceForm;
