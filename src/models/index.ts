// Domain model interfaces & types — barrel re-export
// Import from "@/models" for clean usage across the app

export type { ISOString, DateString, CurrencyCode, CategoryId } from "./common";

export type {
  SubscriptionStatus,
  BillingCycle,
  Subscription,
  SubscriptionInput,
  SubscriptionUpdate,
} from "./subscription";

export type {
  TransactionType,
  AttachmentMeta,
  Transaction,
  TransactionInput,
  TransactionUpdate,
} from "./transaction";

export type { Space, SpaceInput, SpaceUpdate } from "./space";

export type {
  FinanceCategoryType,
  Category,
  CategoryInput,
  CategoryUpdate,
} from "./category";

export type {
  RecurrenceStatus,
  RecurrencePattern,
  Recurrence,
  RecurrenceInput,
  RecurrenceUpdate,
} from "./recurrence";

export type { Payment } from "./payment";

export type { CurrencyBalance, BalanceMap } from "./balance";

// Mapper functions
export {
  toSubscription,
  toTransaction,
  toSpace,
  toCategory,
  toRecurrence,
  toPayment,
} from "./mappers";
