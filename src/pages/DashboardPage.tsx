import { useMemo, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useViewport } from "@/contexts/ViewportContext";
import { useSubscriptions } from "@/contexts/SubscriptionContext";
import { useTransactions } from "@/contexts/TransactionContext";
import RenewalDial from "@/components/ui/RenewalDial";
import { getCategoryById } from "@/utils/categories";
import { formatCurrency, convertCurrency } from "@/utils/currencies";
import {
  getMonthlyEquivalent,
  getDaysUntilRenewal,
  formatDate,
} from "@/utils/dateUtils";
import {
  HiOutlineArrowTrendingDown,
  HiOutlineArrowTrendingUp,
  HiOutlineArrowUpRight,
  HiOutlineArrowDownRight,
  HiOutlineArrowRight,
} from "react-icons/hi2";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { useTranslation } from "react-i18next";
import type { CurrencyCode } from "@/models";

// ─── Animated count-up figure ────────────────────────────────────────────────
const CountUp = ({
  value,
  currency,
  className = "",
}: {
  value: number;
  currency: CurrencyCode;
  className?: string;
}) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(value);
      return;
    }
    const duration = 700;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      setDisplay(value * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return (
    <span className={`figure ${className}`}>
      {formatCurrency(display, currency)}
    </span>
  );
};

// ─── Hero stat card (label · big value · delta line) ─────────────────────────
const StatCard = ({
  label,
  value,
  delta,
  deltaTone = "muted",
  deltaIcon,
}: {
  label: string;
  value: React.ReactNode;
  delta?: string;
  deltaTone?: "up" | "down" | "warn" | "muted";
  deltaIcon?: React.ReactNode;
}) => {
  const toneCls = {
    up: "text-success",
    down: "text-success",
    warn: "text-warning",
    muted: "text-gray-400 dark:text-gray-500",
  }[deltaTone];
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
      className="glass-card p-5"
    >
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
        {label}
      </p>
      <div className="mt-2 font-display text-3xl font-bold text-gray-900 dark:text-white">
        {value}
      </div>
      {delta && (
        <p
          className={`mt-2 inline-flex items-center gap-1 text-xs font-semibold ${toneCls}`}
        >
          {deltaIcon}
          {delta}
        </p>
      )}
    </motion.div>
  );
};

const DashboardPage = () => {
  const { user } = useAuth();
  const { activeSubscriptions, payments, loading } = useSubscriptions();
  const { balances } = useTransactions();
  const { isMobile } = useViewport();
  const { t, i18n } = useTranslation();
  const displayCurrency: CurrencyCode = "EGP";

  const firstName = (user?.displayName || user?.email || "there").split(
    /[\s@]/,
  )[0];
  const greetKey = (() => {
    const h = new Date().getHours();
    if (h < 12) return "morning";
    if (h < 18) return "afternoon";
    return "evening";
  })();

  const stats = useMemo(() => {
    const totalMonthly = activeSubscriptions.reduce((sum, sub) => {
      const monthly = getMonthlyEquivalent(
        sub.price,
        sub.billingCycle,
        sub.customCycleDays,
      );
      return (
        sum +
        convertCurrency(
          monthly,
          (sub.currency as CurrencyCode) || "EGP",
          displayCurrency,
        )
      );
    }, 0);

    const sorted = [...activeSubscriptions]
      .map((s) => ({ ...s, daysUntil: getDaysUntilRenewal(s.renewalDate) }))
      .filter((s) => s.daysUntil >= 0)
      .sort((a, b) => a.daysUntil - b.daysUntil);

    return {
      totalMonthly,
      totalYearly: totalMonthly * 12,
      activeCount: activeSubscriptions.length,
      nextRenewal: sorted[0] || null,
      upcoming: sorted.slice(0, 6),
    };
  }, [activeSubscriptions]);

  const income = balances[displayCurrency]?.income ?? 0;
  const expense = balances[displayCurrency]?.expense ?? 0;
  const flowMax = Math.max(income, expense, 1);
  const totalMonthly = stats.totalMonthly;

  const categoryData = useMemo(() => {
    const map: Record<string, { value: number; color: string }> = {};
    activeSubscriptions.forEach((sub) => {
      const cat = getCategoryById(sub.category);
      const monthly = convertCurrency(
        getMonthlyEquivalent(sub.price, sub.billingCycle, sub.customCycleDays),
        (sub.currency as CurrencyCode) || "EGP",
        displayCurrency,
      );
      if (!map[cat.name]) map[cat.name] = { value: 0, color: cat.color };
      map[cat.name]!.value += monthly;
    });
    return Object.entries(map)
      .map(([name, d]) => ({ name, value: Math.round(d.value), color: d.color }))
      .sort((a, b) => b.value - a.value);
  }, [activeSubscriptions]);

  const trendData = useMemo(() => {
    const months: { month: string; spending: number }[] = [];
    const now = new Date();
    const lang = i18n.language || "en";
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        month: d.toLocaleDateString(lang, { month: "short" }),
        spending: 0,
      });
    }
    payments.forEach((p) => {
      const label = new Date(p.paidDate).toLocaleDateString(lang, {
        month: "short",
      });
      const item = months.find((m) => m.month === label);
      if (item)
        item.spending += convertCurrency(
          p.amount,
          (p.currency as CurrencyCode) || "EGP",
          displayCurrency,
        );
    });
    if (payments.length === 0 && activeSubscriptions.length > 0) {
      months.forEach((m) => (m.spending = Math.round(totalMonthly)));
    }
    return months;
  }, [payments, activeSubscriptions, totalMonthly, i18n.language]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } },
  };
  const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6 pb-20 lg:pb-6"
    >
      {/* Greeting */}
      <motion.div variants={item}>
        <h1 className="font-display text-2xl sm:text-[28px] font-bold tracking-tight text-gray-900 dark:text-white">
          {t(`dashboard.greeting.${greetKey}`, {
            defaultValue:
              greetKey === "morning"
                ? "Good morning"
                : greetKey === "afternoon"
                  ? "Good afternoon"
                  : "Good evening",
          })}
          , {firstName}
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {t("dashboard.subtitle", "Here's what's happening with your money.")}
        </p>
      </motion.div>

      {/* Hero strip — 4 headline stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label={t("dashboard.monthlyBurnRate", "Monthly burn rate")}
          value={<CountUp value={stats.totalMonthly} currency={displayCurrency} />}
          delta={t("dashboard.perYearValue", {
            defaultValue: "{{value}} / year",
            value: formatCurrency(stats.totalYearly, displayCurrency),
          })}
          deltaTone="muted"
        />
        <StatCard
          label={t("dashboard.nextRenewal", "Next renewal")}
          value={
            stats.nextRenewal ? (
              stats.nextRenewal.daysUntil === 0 ? (
                t("dashboard.today", "Today")
              ) : (
                t("dashboard.daysValue", {
                  defaultValue: "{{count}} days",
                  count: stats.nextRenewal.daysUntil,
                })
              )
            ) : (
              "—"
            )
          }
          delta={
            stats.nextRenewal
              ? `${stats.nextRenewal.name} · ${formatCurrency(stats.nextRenewal.price, stats.nextRenewal.currency as CurrencyCode)}`
              : t("dashboard.noUpcomingRenewals", "No upcoming renewals")
          }
          deltaTone={
            stats.nextRenewal && stats.nextRenewal.daysUntil <= 3
              ? "warn"
              : "muted"
          }
        />
        <StatCard
          label={t("dashboard.monthlyIncome", "Income")}
          value={<CountUp value={income} currency={displayCurrency} />}
          delta={t("dashboard.totalIncome", "Total logged income")}
          deltaTone="up"
          deltaIcon={<HiOutlineArrowTrendingUp className="w-3.5 h-3.5" />}
        />
        <StatCard
          label={t("dashboard.monthlyExpense", "Expense")}
          value={<CountUp value={expense} currency={displayCurrency} />}
          delta={t("dashboard.totalExpense", "Total logged expense")}
          deltaTone="down"
          deltaIcon={<HiOutlineArrowTrendingDown className="w-3.5 h-3.5" />}
        />
      </div>

      {/* Main grid: left analysis column + right upcoming-renewals rail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6 min-w-0">
          {/* Dial + income vs expense */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <motion.div
              variants={item}
              className="glass-card p-5 flex flex-col items-center justify-center text-center"
            >
              <h3 className="self-start font-display font-semibold tracking-tight text-gray-900 dark:text-white mb-3">
                {t("dashboard.nextRenewal", "Next renewal")}
              </h3>
              {stats.nextRenewal ? (
                <>
                  <RenewalDial
                    icon={getCategoryById(stats.nextRenewal.category).icon}
                    iconColor={getCategoryById(stats.nextRenewal.category).color}
                    daysUntil={stats.nextRenewal.daysUntil}
                    billingCycle={stats.nextRenewal.billingCycle}
                    customCycleDays={stats.nextRenewal.customCycleDays}
                    size={128}
                  />
                  <p className="mt-3 font-semibold text-gray-900 dark:text-white truncate max-w-full">
                    {stats.nextRenewal.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                    {formatDate(stats.nextRenewal.renewalDate)}
                  </p>
                </>
              ) : (
                <p className="text-sm text-gray-400 py-10">
                  {t("dashboard.noUpcomingRenewals", "No upcoming renewals")}
                </p>
              )}
            </motion.div>

            <motion.div variants={item} className="glass-card p-5">
              <h3 className="font-display font-semibold tracking-tight text-gray-900 dark:text-white mb-4">
                {t("dashboard.incomeVsExpense", "Income vs expense")}
              </h3>
              <div className="space-y-5">
                <div>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="inline-flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                      <HiOutlineArrowUpRight className="w-4 h-4 text-success" />
                      {t("dashboard.monthlyIncome", "Income")}
                    </span>
                    <span className="figure font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(income, displayCurrency)}
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-success transition-all duration-500"
                      style={{ width: `${(income / flowMax) * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="inline-flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                      <HiOutlineArrowDownRight className="w-4 h-4 text-danger" />
                      {t("dashboard.monthlyExpense", "Expense")}
                    </span>
                    <span className="figure font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(expense, displayCurrency)}
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-danger transition-all duration-500"
                      style={{ width: `${(expense / flowMax) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {t("dashboard.netThisPeriod", "Net")}
                  </span>
                  <span
                    className={`figure font-bold ${income - expense >= 0 ? "text-success" : "text-danger"}`}
                  >
                    {income - expense >= 0 ? "+" : "-"}
                    {formatCurrency(Math.abs(income - expense), displayCurrency)}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Spending trend */}
          <motion.div
            variants={item}
            className="glass-card p-5 w-full min-w-0 overflow-hidden"
          >
            <h3 className="font-display font-semibold tracking-tight text-gray-900 dark:text-white mb-4">
              {t("dashboard.spendingTrend", "Spending trend")}
            </h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={trendData}
                  margin={{ top: 4, right: 4, left: isMobile ? 0 : -18, bottom: 0 }}
                >
                  <CartesianGrid
                    vertical={false}
                    strokeDasharray="3 3"
                    stroke="#e5e7eb"
                    strokeOpacity={0.4}
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11 }}
                    stroke="#94a3b8"
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    stroke="#94a3b8"
                    width={isMobile ? 0 : 44}
                    hide={isMobile}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(99,102,241,0.06)" }}
                    contentStyle={{
                      border: "none",
                      borderRadius: "12px",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                    }}
                    formatter={(v) =>
                      formatCurrency(v as number, displayCurrency)
                    }
                  />
                  <Bar dataKey="spending" radius={[6, 6, 0, 0]} maxBarSize={36}>
                    {trendData.map((_, i) => (
                      <Cell
                        key={i}
                        fill={
                          i === trendData.length - 1 ? "#F59E0B" : "#6366F1"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Spending by category */}
          {categoryData.length > 0 && (
            <motion.div variants={item} className="glass-card p-5">
              <h3 className="font-display font-semibold tracking-tight text-gray-900 dark:text-white mb-4">
                {t("dashboard.spendingByCategory", "Spending by category")}
              </h3>
              <div className="space-y-3">
                {categoryData.map((c) => (
                  <div key={c.name}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-300">
                        {c.name}
                      </span>
                      <span className="figure text-gray-900 dark:text-white">
                        {formatCurrency(c.value, displayCurrency)}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${(c.value / (categoryData[0]?.value || 1)) * 100}%`,
                          backgroundColor: c.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Upcoming renewals rail */}
        <motion.div variants={item} className="glass-card p-5 self-start">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold tracking-tight text-gray-900 dark:text-white">
              {t("dashboard.upcomingRenewals", "Upcoming renewals")}
            </h3>
            <Link
              to="/subscriptions"
              className="text-sm text-primary hover:underline"
            >
              {t("dashboard.viewAll", "View all")}
            </Link>
          </div>
          {stats.upcoming.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-10">
              {t("dashboard.noUpcomingRenewals", "No upcoming renewals")}
            </p>
          ) : (
            <div className="space-y-1">
              {stats.upcoming.map((sub) => {
                const cat = getCategoryById(sub.category);
                return (
                  <Link
                    key={sub.id}
                    to={`/subscriptions/${sub.id}`}
                    className="flex items-center gap-3 -mx-2 px-2 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <span
                      className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
                      style={{ backgroundColor: cat.color }}
                    >
                      {sub.name.charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                        {sub.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                        {formatDate(sub.renewalDate)}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="figure text-sm font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(sub.price, sub.currency as CurrencyCode)}
                      </p>
                      <p
                        className={`text-xs font-medium ${sub.daysUntil <= 3 ? "text-danger" : "text-warning"}`}
                      >
                        {sub.daysUntil === 0
                          ? t("dashboard.today", "Today")
                          : t("dashboard.daysValue", {
                              defaultValue: "{{count}} days",
                              count: sub.daysUntil,
                            })}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
          <Link
            to="/transactions"
            className="mt-4 flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          >
            {t("finance.balance.viewTransactions", "View transactions")}
            <HiOutlineArrowRight className="w-4 h-4 rtl:-scale-x-100" />
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DashboardPage;
