import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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

const SubscriptionsPage = () => {
  const { user } = useAuth();
  const { subscriptions, loading } = useSubscriptions();
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    return subscriptions.filter((sub) => {
      const matchSearch = sub.name.toLowerCase().includes(search.toLowerCase());
      const matchCat = filterCat === "all" || sub.category === filterCat;
      const matchStatus = filterStatus === "all" || sub.status === filterStatus;
      return matchSearch && matchCat && matchStatus;
    });
  }, [subscriptions, search, filterCat, filterStatus]);

  const handleDelete = async (subId) => {
    if (window.confirm("Are you sure you want to delete this subscription?")) {
      await deleteSubscription(user.uid, subId);
    }
  };

  const handleToggleStatus = async (sub) => {
    const newStatus = sub.status === "active" ? "paused" : "active";
    await updateSubscription(user.uid, sub.id, { status: newStatus });
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
        <h1 className="page-title">Subscriptions</h1>
        <Link
          to="/subscriptions/add"
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <HiOutlinePlusCircle className="w-4 h-4" />
          <span className="hidden sm:inline">Add New</span>
        </Link>
      </div>

      {/* Search & Filter */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search subscriptions..."
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
                    Category
                  </label>
                  <select
                    value={filterCat}
                    onChange={(e) => setFilterCat(e.target.value)}
                    className="select-field text-sm py-2"
                  >
                    <option value="all">All Categories</option>
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.icon} {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">
                    Status
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="select-field text-sm py-2"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Subscription List */}
      {filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {subscriptions.length === 0
              ? "You haven't added any subscriptions yet"
              : "No subscriptions match your filters"}
          </p>
          {subscriptions.length === 0 && (
            <Link
              to="/subscriptions/add"
              className="btn-primary inline-flex items-center gap-2"
            >
              <HiOutlinePlusCircle className="w-4 h-4" />
              Add Your First Subscription
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((sub) => {
              const cat = getCategoryById(sub.category);
              const daysUntil = getDaysUntilRenewal(sub.renewalDate);
              const monthly = getMonthlyEquivalent(
                sub.price,
                sub.billingCycle,
                sub.customCycleDays,
              );
              return (
                <motion.div
                  key={sub.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`glass-card p-4 sm:p-5 hover:shadow-card-hover transition-all duration-300 ${sub.status !== "active" ? "opacity-60" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                      <div
                        className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                        style={{ backgroundColor: cat.color + "20" }}
                      >
                        {cat.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                            {sub.name}
                          </h3>
                          <span
                            className={`px-2 py-0.5 text-[10px] font-semibold rounded-full uppercase
                            ${sub.status === "active" ? "bg-success/10 text-success" : ""}
                            ${sub.status === "paused" ? "bg-warning/10 text-warning" : ""}
                            ${sub.status === "cancelled" ? "bg-danger/10 text-danger" : ""}
                          `}
                          >
                            {sub.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {cat.name} · {sub.billingCycle} · Renews{" "}
                          {formatDate(sub.renewalDate)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0 ml-2">
                      <div className="text-right hidden sm:block">
                        <p className="font-bold text-gray-900 dark:text-white">
                          {formatCurrency(sub.price, sub.currency)}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatCurrency(monthly, sub.currency)}/mo
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleToggleStatus(sub)}
                          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
                          title={sub.status === "active" ? "Pause" : "Resume"}
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
                          onClick={() => handleDelete(sub.id)}
                          className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-500 hover:text-danger transition-colors"
                        >
                          <HiOutlineTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default SubscriptionsPage;
