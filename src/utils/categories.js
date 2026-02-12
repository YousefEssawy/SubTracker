export const CATEGORIES = [
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
];

export const getCategoryById = (id) =>
  CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1];
