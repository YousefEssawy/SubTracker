import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import {
  addSubscription,
  updateSubscription,
  getSubscription,
} from "@/services/subscriptionService";
import { CATEGORIES } from "@/utils/categories";
import { CURRENCIES, DEFAULT_CURRENCY } from "@/utils/currencies";
import { BILLING_CYCLES, toDateInputValue } from "@/utils/dateUtils";
import { HiOutlineArrowLeft } from "react-icons/hi2";
import { useTranslation } from "react-i18next";

const SubscriptionFormPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  const [form, setForm] = useState({
    name: "",
    price: "",
    currency: DEFAULT_CURRENCY,
    category: "other",
    billingCycle: "monthly",
    customCycleDays: "",
    renewalDate: toDateInputValue(new Date()),
    paymentMethod: "",
    status: "active",
    notes: "",
  });

  useEffect(() => {
    if (isEdit && user) {
      (async () => {
        const sub = await getSubscription(user.uid, id);
        if (sub) {
          setForm({
            name: sub.name || "",
            price: sub.price || "",
            currency: sub.currency || DEFAULT_CURRENCY,
            category: sub.category || "other",
            billingCycle: sub.billingCycle || "monthly",
            customCycleDays: sub.customCycleDays || "",
            renewalDate: toDateInputValue(sub.renewalDate),
            paymentMethod: sub.paymentMethod || "",
            status: sub.status || "active",
            notes: sub.notes || "",
          });
        }
        setFetching(false);
      })();
    }
  }, [id, isEdit, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        ...form,
        price: parseFloat(form.price),
        customCycleDays:
          form.billingCycle === "custom"
            ? parseInt(form.customCycleDays)
            : null,
      };

      if (isEdit) {
        await updateSubscription(user.uid, id, data);
      } else {
        await addSubscription(user.uid, data);
      }
      navigate("/subscriptions");
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-20 lg:pb-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-4 transition-colors"
        >
          <HiOutlineArrowLeft className="w-4 h-4" />
          {t("subscriptionForm.back")}
        </button>

        <h1 className="page-title mb-6">
          {isEdit
            ? t("subscriptionForm.editTitle")
            : t("subscriptionForm.addTitle")}
        </h1>

        <form
          onSubmit={handleSubmit}
          className="glass-card p-6 sm:p-8 space-y-5"
        >
          {/* Name */}
          <div>
            <label className="label-text">{t("subscriptionForm.name")}</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder={t("subscriptionForm.namePlaceholder")}
              className="input-field"
              required
            />
          </div>

          {/* Price & Currency */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-text">
                {t("subscriptionForm.price")}
              </label>
              <input
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={handleChange}
                placeholder="199.00"
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="label-text">
                {t("subscriptionForm.currency")}
              </label>
              <select
                name="currency"
                value={form.currency}
                onChange={handleChange}
                className="select-field"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.symbol} {c.code}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="label-text">
              {t("subscriptionForm.category")}
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="select-field"
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Billing Cycle */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-text">
                {t("subscriptionForm.billingCycle")}
              </label>
              <select
                name="billingCycle"
                value={form.billingCycle}
                onChange={handleChange}
                className="select-field"
              >
                {BILLING_CYCLES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            {form.billingCycle === "custom" && (
              <div>
                <label className="label-text">
                  {t("subscriptionForm.cycleDays")}
                </label>
                <input
                  name="customCycleDays"
                  type="number"
                  min="1"
                  value={form.customCycleDays}
                  onChange={handleChange}
                  placeholder={t("subscriptionForm.cycleDaysPlaceholder")}
                  className="input-field"
                  required
                />
              </div>
            )}
          </div>

          {/* Renewal Date */}
          <div>
            <label className="label-text">
              {t("subscriptionForm.renewalDate")}
            </label>
            <input
              name="renewalDate"
              type="date"
              value={form.renewalDate}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="label-text">
              {t("subscriptionForm.paymentMethod")}
            </label>
            <input
              name="paymentMethod"
              value={form.paymentMethod}
              onChange={handleChange}
              placeholder={t("subscriptionForm.paymentMethodPlaceholder")}
              className="input-field"
            />
          </div>

          {/* Status (only for edit) */}
          {isEdit && (
            <div>
              <label className="label-text">
                {t("subscriptionForm.status")}
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="select-field"
              >
                <option value="active">{t("subscriptionForm.active")}</option>
                <option value="paused">{t("subscriptionForm.paused")}</option>
                <option value="cancelled">
                  {t("subscriptionForm.cancelled")}
                </option>
              </select>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="label-text">{t("subscriptionForm.notes")}</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows="3"
              placeholder={t("subscriptionForm.notesPlaceholder")}
              className="input-field resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 py-3 disabled:opacity-50"
            >
              {loading
                ? t("subscriptionForm.saving")
                : isEdit
                  ? t("subscriptionForm.updateSubscription")
                  : t("subscriptionForm.addSubscription")}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-secondary px-6"
            >
              {t("subscriptionForm.cancelBtn")}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default SubscriptionFormPage;
