import type { CategoryId } from "@/models/common";

/** A subscription category constant entry */
export interface SubscriptionCategory {
  id: CategoryId;
  name: string;
  icon: string;
  color: string;
}

export const CATEGORIES: readonly SubscriptionCategory[] = [
  { id: "streaming", name: "Streaming", icon: "🎬", color: "#EF4444" },
  { id: "software", name: "Software", icon: "💻", color: "#6366F1" },
  { id: "gaming", name: "Gaming", icon: "🎮", color: "#8B5CF6" },
  { id: "cloud", name: "Cloud & Storage", icon: "☁️", color: "#06B6D4" },
  { id: "ai", name: "AI Subscription", icon: "🤖", color: "#10B981" },
  { id: "news", name: "News & Media", icon: "📰", color: "#F59E0B" },
  { id: "health", name: "Health & Fitness", icon: "💪", color: "#EC4899" },
  { id: "education", name: "Education", icon: "📚", color: "#14B8A6" },
  { id: "utilities", name: "Utilities", icon: "⚡", color: "#F97316" },
  { id: "other", name: "Other", icon: "📦", color: "#64748B" },
] as const;

/**
 * Returns the category matching the given id.
 * Always returns a value — falls back to "other" if not found.
 */
export const getCategoryById = (id: string): SubscriptionCategory =>
  CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1];
