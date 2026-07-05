import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscriptions } from "@/contexts/SubscriptionContext";
import {
  deleteSubscription,
  updateSubscription,
} from "@/services/subscriptionService";
import { getCategoryById, CATEGORIES } from "@/utils/categories";
import { formatCurrency } from "@/utils/currencies";
import {
  getMonthlyEquivalent,
  getDaysUntilRenewal,
  formatDate,
} from "@/utils/dateUtils";
import {
  HiOutlinePlusCircle,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlinePause,
  HiOutlinePlay,
  HiOutlineFunnel,
  HiOutlineMagnifyingGlass,
} from "react-icons/hi2";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import RenewalDial from "@/components/ui/RenewalDial";
import { useTranslation } from "react-i18next";
import { TFunction } from "i18next";
import type { SubscriptionStatus, CurrencyCode, Subscription } from "@/models";

interface SubWithDays extends Subscription {
  daysUntil: number;
}

// ─── Single subscription row — reused across every urgency/status group ──────
const SubscriptionRow = ({
  sub,
  t,
  onToggleStatus,
  onDelete,
}: {
  sub: SubWithDays;
  t: TFunction;
  onToggleStatus: (sub: Subscription) => void;
  onDelete: (id: string) => void;
}) => {
  const cat = getCategoryById(sub.category);
  const monthly = getMonthlyEquivalent(
    sub.price,
    sub.billingCycle,
    sub.customCycleDays,
  );
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return t("subscriptions.active");
      case "paused":
        return t("subscriptions.paused");
      case "cancelled":
        return t("subscriptions.cancelled");
      default:
        return status;
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`glass-card p-4 sm:p-5 hover:shadow-card-hover transition-all duration-300 ${sub.status !== "active" ? "opacity-60" : ""}`}
    >
      {/* Row 1 + 2: Icon, name/status/details, and price+actions (sm+) */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
          <RenewalDial
            icon={cat.icon}
            iconColor={cat.color}
            daysUntil={sub.daysUntil}
            billingCycle={sub.billingCycle}
            customCycleDays={sub.customCycleDays}
            size={48}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                {sub.name}
              </h3>
              <span
                className={`px-2 py-0.5 text-[10px] font-semibold rounded-full uppercase flex-shrink-0
                ${sub.status === "active" ? "bg-success/10 text-success" : ""}
                ${sub.status === "paused" ? "bg-warning/10 text-warning" : ""}
                ${sub.status === "cancelled" ? "bg-danger/10 text-danger" : ""}
              `}
              >
                {getStatusLabel(sub.status)}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {cat.name} ·{" "}
              {t(`billingCycle.${sub.billingCycle}`, sub.billingCycle)}
              <br />
              {t("subscriptions.renews")}{" "}
              <span className="font-mono">{formatDate(sub.renewalDate)}</span>
            </p>
          </div>
        </div>
        {/* Price + actions — visible only on sm+ inline */}
        <div className="hidden sm:flex items-center gap-4 flex-shrink-0 ml-2">
          <div className="text-right">
            <p className="figure font-bold text-gray-900 dark:text-white">
              {formatCurrency(sub.price, sub.currency as CurrencyCode)}
            </p>
            <p className="figure text-xs text-gray-400">
              {formatCurrency(monthly, sub.currency as CurrencyCode)}/
              {t("common.mo", "mo")}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onToggleStatus(sub)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
              title={
                sub.status === "active"
                  ? t("subscriptions.pause")
                  : t("subscriptions.resume")
              }
            >
              {sub.status === "active" ? (
                <HiOutlinePause className="w-4 h-4" />
              ) : (
                <HiOutlinePlay className="w-4 h-4" />
              )}
            </button>
            <Link
              to={`/subscriptions/${sub.id}`}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
            >
              <HiOutlinePencilSquare className="w-4 h-4" />
            </Link>
            <button
              onClick={() => onDelete(sub.id)}
              className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-500 hover:text-danger transition-colors"
            >
              <HiOutlineTrash className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      {/* Row 3: Action buttons — visible only on mobile */}
      <div className="flex sm:hidden items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
        <p className="figure font-semibold text-gray-900 dark:text-white text-sm">
          {formatCurrency(sub.price, sub.currency as CurrencyCode)}
          <span className="text-xs text-gray-400 font-normal ml-1">
            /{sub.billingCycle}
          </span>
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onToggleStatus(sub)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
            title={
              sub.status === "active"
                ? t("subscriptions.pause")
                : t("subscriptions.resume")
            }
          >
            {sub.status === "active" ? (
              <HiOutlinePause className="w-4 h-4" />
            ) : (
              <HiOutlinePlay className="w-4 h-4" />
            )}
          </button>
          <Link
            to={`/subscriptions/${sub.id}`}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
          >
            <HiOutlinePencilSquare className="w-4 h-4" />
          </Link>
          <button
            onClick={() => onDelete(sub.id)}
            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-500 hover:text-danger transition-colors"
          >
            <HiOutlineTrash className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// ─── A titled group of rows — the urgency/status buckets the list is sorted into ──
const SubscriptionGroup = ({
  label,
  items,
  muted,
  t,
  onToggleStatus,
  onDelete,
}: {
  label: string;
  items: SubWithDays[];
  muted?: boolean;
  t: TFunction;
  onToggleStatus: (sub: Subscription) => void;
  onDelete: (id: string) => void;
}) => {
  if (items.length === 0) return null;
  return (
    <div>
      <p
        className={`px-1 mb-2 text-xs font-semibold uppercase tracking-wider ${muted ? "text-gray-400 dark:text-gray-500" : "text-gray-500 dark:text-gray-400"}`}
      >
        {label}
      </p>
      <div className="grid gap-3">
        <AnimatePresence mode="popLayout">
          {items.map((sub) => (
            <SubscriptionRow
              key={sub.id}
              sub={sub}
              t={t}
              onToggleStatus={onToggleStatus}
              onDelete={onDelete}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

const SubscriptionsPage = () => {
  const { user } = useAuth();
  const { subscriptions, loading } = useSubscriptions();
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return subscriptions
      .filter((sub) => {
        const matchSearch = sub.name
          .toLowerCase()
          .includes(search.toLowerCase());
        const matchCat = filterCat === "all" || sub.category === filterCat;
        const matchStatus =
          filterStatus === "all" || sub.status === filterStatus;
        return matchSearch && matchCat && matchStatus;
      })
      .map((sub) => ({ ...sub, daysUntil: getDaysUntilRenewal(sub.renewalDate) }));
  }, [subscriptions, search, filterCat, filterStatus]);

  // Active subs are grouped by how soon they renew — the one ordering that
  // actually matters for a subscription list. Paused/cancelled don't have a
  // renewal to be urgent about, so they get their own quiet groups instead.
  const groups = useMemo(() => {
    const active = filtered
      .filter((s) => s.status === "active")
      .sort((a, b) => a.daysUntil - b.daysUntil);
    return {
      soon: active.filter((s) => s.daysUntil <= 7),
      thisMonth: active.filter((s) => s.daysUntil > 7 && s.daysUntil <= 30),
      later: active.filter((s) => s.daysUntil > 30),
      paused: filtered
        .filter((s) => s.status === "paused")
        .sort((a, b) => a.daysUntil - b.daysUntil),
      cancelled: filtered
        .filter((s) => s.status === "cancelled")
        .sort((a, b) => a.daysUntil - b.daysUntil),
    };
  }, [filtered]);

  // Returns { count, totals: { [currency]: monthlyCost } } for a given status
  const stats = useMemo(() => {
    const calc = (status: SubscriptionStatus) => {
      const group = subscriptions.filter((s) => s.status === status);
      const totals: Record<string, number> = {};
      group.forEach((s) => {
        const monthly = getMonthlyEquivalent(
          s.price,
          s.billingCycle,
          s.customCycleDays,
        );
        const cur = (s.currency as CurrencyCode) || "EGP";
        totals[cur] = (totals[cur] || 0) + monthly;
      });
      return { count: group.length, totals };
    };
    return {
      active: calc("active"),
      paused: calc("paused"),
      cancelled: calc("cancelled"),
    };
  }, [subscriptions]);

  const handleDelete = async () => {
    if (deleteTarget && user) {
      try {
        await deleteSubscription(user.uid, deleteTarget);
      } catch (err) {
        console.error(err);
        toast.error(t("subscriptions.deleteError", "Failed to delete subscription."));
      }
      setDeleteTarget(null);
    }
  };

  const handleToggleStatus = async (sub: Subscription) => {
    if (!user) return;
    const newStatus: SubscriptionStatus =
      sub.status === "active" ? "paused" : "active";
    try {
      await updateSubscription(user.uid, sub.id, { status: newStatus });
    } catch (err) {
      console.error(err);
      toast.error(t("subscriptions.toggleError", "Failed to update subscription."));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <div className="flex items-center justify-between">
        <h1 className="page-title">{t("subscriptions.title")}</h1>
        <Link
          to="/subscriptions/add"
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <HiOutlinePlusCircle className="w-4 h-4" />
          <span className="hidden sm:inline">{t("subscriptions.addNew")}</span>
        </Link>
      </div>

      {/* Hero strip — active count + monthly total is the headline fact;
          paused/cancelled are supporting counts, not equal-weight cards. */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-5 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6"
      >
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            {t("subscriptions.active")}
          </p>
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="figure text-3xl font-bold text-gray-900 dark:text-white">
              {stats.active.count}
            </span>
            {Object.entries(stats.active.totals).map(([cur, total]) => (
              <span
                key={cur}
                className="figure text-sm text-gray-500 dark:text-gray-400"
              >
                {formatCurrency(total, cur as CurrencyCode)}
                <span className="text-xs text-gray-400">
                  /{t("common.mo", "mo")}
                </span>
              </span>
            ))}
          </div>
        </div>

        <div className="hidden sm:block w-px h-10 bg-gray-200 dark:bg-gray-700" />

        <div className="flex items-center gap-4 text-sm">
          <span className="inline-flex items-center gap-1.5 text-warning">
            <span className="w-1.5 h-1.5 rounded-full bg-warning" />
            {t("subscriptions.paused")}
            <span className="figure font-semibold">{stats.paused.count}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-danger">
            <span className="w-1.5 h-1.5 rounded-full bg-danger" />
            {t("subscriptions.cancelled")}
            <span className="figure font-semibold">
              {stats.cancelled.count}
            </span>
          </span>
        </div>
      </motion.div>

      {/* Search & Filter */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={t("subscriptions.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-9 text-sm"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2.5 rounded-xl border transition-colors ${showFilters ? "bg-primary/10 border-primary/30 text-primary" : "border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
          >
            <HiOutlineFunnel className="w-4 h-4" />
          </button>
        </div>
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">
                    {t("subscriptions.category")}
                  </label>
                  <select
                    value={filterCat}
                    onChange={(e) => setFilterCat(e.target.value)}
                    className="select-field text-sm py-2"
                  >
                    <option value="all">
                      {t("subscriptions.allCategories")}
                    </option>
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.icon} {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">
                    {t("subscriptions.status")}
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="select-field text-sm py-2"
                  >
                    <option value="all">
                      {t("subscriptions.allStatuses")}
                    </option>
                    <option value="active">{t("subscriptions.active")}</option>
                    <option value="paused">{t("subscriptions.paused")}</option>
                    <option value="cancelled">
                      {t("subscriptions.cancelled")}
                    </option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Subscription List — grouped by renewal urgency, not a flat list */}
      {filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {subscriptions.length === 0
              ? t("subscriptions.noSubscriptionsYet")
              : t("subscriptions.noMatchingFilters")}
          </p>
          {subscriptions.length === 0 && (
            <Link
              to="/subscriptions/add"
              className="btn-primary inline-flex items-center gap-2"
            >
              <HiOutlinePlusCircle className="w-4 h-4" />
              {t("subscriptions.addFirstSubscription")}
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          <SubscriptionGroup
            label={t("subscriptions.renewingSoon")}
            items={groups.soon}
            t={t}
            onToggleStatus={handleToggleStatus}
            onDelete={(id) => setDeleteTarget(id)}
          />
          <SubscriptionGroup
            label={t("subscriptions.thisMonth")}
            items={groups.thisMonth}
            t={t}
            onToggleStatus={handleToggleStatus}
            onDelete={(id) => setDeleteTarget(id)}
          />
          <SubscriptionGroup
            label={t("subscriptions.later")}
            items={groups.later}
            t={t}
            onToggleStatus={handleToggleStatus}
            onDelete={(id) => setDeleteTarget(id)}
          />
          <SubscriptionGroup
            label={t("subscriptions.paused")}
            items={groups.paused}
            muted
            t={t}
            onToggleStatus={handleToggleStatus}
            onDelete={(id) => setDeleteTarget(id)}
          />
          <SubscriptionGroup
            label={t("subscriptions.cancelled")}
            items={groups.cancelled}
            muted
            t={t}
            onToggleStatus={handleToggleStatus}
            onDelete={(id) => setDeleteTarget(id)}
          />
        </div>
      )}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={t("subscriptions.deleteTitle")}
        message={t("subscriptions.deleteMessage")}
        confirmText={t("subscriptions.delete")}
        cancelText={t("subscriptions.cancel")}
        variant="danger"
      />
    </div>
  );
};

export default SubscriptionsPage;
