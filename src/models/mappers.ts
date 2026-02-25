import type { DocumentData } from "firebase/firestore";
import type { Subscription } from "./subscription";
import type { Transaction, AttachmentMeta } from "./transaction";
import type { Space } from "./space";
import type { Category } from "./category";
import type { Recurrence } from "./recurrence";
import type { Payment } from "./payment";
import type { CurrencyCode, CategoryId, ISOString, DateString } from "./common";
import type { SubscriptionStatus, BillingCycle } from "./subscription";
import type { TransactionType } from "./transaction";
import type { RecurrenceStatus, RecurrencePattern } from "./recurrence";

// ── Primitive helpers ──────────────────────────────────────────────────────

const asString = (v: unknown, fallback = ""): string =>
  typeof v === "string" ? v : fallback;

const asNullableString = (v: unknown): string | null =>
  typeof v === "string" ? v : null;

const asNumber = (v: unknown, fallback = 0): number =>
  typeof v === "number" && isFinite(v) ? v : fallback;

const asStringArray = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];

const asISOString = (v: unknown): ISOString =>
  typeof v === "string" ? v : new Date().toISOString();

const asCurrencyCode = (v: unknown): CurrencyCode => {
  const allowed: CurrencyCode[] = ["EGP", "USD", "EUR", "GBP", "SAR", "AED"];
  return allowed.includes(v as CurrencyCode) ? (v as CurrencyCode) : "EGP";
};

const asCategoryId = (v: unknown): CategoryId => {
  const allowed: CategoryId[] = [
    "streaming",
    "software",
    "gaming",
    "cloud",
    "ai",
    "news",
    "health",
    "education",
    "utilities",
    "other",
  ];
  return allowed.includes(v as CategoryId) ? (v as CategoryId) : "other";
};

const asSubscriptionStatus = (v: unknown): SubscriptionStatus => {
  const allowed: SubscriptionStatus[] = ["active", "paused", "cancelled"];
  return allowed.includes(v as SubscriptionStatus)
    ? (v as SubscriptionStatus)
    : "active";
};

const asBillingCycle = (v: unknown): BillingCycle => {
  const allowed: BillingCycle[] = ["monthly", "yearly", "weekly", "custom"];
  return allowed.includes(v as BillingCycle) ? (v as BillingCycle) : "monthly";
};

const asTransactionType = (v: unknown): TransactionType => {
  return v === "Income" || v === "Expense" ? v : "Expense";
};

const asRecurrenceStatus = (v: unknown): RecurrenceStatus => {
  return v === "active" || v === "paused" ? v : "active";
};

const asRecurrencePattern = (v: unknown): RecurrencePattern => {
  const allowed: RecurrencePattern[] = ["daily", "weekly", "monthly", "yearly"];
  return allowed.includes(v as RecurrencePattern)
    ? (v as RecurrencePattern)
    : "monthly";
};

const asAttachmentMeta = (v: unknown): AttachmentMeta | null => {
  if (v === null || v === undefined || typeof v !== "object") return null;
  const obj = v as Record<string, unknown>;
  return {
    name: asString(obj["name"]),
    size: asNumber(obj["size"]),
    type: asString(obj["type"]),
    ...(typeof obj["storagePath"] === "string"
      ? { storagePath: obj["storagePath"] }
      : {}),
  };
};

// ── Typed mapper functions ─────────────────────────────────────────────────

/**
 * Maps a raw Firestore document to a typed Subscription.
 * Handles missing/extra fields gracefully — no direct `as` casting.
 */
export function toSubscription(id: string, data: DocumentData): Subscription {
  return {
    id,
    name: asString(data["name"]),
    price: asNumber(data["price"]),
    currency: asCurrencyCode(data["currency"]),
    billingCycle: asBillingCycle(data["billingCycle"]),
    customCycleDays:
      typeof data["customCycleDays"] === "number"
        ? data["customCycleDays"]
        : null,
    renewalDate: asString(data["renewalDate"]) as DateString,
    category: asCategoryId(data["category"]),
    status: asSubscriptionStatus(data["status"]),
    paymentMethod: asNullableString(data["paymentMethod"]),
    notes: asNullableString(data["notes"]),
    createdAt: asISOString(data["createdAt"]),
    updatedAt: asISOString(data["updatedAt"]),
  };
}

/**
 * Maps a raw Firestore document to a typed Transaction.
 */
export function toTransaction(id: string, data: DocumentData): Transaction {
  return {
    id,
    spaceId: asString(data["spaceId"]),
    categoryId: asString(data["categoryId"]),
    type: asTransactionType(data["type"]),
    amount: asNumber(data["amount"]),
    currency: asCurrencyCode(data["currency"]),
    transactionDate: asString(data["transactionDate"]) as DateString,
    notes: asNullableString(data["notes"]),
    tags: asStringArray(data["tags"]),
    attachmentUrl: asNullableString(data["attachmentUrl"]),
    attachmentMeta: asAttachmentMeta(data["attachmentMeta"]),
    recurrenceId: asNullableString(data["recurrenceId"]),
    createdAt: asISOString(data["createdAt"]),
    updatedAt: asISOString(data["updatedAt"]),
  };
}

/**
 * Maps a raw Firestore document to a typed Space.
 */
export function toSpace(id: string, data: DocumentData): Space {
  return {
    id,
    name: asString(data["name"]),
    icon: asString(data["icon"]),
    color: asString(data["color"]),
    createdAt: asISOString(data["createdAt"]),
  };
}

/**
 * Maps a raw Firestore document to a typed Category.
 */
export function toCategory(id: string, data: DocumentData): Category {
  return {
    id,
    name: asString(data["name"]),
    type: asTransactionType(data["type"]) as TransactionType,
    icon: asString(data["icon"]),
    color: asString(data["color"]),
    createdAt: asISOString(data["createdAt"]),
  };
}

/**
 * Maps a raw Firestore document to a typed Recurrence.
 */
export function toRecurrence(id: string, data: DocumentData): Recurrence {
  return {
    id,
    spaceId: asString(data["spaceId"]),
    categoryId: asString(data["categoryId"]),
    type: asTransactionType(data["type"]),
    amount: asNumber(data["amount"]),
    currency: asCurrencyCode(data["currency"]),
    pattern: asRecurrencePattern(data["pattern"]),
    interval: asNumber(data["interval"], 1),
    startDate: asString(data["startDate"]) as DateString,
    endDate: asNullableString(data["endDate"]) as DateString | null,
    nextDate: asString(data["nextDate"]) as DateString,
    status: asRecurrenceStatus(data["status"]),
    createdAt: asISOString(data["createdAt"]),
  };
}

/**
 * Maps a raw Firestore document to a typed Payment (history entry).
 */
export function toPayment(id: string, data: DocumentData): Payment {
  return {
    id,
    subscriptionId: asString(data["subscriptionId"]),
    subscriptionName: asString(data["subscriptionName"]),
    amount: asNumber(data["amount"]),
    currency: asCurrencyCode(data["currency"]),
    paidDate: asString(data["paidDate"]) as DateString,
    paymentMethod: asNullableString(data["paymentMethod"]),
    createdAt: asISOString(data["createdAt"]),
  };
}
