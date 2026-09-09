/**
 * Shared demo data for the SubTracker UI kit — mirrors utils/categories.ts
 * and utils/currencies.ts in the source app, condensed for a click-through
 * demo (illustrative, not live data).
 */
const CATEGORIES = {
  streaming: { name: "Streaming", icon: "🎬", color: "#EF4444" },
  software: { name: "Software", icon: "💻", color: "#6366F1" },
  ai: { name: "AI Subscription", icon: "🤖", color: "#10B981" },
  cloud: { name: "Cloud & Storage", icon: "☁️", color: "#06B6D4" },
  gaming: { name: "Gaming", icon: "🎮", color: "#8B5CF6" },
  health: { name: "Health & Fitness", icon: "💪", color: "#EC4899" },
};

const SPACES = [
  { id: "personal", name: "Personal", icon: "💼", color: "#6366F1" },
  { id: "household", name: "Household", icon: "🏠", color: "#EC4899" },
];

const SUBSCRIPTIONS = [
  { id: "1", name: "Netflix", category: "streaming", price: 250, currency: "EGP", daysUntil: 2, billingCycle: "monthly", status: "active" },
  { id: "2", name: "ChatGPT Plus", category: "ai", price: 380, currency: "EGP", daysUntil: 12, billingCycle: "monthly", status: "active" },
  { id: "3", name: "iCloud+", category: "cloud", price: 45, currency: "EGP", daysUntil: 20, billingCycle: "monthly", status: "active" },
  { id: "4", name: "Adobe CC", category: "software", price: 620, currency: "EGP", daysUntil: -1, billingCycle: "monthly", status: "active" },
  { id: "5", name: "Xbox Game Pass", category: "gaming", price: 190, currency: "EGP", daysUntil: 27, billingCycle: "monthly", status: "active" },
  { id: "6", name: "Fitness+", category: "health", price: 90, currency: "EGP", daysUntil: 5, billingCycle: "monthly", status: "paused" },
];

const TRANSACTIONS = [
  { id: "t1", type: "Expense", category: "streaming", space: "household", amount: 250, currency: "EGP", date: "Jul 6" },
  { id: "t2", type: "Income", category: null, space: "personal", amount: 8500, currency: "EGP", date: "Jul 1", label: "Salary", icon: "💰", color: "#10B981" },
  { id: "t3", type: "Expense", category: "software", space: "personal", amount: 620, currency: "EGP", date: "Jun 29" },
  { id: "t4", type: "Expense", category: "ai", space: "personal", amount: 380, currency: "EGP", date: "Jun 24" },
];

const TREND = [420, 460, 440, 510, 490, 530, 500, 540, 560, 520, 570, 585];
const MONTH_LABELS = ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];

window.SubTrackerDemoData = { CATEGORIES, SPACES, SUBSCRIPTIONS, TRANSACTIONS, TREND, MONTH_LABELS };
