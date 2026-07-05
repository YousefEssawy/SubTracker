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
} from "@/utils/dateUtils";
import {
  HiOutlinePlus,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlinePause,
  HiOutlinePlay,
  HiOutlineMagnifyingGlass,
} from "react-icons/hi2";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useTranslation } from "react-i18next";
import { TFunction } from "i18next";
import type { SubscriptionStatus, CurrencyCode, Subscription } from "@/models";

interface SubWithDays extends Subscription {
  daysUntil: number;
}

// ─── Single subscription row — flat list item with a colored initial badge ────
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

  const daysLabel =
    sub.daysUntil < 0
      ? t("subscriptions.overdueByDays", {
          defaultValue: "Overdue by {{count}}d",
          count: Math.abs(sub.daysUntil),
        })
      : sub.daysUntil === 0
        ? t("dashboard.today", "Today")
        : t("subscriptions.inDays", {
            defaultValue: "in {{count}}d",
            count: sub.daysUntil,
          });
  const daysTone =
    sub.daysUntil < 0
      ? "text-danger"
      : sub.daysUntil <= 7
        ? "text-warning"
        : "text-gray-400 dark:text-gray-500";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className={`group flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors ${sub.status !== "active" ? "opacity-60" : ""}`}
    >
      <span
        className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
        style={{ backgroundColor: cat.color }}
      >
        {sub.name.charAt(0).toUpperCase()}
      </span>

      <div className="min-w-0 flex-1">
        <p className="font-semibold text-gray-900 dark:text-white truncate">
          {sub.name}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
          {t(`billingCycle.${sub.billingCycle}`, sub.billingCycle)} · {cat.name}
        </p>
      </div>

      <div className="text-right flex-shrink-0">
        <p className="figure font-semibold text-gray-900 dark:text-white">
          {formatCurrency(sub.price, sub.currency as CurrencyCode)}
        </p>
        <p className={`text-xs font-medium ${daysTone}`}>{daysLabel}</p>
      </div>

      {/* Hover actions */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onToggleStatus(sub)}
          className="p-2 rounded-lg hover:bg-gray-200/70 dark:hover:bg-gray-700 text-gray-500 transition-colors"
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
          className="p-2 rounded-lg hover:bg-gray-200/70 dark:hover:bg-gray-700 text-gray-500 transition-colors"
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
      {/* subtle monthly-equivalent, hidden on hover to make room for actions */}
      <span className="hidden xl:block group-hover:hidden text-xs text-gray-400 figure w-24 text-right flex-shrink-0">
        {formatCurrency(monthly, sub.currency as CurrencyCode)}/
        {t("common.mo", "mo")}
      </span>
    </motion.div>
  );
};

// ─── Urgency/status group ─────────────────────────────────────────────────────
const SubscriptionGroup = ({
  label,
  dotColor,
  items,
  t,
  onToggleStatus,
  onDelete,
}: {
  label: string;
  dotColor: string;
  items: SubWithDays[];
  t: TFunction;
  onToggleStatus: (sub: Subscription) => void;
  onDelete: (id: string) => void;
}) => {
  if (items.length === 0) return null;
  return (
    <div>
      <div className="flex items-center gap-2 px-4 mb-1">
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: dotColor }}
        />
        <p className="text-sm font-bold text-gray-900 dark:text-white">
          {label}
        </p>
        <span className="text-xs font-medium text-gray-400">
          {items.length}
        </span>
      </div>
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
  );
};

const SubscriptionsPage = () => {
  const { user } = useAuth();
  const { subscriptions, loading } = useSubscriptions();
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return subscriptions
      .filter((sub) => {
        const matchSearch = sub.name
          .toLowerCase()
          .includes(search.toLowerCase());
        const matchCat = filterCat === "all" || sub.category === filterCat;
        return matchSearch && matchCat;
      })
      .map((sub) => ({
        ...sub,
        daysUntil: getDaysUntilRenewal(sub.renewalDate),
      }));
  }, [subscriptions, search, filterCat]);

  const groups = useMemo(() => {
    const active = filtered
      .filter((s) => s.status === "active")
      .sort((a, b) => a.daysUntil - b.daysUntil);
    return {
      overdue: active.filter((s) => s.daysUntil < 0),
      soon: active.filter((s) => s.daysUntil >= 0 && s.daysUntil <= 7),
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

  const headline = useMemo(() => {
    const active = subscriptions.filter((s) => s.status === "active");
    const totals: Record<string, number> = {};
    active.forEach((s) => {
      const monthly = getMonthlyEquivalent(
        s.price,
        s.billingCycle,
        s.customCycleDays,
      );
      const cur = (s.currency as CurrencyCode) || "EGP";
      totals[cur] = (totals[cur] || 0) + monthly;
    });
    return { count: active.length, totals };
  }, [subscriptions]);

  // categories present in the user's subscriptions, for the filter chips
  const usedCategories = useMemo(() => {
    const ids = new Set(subscriptions.map((s) => s.category));
    return CATEGORIES.filter((c) => ids.has(c.id));
  }, [subscriptions]);

  const handleDelete = async () => {
    if (deleteTarget && user) {
      try {
        await deleteSubscription(user.uid, deleteTarget);
      } catch (err) {
        console.error(err);
        toast.error(
          t("subscriptions.deleteError", "Failed to delete subscription."),
        );
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
      toast.error(
        t("subscriptions.toggleError", "Failed to update subscription."),
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const totalsLabel = Object.entries(headline.totals)
    .map(([cur, v]) => `${formatCurrency(v, cur as CurrencyCode)}`)
    .join(" · ");

  return (
    <div className="space-y-5 pb-20 lg:pb-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {t("subscriptions.title")}
          </h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            {t("subscriptions.activeCount", {
              defaultValue: "{{count}} active",
              count: headline.count,
            })}
            {totalsLabel && (
              <>
                {" · "}
                <span className="figure">{totalsLabel}</span> /{" "}
                {t("common.mo", "mo")}
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:flex-initial">
            <HiOutlineMagnifyingGlass className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={t("subscriptions.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-56 ps-9 pe-3 py-2 rounded-full text-sm bg-gray-100 dark:bg-gray-800 border border-transparent focus:border-primary/40 focus:bg-white dark:focus:bg-gray-900 outline-none transition-colors placeholder:text-gray-400"
            />
          </div>
          <Link
            to="/subscriptions/add"
            className="btn-primary flex items-center gap-2 text-sm whitespace-nowrap"
          >
            <HiOutlinePlus className="w-4 h-4" />
            <span className="hidden sm:inline">
              {t("subscriptions.addNew")}
            </span>
          </Link>
        </div>
      </div>

      {/* Filter chips */}
      {usedCategories.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          <button
            onClick={() => setFilterCat("all")}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filterCat === "all" ? "bg-primary text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"}`}
          >
            {t("subscriptions.allCategories", "All")}
          </button>
          {usedCategories.map((c) => (
            <button
              key={c.id}
              onClick={() => setFilterCat(c.id)}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filterCat === c.id ? "bg-primary text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"}`}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
            <HiOutlinePlus className="w-7 h-7 text-primary" />
          </div>
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
              <HiOutlinePlus className="w-4 h-4" />
              {t("subscriptions.addFirstSubscription")}
            </Link>
          )}
        </div>
      ) : (
        <div className="glass-card p-2 sm:p-3 space-y-4">
          <SubscriptionGroup
            label={t("subscriptions.overdue", "Overdue")}
            dotColor="#EF4444"
            items={groups.overdue}
            t={t}
            onToggleStatus={handleToggleStatus}
            onDelete={(id) => setDeleteTarget(id)}
          />
          <SubscriptionGroup
            label={t("subscriptions.renewingSoon", "Due soon")}
            dotColor="#F59E0B"
            items={groups.soon}
            t={t}
            onToggleStatus={handleToggleStatus}
            onDelete={(id) => setDeleteTarget(id)}
          />
          <SubscriptionGroup
            label={t("subscriptions.thisMonth", "This month")}
            dotColor="#6366F1"
            items={groups.thisMonth}
            t={t}
            onToggleStatus={handleToggleStatus}
            onDelete={(id) => setDeleteTarget(id)}
          />
          <SubscriptionGroup
            label={t("subscriptions.later", "Later")}
            dotColor="#94A3B8"
            items={groups.later}
            t={t}
            onToggleStatus={handleToggleStatus}
            onDelete={(id) => setDeleteTarget(id)}
          />
          <SubscriptionGroup
            label={t("subscriptions.paused", "Paused")}
            dotColor="#94A3B8"
            items={groups.paused}
            t={t}
            onToggleStatus={handleToggleStatus}
            onDelete={(id) => setDeleteTarget(id)}
          />
          <SubscriptionGroup
            label={t("subscriptions.cancelled", "Cancelled")}
            dotColor="#94A3B8"
            items={groups.cancelled}
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
