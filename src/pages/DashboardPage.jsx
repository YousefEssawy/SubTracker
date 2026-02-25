import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useSubscriptions } from "@/contexts/SubscriptionContext";
import { useTransactions } from "@/contexts/TransactionContext";
import BalanceCard from "@/components/finance/BalanceCard";
import { getCategoryById } from "@/utils/categories";
import { formatCurrency, convertCurrency } from "@/utils/currencies";
import {
  getMonthlyEquivalent,
  getDaysUntilRenewal,
  formatDate,
} from "@/utils/dateUtils";
import {
  HiOutlineCreditCard,
  HiOutlineBanknotes,
  HiOutlineCalendarDays,
  HiOutlineArrowTrendingUp,
  HiOutlinePlusCircle,
} from "react-icons/hi2";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";
import { useTranslation } from "react-i18next";

const CHART_COLORS = [
  "#6366F1",
  "#EC4899",
  "#10B981",
  "#F59E0B",
  "#06B6D4",
  "#8B5CF6",
  "#EF4444",
  "#14B8A6",
  "#F97316",
  "#64748B",
];

// Financial Overview widget — reads from TransactionContext
const FinancialOverview = () => {
  const { balances } = useTransactions();
  const { t } = useTranslation();
  const hasTx = Object.keys(balances).length > 0;
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
      className="glass-card p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          {t("finance.balance.financialOverview", "Financial Overview")}
        </h3>
        <Link
          to="/transactions"
          className="text-sm text-primary hover:underline"
        >
          {t("finance.balance.viewTransactions", "View Transactions")}
        </Link>
      </div>
      {hasTx ? (
        <BalanceCard variant="summary" balances={balances} />
      ) : (
        <p className="text-sm text-gray-400 text-center py-6">
          {t(
            "dashboard.noTransactionsStats",
            "No income or expense transactions yet.",
          )}{" "}
          <Link to="/transactions/add" className="text-primary hover:underline">
            {t("finance.transactions.addTransaction", "Add one")}
          </Link>
          .
        </p>
      )}
    </motion.div>
  );
};

const DashboardPage = () => {
  const { activeSubscriptions, payments, loading } = useSubscriptions();
  const { t, i18n } = useTranslation();
  const displayCurrency = "EGP";

  const stats = useMemo(() => {
    const totalMonthly = activeSubscriptions.reduce((sum, sub) => {
      const monthly = getMonthlyEquivalent(
        sub.price,
        sub.billingCycle,
        sub.customCycleDays,
      );
      return (
        sum + convertCurrency(monthly, sub.currency || "EGP", displayCurrency)
      );
    }, 0);

    const totalYearly = totalMonthly * 12;
    const activeCount = activeSubscriptions.length;

    const sorted = [...activeSubscriptions]
      .map((s) => ({ ...s, daysUntil: getDaysUntilRenewal(s.renewalDate) }))
      .filter((s) => s.daysUntil >= 0)
      .sort((a, b) => a.daysUntil - b.daysUntil);

    const nextRenewal = sorted[0] || null;

    return {
      totalMonthly,
      totalYearly,
      activeCount,
      nextRenewal,
      upcomingSorted: sorted.slice(0, 5),
    };
  }, [activeSubscriptions, displayCurrency]);

  const categoryData = useMemo(() => {
    const map = {};
    activeSubscriptions.forEach((sub) => {
      const cat = getCategoryById(sub.category);
      const monthly = getMonthlyEquivalent(
        sub.price,
        sub.billingCycle,
        sub.customCycleDays,
      );
      const converted = convertCurrency(
        monthly,
        sub.currency || "EGP",
        displayCurrency,
      );
      map[cat.name] = (map[cat.name] || 0) + converted;
    });
    return Object.entries(map).map(([name, value]) => ({
      name,
      value: Math.round(value * 100) / 100,
    }));
  }, [activeSubscriptions, displayCurrency]);

  const monthlyTrendData = useMemo(() => {
    const months = [];
    const now = new Date();
    const currentLang = i18n.language || "en";
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        month: d.toLocaleDateString(currentLang, { month: "short" }),
        spending: 0,
      });
    }
    payments.forEach((p) => {
      const pd = new Date(p.paidDate);
      const monthLabel = pd.toLocaleDateString(currentLang, { month: "short" });
      const item = months.find((m) => m.month === monthLabel);
      if (item) {
        item.spending += convertCurrency(
          p.amount,
          p.currency || "EGP",
          displayCurrency,
        );
      }
    });
    // If no payments, project from active subscriptions
    if (payments.length === 0 && activeSubscriptions.length > 0) {
      const totalMonthly = stats.totalMonthly;
      months.forEach((m) => {
        m.spending = Math.round(totalMonthly);
      });
    }
    return months;
  }, [
    payments,
    activeSubscriptions,
    displayCurrency,
    stats.totalMonthly,
    i18n.language,
  ]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const containerAnim = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };
  const itemAnim = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerAnim}
      initial="hidden"
      animate="show"
      className="space-y-6 pb-20 lg:pb-6"
    >
      <div className="flex items-center justify-between">
        <h1 className="page-title">{t("dashboard.title")}</h1>
        <Link
          to="/subscriptions/add"
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <HiOutlinePlusCircle className="w-4 h-4" />
          <span className="hidden sm:inline">
            {t("dashboard.addSubscription")}
          </span>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            id: "monthly",
            label: t("dashboard.monthlySpending"),
            value: formatCurrency(stats.totalMonthly, displayCurrency),
            icon: HiOutlineBanknotes,
            color: "from-primary to-indigo-400",
          },
          {
            id: "yearly",
            label: t("dashboard.yearlySpending"),
            value: formatCurrency(stats.totalYearly, displayCurrency),
            icon: HiOutlineArrowTrendingUp,
            color: "from-accent to-pink-400",
          },
          {
            id: "active",
            label: t("dashboard.activeSubs"),
            value: stats.activeCount,
            icon: HiOutlineCreditCard,
            color: "from-success to-emerald-400",
          },
          {
            id: "renewal",
            label: t("dashboard.nextRenewal"),
            value: stats.nextRenewal ? `${stats.nextRenewal.daysUntil}d` : "—",
            subtext: stats.nextRenewal?.name,
            icon: HiOutlineCalendarDays,
            color: "from-warning to-amber-400",
          },
        ].map((card) => (
          <motion.div
            key={card.id}
            variants={itemAnim}
            className="glass-card p-4 sm:p-5 relative overflow-hidden group hover:shadow-card-hover transition-shadow duration-300"
          >
            <div
              className={`absolute top-0 right-0 w-20 h-20 rounded-bl-[40px] bg-gradient-to-br ${card.color} opacity-10 group-hover:opacity-20 transition-opacity`}
            />
            <div
              className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br ${card.color} mb-3`}
            >
              <card.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">
              {card.label}
            </p>
            <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
              {card.value}
            </p>
            {card.subtext && (
              <p className="text-xs text-gray-400 mt-1 truncate">
                {card.subtext}
              </p>
            )}
          </motion.div>
        ))}
      </div>

      {/* Financial Overview */}
      <FinancialOverview />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0">
        {/* Spending by Category */}
        <motion.div
          variants={itemAnim}
          className="glass-card p-5 w-full min-w-0 overflow-hidden"
        >
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            {t("dashboard.spendingByCategory")}
          </h3>
          {categoryData.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-10">
              {t("dashboard.noSubscriptionsYet")}
            </p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((_, i) => (
                      <Cell
                        key={i}
                        fill={CHART_COLORS[i % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--tooltip-bg, #fff)",
                      border: "none",
                      borderRadius: "12px",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                    }}
                    formatter={(val) => formatCurrency(val, displayCurrency)}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          {categoryData.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-2">
              {categoryData.map((item, i) => (
                <div
                  key={item.name}
                  className="flex items-center gap-1.5 text-xs"
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{
                      backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
                    }}
                  />
                  <span className="text-gray-600 dark:text-gray-400">
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Monthly Trend */}
        <motion.div
          variants={itemAnim}
          className="glass-card p-5 w-full min-w-0 overflow-hidden"
        >
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            {t("dashboard.monthlySpendingTrend")}
          </h3>
          <div className="h-64 -ml-2 overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={monthlyTrendData}
                margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
              >
                <defs>
                  <linearGradient
                    id="colorSpending"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                  strokeOpacity={0.5}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                  stroke="#94a3b8"
                />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" width={40} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "none",
                    borderRadius: "12px",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                  }}
                  formatter={(val) => formatCurrency(val, displayCurrency)}
                />
                <Area
                  type="monotone"
                  dataKey="spending"
                  stroke="#6366F1"
                  strokeWidth={2}
                  fill="url(#colorSpending)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Upcoming Renewals */}
      <motion.div variants={itemAnim} className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {t("dashboard.upcomingRenewals")}
          </h3>
          <Link
            to="/subscriptions"
            className="text-sm text-primary hover:underline"
          >
            {t("dashboard.viewAll")}
          </Link>
        </div>
        {stats.upcomingSorted.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">
            {t("dashboard.noUpcomingRenewals")}
          </p>
        ) : (
          <div className="space-y-3">
            {stats.upcomingSorted.map((sub) => {
              const cat = getCategoryById(sub.category);
              return (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                      style={{ backgroundColor: cat.color + "20" }}
                    >
                      {cat.icon}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-gray-900 dark:text-white">
                        {sub.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(sub.renewalDate)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">
                      {formatCurrency(sub.price, sub.currency)}
                    </p>
                    <p
                      className={`text-xs font-medium ${sub.daysUntil <= 3 ? "text-danger" : "text-warning"}`}
                    >
                      {sub.daysUntil === 0
                        ? t("dashboard.today")
                        : t("dashboard.days", { count: sub.daysUntil })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default DashboardPage;
