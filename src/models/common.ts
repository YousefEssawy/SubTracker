/**
 * Shared primitive type aliases used across all domain models.
 * Import these rather than using raw `string` for typed domain fields.
 */

/** ISO 8601 date-time string, e.g. "2026-02-25T12:00:00.000Z" */
export type ISOString = string;

/** YYYY-MM-DD date-only string, e.g. "2026-02-25" */
export type DateString = string;

/** ISO 4217 currency code — restricted to the currencies supported by the app */
export type CurrencyCode = "EGP" | "USD" | "EUR" | "GBP" | "SAR" | "AED";

/**
 * ID of a subscription category.
 * Maps to the `id` field of entries in CATEGORIES constant.
 */
export type CategoryId =
  | "streaming"
  | "software"
  | "gaming"
  | "cloud"
  | "ai"
  | "news"
  | "health"
  | "education"
  | "utilities"
  | "other";
