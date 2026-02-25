import type { CurrencyCode, CategoryId, ISOString, DateString } from "./common";

/** Subscription lifecycle status */
export type SubscriptionStatus = "active" | "paused" | "cancelled";

/** How often the subscription renews */
export type BillingCycle = "monthly" | "yearly" | "weekly" | "custom";

/** A user's tracked recurring subscription */
export interface Subscription {
  id: string;
  name: string;
  price: number;
  currency: CurrencyCode;
  billingCycle: BillingCycle;
  /**
   * Number of days in the custom billing cycle.
   * Required when billingCycle === "custom". Null otherwise.
   */
  customCycleDays: number | null;
  /** Next renewal date in YYYY-MM-DD format */
  renewalDate: DateString;
  category: CategoryId;
  status: SubscriptionStatus;
  paymentMethod: string | null;
  notes: string | null;
  createdAt: ISOString;
  updatedAt: ISOString;
}

/**
 * Payload for creating a new subscription.
 * Server-generated fields (id, createdAt, updatedAt) are excluded.
 */
export type SubscriptionInput = Omit<
  Subscription,
  "id" | "createdAt" | "updatedAt"
>;

/**
 * Payload for updating an existing subscription.
 * All fields are optional — only changed fields need to be supplied.
 */
export type SubscriptionUpdate = Partial<SubscriptionInput>;
