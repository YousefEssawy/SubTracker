/**
 * Predefined colour palette for spaces.
 * 12 curated, accessible hex colours.
 */
export const SPACE_COLORS = [
  "#6366F1", // Indigo
  "#8B5CF6", // Violet
  "#EC4899", // Pink
  "#EF4444", // Red
  "#F97316", // Orange
  "#F59E0B", // Amber
  "#10B981", // Emerald
  "#14B8A6", // Teal
  "#06B6D4", // Cyan
  "#3B82F6", // Blue
  "#64748B", // Slate
  "#84CC16", // Lime
];

/**
 * Predefined emoji icons for spaces.
 * 20 universally supported emoji.
 */
export const SPACE_ICONS = [
  "💼", // Briefcase — Work / Business
  "🏠", // House — Home / Personal
  "💰", // Money Bag — Savings / Wealth
  "🎓", // Graduation Cap — Education
  "✈️", // Airplane — Travel
  "🍽️", // Fork & Knife — Food & Dining
  "🏥", // Hospital — Health
  "💻", // Laptop — Tech
  "🎮", // Controller — Gaming / Hobbies
  "📱", // Mobile — Digital
  "🛒", // Shopping Cart — Shopping
  "🏦", // Bank — Banking / Finance
  "🚗", // Car — Transport
  "🎵", // Music — Entertainment
  "🌿", // Leaf — Wellness / Environment
  "🏋️", // Weight Lifter — Fitness
  "🧾", // Receipt — Expenses
  "🎁", // Gift — Gifts
  "📦", // Box — Other / General
  "⭐", // Star — Favourites
];

/** Returns the default color (first in palette) */
export const DEFAULT_SPACE_COLOR = SPACE_COLORS[0];

/** Returns the default icon (briefcase) */
export const DEFAULT_SPACE_ICON = SPACE_ICONS[0];
